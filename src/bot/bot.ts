import {Client as BotClient} from "discord.js";
import {Emoji} from "../constants/emoji";
import {ActivityTypes} from "discord.js/typings/enums";

class Bot {
  private bot: BotClient;

  constructor(client: BotClient) {
    this.bot = client
  }

  static async createInstance(): Promise<BotClient<true>> {
    return new Promise(async (resolve) => {
      const bot = new BotClient({
        intents:[],
        presence: {
          activities: [
            {
              name: `Hunting ${Emoji.WHALE}`,
              type: ActivityTypes.WATCHING,
              url: 'https://bscscan.com'
            }
          ]
        }
      })
      await bot.login(process.env.BOT_TOKEN)
      await bot.on('ready', (client) => {
        console.info(`[Bot] Logged in and ready. User id is: ${client.user.tag}`)

        resolve(bot)
      })
    })
  }
}

// This next bit is just a fancy way of keeping this variable around and accessible as a singleton
let bot: Bot;
export const useBot = async () => {
  console.log('[Bot] Using bot')
  if (bot) return bot;

  bot = new Bot(await Bot.createInstance());
  return bot;
}