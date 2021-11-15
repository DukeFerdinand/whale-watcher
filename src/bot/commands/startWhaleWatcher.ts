import {Interaction} from "discord.js";
import {useBot} from "../bot";

export async function startWhaleWatcher(i: Interaction) {
  const bot = await useBot()
  return await bot.startTransactionRoutine()
}