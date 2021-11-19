import {Client as BotClient, Intents, TextChannel} from "discord.js";
import {Emoji} from "../constants/emoji";
import {ActivityTypes} from "discord.js/typings/enums";
import {WhaleWatcher} from "../whaleService/whaleWatcher";
import {createWhaleEmbed} from "./embeds/WhaleTXEmbed";
import {TransactionStorage} from "../database/transactionStorage";
import {startWhaleWatcher} from "./commands/startWhaleWatcher";
import {stopWhaleWatcher} from "./commands/stopWhaleWatcher";
import {CoinGecko} from "../coinGecko";

class Bot {
  public readonly client: BotClient<true>;
  // Used as a safety buffer so we only have one routine accessing at a time
  private transactionsLock: boolean = false;
  private transactionInterval: NodeJS.Timeout | null = null;

  private readonly coinGecko: CoinGecko;

  private readonly contract: string;
  private readonly channel: string = '';
  private readonly guild: string = '';

  constructor(client: BotClient<true>) {
    const {TARGET_GUILD, TARGET_CHANNEL, CONTRACT_ADDRESS} = process.env
    if (!TARGET_GUILD || !TARGET_CHANNEL) {
      throw new Error('Cannot find either TARGET_GUILD or TARGET_CHANNEL')
    }

    if (!CONTRACT_ADDRESS) throw new Error('Cannot track transactions, CONTRACT_ADDRESS missing in env')

    this.client = client
    this.contract = CONTRACT_ADDRESS
    this.channel = TARGET_CHANNEL
    this.guild = TARGET_GUILD

    this.coinGecko = new CoinGecko()
  }

  public get clientId() {
    return this.client.user.id
  }

  public checkBotStatus() {
    if (!this.client.user) {
      throw new Error('Bot not initiated')
    }
  }

  public useChannel() {
    return this.client?.channels.cache.get(this.channel)as TextChannel
  }

  public async destroy() {
    await this.client.destroy()
  }

  static async createInstance(): Promise<BotClient<true>> {
    const {TARGET_GUILD, TARGET_CHANNEL} = process.env
    if (!TARGET_GUILD || !TARGET_CHANNEL) {
      throw new Error('Cannot find either TARGET_GUILD or TARGET_CHANNEL')
    }

    return new Promise(async (resolve) => {
      // =====================================================
      // Create Bot
      // =====================================================
      const bot = new BotClient({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_INTEGRATIONS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_TYPING
        ],
        presence: {
          activities: [
            {
              name: `${Emoji.WHALE} Transactions`,
              type: ActivityTypes.WATCHING,
              url: 'https://bscscan.com'
            }
          ]
        }
      })

      // =====================================================
      // Register Commands
      // =====================================================
      console.log('[Bot Setup] registering commands')
      bot.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return

        const { commandName } = interaction

        if (commandName === 'w-start') {
          const started = await startWhaleWatcher(interaction)
          if (started) {
            await interaction.reply(`${Emoji.WHALE} Whale watch started!`)
          } else {
            await interaction.reply(`${Emoji.WHALE} Could not start, try calling 'w-stop' before restarting :)`)
          }
        }

        if (commandName === 'w-stop') {
          await stopWhaleWatcher(interaction)
          await interaction.reply(`${Emoji.WHALE} Whale watch stopped!`)
        }
      })

      // =====================================================
      // One-shot event listeners
      // =====================================================
      await bot.once('ready', async (client) => {
        console.info(`[Bot] ${Emoji.ROBOT} Logged in as <${client.user.tag}>`);
        const guild = await bot.guilds.fetch(TARGET_GUILD);
        await guild.channels.fetch(TARGET_CHANNEL)
      })

      // =====================================================
      // Finally, login and return the bot instance
      // =====================================================
      await bot.login(process.env.BOT_TOKEN)
      resolve(bot)
    })
  }

  // =====================================================
  // Start wrapper
  //
  // This runs the transaction scanner once to clear
  // massive lists, then acts as normal on subsequent
  // runs.
  // =====================================================
  public async startTransactionRoutine(timeoutInSeconds = 60) {
    // Can't start if it's already running
    if (this.transactionInterval === null) {
      console.info(`[Bot] ${Emoji.ROBOT} Starting transaction filter routine`)

      // Populate the first round of token prices
      await this.coinGecko.getTokenPrices();

      // Run it the first time, not logging output in case there are hundreds of matches
      this.runTransactionRoutine(this.contract, false).catch(e => console.error('[Bot] Error in transaction routine', e))

      this.transactionInterval = setInterval(() => {
        this.runTransactionRoutine(this.contract).catch(e => console.error('[Bot] Error in transaction routine', e))
      }, timeoutInSeconds * 1000)

      return true
    } else {
      return false
    }
  }

  public stopTransactionRoutine() {
    if (this.transactionInterval !== null) {
      clearInterval(this.transactionInterval)

      // Clear any transient state for clearing errors
      this.transactionInterval = null
      this.transactionsLock = false
    }
  }


  // =====================================================
  // Transaction Routine
  //
  // This is more or less a script that gets the data
  // we need, stores references to new whales, and
  // optionally sends some embeds.
  // =====================================================
  private async runTransactionRoutine(contractAddress: string, _sendMessages = true) {
    if (!this.transactionsLock) {
      this.transactionsLock = true
      try {
        console.info(`[Bot] ${Emoji.ROBOT} Setting transaction lock`)

        // Run a watcher instance, getting latest transactions
        const watcher = new WhaleWatcher(contractAddress)

        // Use transaction service to get transactions
        const transactions = await watcher.getLatestTransactions()
        let whaleSightings = await watcher.findWhales(transactions)

        // Add filters here as more are realized
        whaleSightings = whaleSightings.filter((sighting) => {
          // If both are a dex, it's probably some internal crap like pancake skimming
          return !(sighting.sender?.smartContract?.contractType === 'DEX' && sighting.receiver?.smartContract?.contractType === 'DEX')
        })

        await watcher.logWhales(whaleSightings)

        // Save new sightings to DB
        const connection = await TransactionStorage.getConnection()
        const transactionStorage = new TransactionStorage('pitbull-coin', connection)

        if (whaleSightings.length  === 0) {
          console.log(`[Bot] ${Emoji.ROBOT} No ${Emoji.WHALE} transactions detected in range.`)
          return
        }

        let newSightings = await transactionStorage.storeNewTransactions(
            whaleSightings.map((sighting) => {
              if (!sighting.transaction) {
                throw new Error('[Bot] Got a whale sighting without a hash!')
              }

              return sighting.transaction.hash
            })
        )

        // Do nothing if there are no detected whales
        if (newSightings.length > 0) {
          console.warn(`[Watcher] Found ${newSightings.length} new ${Emoji.WHALE} transactions!`)
        } else {
          console.log(`[Bot] ${Emoji.ROBOT} No new ${Emoji.WHALE} transactions detected.`)

          // Break early
          this.transactionsLock = false
          return
        }

        // Map all whale sightings into discord message embeds
        const newWhales =
            whaleSightings
                .filter(w => {
                  return newSightings.includes(w.transaction?.hash as string)
                })


        // Grab a ref to the channel
        const channel = this.useChannel()

        // Else check if all will fit in one embed run, max is 10 per message
        if (newWhales.length <= 5) {
          await channel.send({
            content: `Found new ${Emoji.WHALE} transaction(s)`,
            embeds: newWhales.map((whale) => createWhaleEmbed(whale, this.coinGecko.currentPrice))
          })
        } else {
          const topWhales = newWhales.sort((a, b) => {
            if (a.tokenTransferAmount > b.tokenTransferAmount) {
              return 1
            }
            if (a.tokenTransferAmount < b.tokenTransferAmount) {
              return -1
            }
            return 0
          })

          await channel.send({
            content: `Showing only top 5 of ${newSightings.length}`,
            embeds: topWhales.slice(0, 5).map((whale) => createWhaleEmbed(whale, this.coinGecko.currentPrice))
          })
        }

        this.transactionsLock = false
      } catch (e) {
        console.info(`[Bot] ${Emoji.ROBOT} Something broke! See below.`)
        console.error(e)
      } finally {
        console.info(`[Bot] ${Emoji.ROBOT} Removing lock on transaction process`)
        // Give up the lock when something breaks
        this.transactionsLock = false
      }
    } else {
      console.info(`[Bot] ${Emoji.ROBOT} Transaction still running`)
    }
  }
}

// This next bit is just a fancy way of keeping this variable in memory and accessible anywhere
let bot: Bot;
export const useBot = async () => {
  console.log(`[Bot] ${Emoji.ROBOT} Using bot`)
  if (bot) return bot;

  bot = new Bot(await Bot.createInstance());
  return bot;
}