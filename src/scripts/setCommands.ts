import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import {ApplicationCommandPermissions} from "discord.js";
import dotenv from "dotenv";

import {useBot} from "../bot/bot";

dotenv.config()

const { TARGET_GUILD, BOT_TOKEN, BOT_ID, ALLOWED_MANAGERS } = process.env;

if (!TARGET_GUILD || !BOT_TOKEN || !BOT_ID) {
  throw new Error('Cannot find one of: TARGET_GUILD, BOT_TOKEN, BOT_ID')
}

// Define the expected shape of the commands
const commands = [
  new SlashCommandBuilder().setDefaultPermission(ALLOWED_MANAGERS === "").setName('w-start').setDescription('Starts whale watcher'),
  new SlashCommandBuilder().setDefaultPermission(ALLOWED_MANAGERS === "").setName('w-stop').setDescription('Stops whale watcher'),
]
    .map(command => command.toJSON());

// Define async script
const main = async () => {
  console.log('Uploading new commands')
  const rest = new REST({ version: '9' }).setToken(`${BOT_TOKEN}`);

  await rest.put(Routes.applicationGuildCommands(BOT_ID, TARGET_GUILD), { body: commands })
      .then(() => console.log('Successfully registered application commands.'))
      .catch(console.error);

  if (ALLOWED_MANAGERS) {
    const bot = await useBot()

    const deployedCommands = await bot.client.guilds.cache.get(TARGET_GUILD)?.commands.fetch()

    if (!deployedCommands) {
      throw new Error('Cannot find deployed commands')
    }

    // Set permissions for only certain roles to use this bot (no random people)
    for (const command of deployedCommands.map(c => c)) {
      if (['w-start', 'w-stop'].includes(command.name)) {
        await command.permissions.set({
          permissions: ALLOWED_MANAGERS.split(',').map(manager => {
            const permission: ApplicationCommandPermissions = {
              type: 'ROLE',
              id: manager,
              permission: true
            }
            return permission
          })
        })
      }
    }

    // Log out, kill the connection
    await bot.destroy()
  }
}

main().catch(e => console.error(e))
