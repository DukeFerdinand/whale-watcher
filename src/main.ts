import dotenv from 'dotenv'
import {WhaleWatcher} from "./whaleService/whaleWatcher";
import {Emoji} from "./constants/emoji";

dotenv.config()

console.log(`[Process] Starting ${Emoji.WHALE} watcher!`)

async function main() {
  const {CONTRACT_ADDRESS} = process.env
  if (!CONTRACT_ADDRESS) {
    throw new Error('[Config] CONTRACT_ADDRESS is missing in ENV!')
  }
  const watcher = new WhaleWatcher(CONTRACT_ADDRESS)

  await watcher.logWhale()
}

main().catch((e) => {
  console.warn('Caught an error')
  console.error(e)
})