import {Client as BotClient, TextChannel} from "discord.js";
import {Emoji} from "../constants/emoji";
import {ActivityTypes} from "discord.js/typings/enums";
import {WhaleWatcher} from "../whaleService/whaleWatcher";

class Bot {
  private readonly bot: BotClient<true>;
  // Used as a safety buffer so we only have one routine accessing at a time
  private transactionsLock: boolean = false;
  private transactionInterval: NodeJS.Timeout | null = null;

  private channel: string = '';
  private guild: string = '';

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

  public async startTransactionRoutine(contractAddress: string, timeoutInSeconds = 2) {
    console.info(`[Bot] ${Emoji.ROBOT} Starting transaction filter routine`)
    this.transactionInterval = setInterval(() => {
      this.runTransactionRoutine(contractAddress).catch(e => console.error('[Bot] Error in transaction routine', e))
    }, timeoutInSeconds * 1000)
  }

  private async runTransactionRoutine(contractAddress: string) {
    if (!this.transactionsLock) {
      this.transactionsLock = true
      console.info(`[Bot] ${Emoji.ROBOT} Setting transaction lock`)
      // const watcher = new WhaleWatcher(contractAddress)
      //
      // const transactions = await watcher.getLatestTransactions()
      // const whales = await watcher.findWhales(transactions)
      // await watcher.logWhales(whales)
      const channel = (await this.bot?.channels.cache.get(this.channel)) as TextChannel

      await channel.send('test')

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