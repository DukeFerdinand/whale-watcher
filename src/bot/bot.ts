import { Client as BotClient } from "discord.js";

class Bot {
  private bot: BotClient;

  constructor(client: BotClient) {
    this.bot = client
  }

  static async createInstance(): Promise<BotClient<true>> {
    return new Promise((resolve) => {
      const bot = new BotClient({
        intents:[]
      })
      bot.on('ready', (client) => {
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