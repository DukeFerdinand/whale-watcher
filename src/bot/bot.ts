import {Client as BotClient, TextChannel} from "discord.js";
import {Emoji} from "../constants/emoji";
import {ActivityTypes} from "discord.js/typings/enums";
import {WhaleWatcher} from "../whaleService/whaleWatcher";
import {createWhaleEmbed} from "./embeds/WhaleTXEmbed";
import {TransactionStorage} from "../database/transactionStorage";

class Bot {
  private readonly bot: BotClient<true>;
  // Used as a safety buffer so we only have one routine accessing at a time
  private transactionsLock: boolean = false;
  private transactionInterval: NodeJS.Timeout | null = null;

  private readonly channel: string = '';
  private readonly guild: string = '';

  constructor(client: BotClient<true>) {
    const {TARGET_GUILD, TARGET_CHANNEL} = process.env
    if (!TARGET_GUILD || !TARGET_CHANNEL) {
      throw new Error('Cannot find either TARGET_GUILD or TARGET_CHANNEL')
    }
    this.bot = client
    this.channel = TARGET_CHANNEL
    this.guild = TARGET_GUILD
  }

  public checkBotStatus() {
    if (!this.bot.user) {
      throw new Error('Bot not initiated')
    }
  }

  public useChannel() {
    return this.bot?.channels.cache.get(this.channel)as TextChannel
  }

  static async createInstance(): Promise<BotClient<true>> {
    const {TARGET_GUILD, TARGET_CHANNEL} = process.env
    if (!TARGET_GUILD || !TARGET_CHANNEL) {
      throw new Error('Cannot find either TARGET_GUILD or TARGET_CHANNEL')
    }

    return new Promise(async (resolve) => {
      const bot = new BotClient({
        intents:[],
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
      await bot.login(process.env.BOT_TOKEN)
      await bot.on('ready', async (client) => {
        console.info(`[Bot] ${Emoji.ROBOT} Logged in as <${client.user.tag}>`);
        const guild = await bot.guilds.fetch(TARGET_GUILD);
        await guild.channels.fetch(TARGET_CHANNEL)

        resolve(bot)
      })
    })
  }

  public async startTransactionRoutine(contractAddress: string, timeoutInSeconds = 60) {
    console.info(`[Bot] ${Emoji.ROBOT} Starting transaction filter routine`)
    this.runTransactionRoutine(contractAddress).catch(e => console.error('[Bot] Error in transaction routine', e))
    this.transactionInterval = setInterval(() => {
      this.runTransactionRoutine(contractAddress).catch(e => console.error('[Bot] Error in transaction routine', e))
    }, timeoutInSeconds * 1000)
  }

  private async runTransactionRoutine(contractAddress: string) {
    if (!this.transactionsLock) {
      this.transactionsLock = true
      console.info(`[Bot] ${Emoji.ROBOT} Setting transaction lock`)

      // Run a watcher instance, getting latest transactions
      const watcher = new WhaleWatcher(contractAddress)

      // Use transaction service to get transactions
      const transactions = await watcher.getLatestTransactions()
      const whaleSightings = await watcher.findWhales(transactions)
      await watcher.logWhales(whaleSightings)

      // Save new sightings to DB
      const connection = await TransactionStorage.getConnection()
      const transactionStorage = new TransactionStorage('pitbull-coin', connection)
      const newSightings = await transactionStorage.storeNewTransactions(
          whaleSightings.map((sighting) => {
            if (!sighting.transaction) {
              throw new Error('[Bot] Got a whale sighting without a hash!')
            }

            return sighting.transaction.hash
          })
      )

      // Do nothing if there are no detected whales
      if (newSightings.length > 0) {
        console.warn(`[Watcher] ${newSightings.length} of these are new ${Emoji.WHALE} transactions!`)
        // Map all whale sightings into discord message embeds
        const embeds =
            whaleSightings
                .filter(w => {
                  return newSightings.includes(w.transaction?.hash as string)
                })
                .map((whale) => createWhaleEmbed(whale))

        // Grab a ref to the channel
        const channel = this.useChannel()

        // Else check if all will fit in one embed run, max is 10 per message
        if (newSightings.length < 10) {
          await channel.send({ content: `Found new ${Emoji.WHALE} transaction(s)`, embeds })
        } else {
          const splitEmbeds = []
          // Loop into sections of 10
          for (let i = 0; i < embeds.length; i += 10) {
            splitEmbeds.push(embeds.slice(i, i + 10));
          }

          // Now send each batch of embeds, numbered for convenience
          for (const [index, embedChunk] of splitEmbeds.entries()) {
            await channel.send({ content: `Update ${index + 1}/${splitEmbeds.length}`, embeds: embedChunk })
          }
        }
      } else {
        console.log(`[Bot] ${Emoji.ROBOT} No new ${Emoji.WHALE} transactions detected in boundaries.`)
      }



      this.transactionsLock = false
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