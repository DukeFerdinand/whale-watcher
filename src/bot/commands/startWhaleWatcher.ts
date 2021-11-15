import {Interaction, Message, Snowflake} from "discord.js";
import {useBot} from "../bot";

export async function startWhaleWatcher(i: Interaction) {
  const bot = await useBot()
  await bot.startTransactionRoutine()
}