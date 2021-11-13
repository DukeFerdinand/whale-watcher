import dotenv from 'dotenv'

import {Emoji} from "./constants/emoji";
import {useBot} from "./bot/bot";

dotenv.config()

console.log(`[Process] Starting ${Emoji.WHALE} watcher!`)

async function main() {
  const {CONTRACT_ADDRESS} = process.env
  if (!CONTRACT_ADDRESS) {
    throw new Error('[Config] CONTRACT_ADDRESS is missing in ENV!')
  }

  const bot = await useBot();
  await bot.startTransactionRoutine(CONTRACT_ADDRESS)
}

main().catch((e) => {
  console.warn('[Process] Fatal error')
  console.error(e)
})