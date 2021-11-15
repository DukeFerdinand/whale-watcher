import dotenv from 'dotenv'

import {Emoji} from "./constants/emoji";
import {useBot} from "./bot/bot";

// This option is here in case you don't care to look for a .env file
if (process.env.OVERRIDE_ENV !== 'override') {
  dotenv.config()
}

console.log(`[Process] Starting ${Emoji.WHALE} watcher!`)

async function main() {
  const {CONTRACT_ADDRESS} = process.env
  if (!CONTRACT_ADDRESS) {
    throw new Error('[Config] CONTRACT_ADDRESS is missing in ENV!')
  }

  const bot = await useBot();
}

main().catch((e) => {
  console.warn('[Process] Fatal error')
  console.error(e)
})