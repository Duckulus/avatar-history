import { Client, CommandInteraction } from "discord.js";
import { DISCORD_TOKEN } from "@avatar-history/env";
import { handleCommand, initCommands } from "./command/commandHandler";

export const client = new Client({ intents: [] });

export const createClient = async () => {
  await initCommands();

  client.on("ready", () => {
    if (client && client.user) console.log(`Logged in as ${client.user.tag}!`);
  });

  client.on("interactionCreate", (interaction) => {
    if (interaction.isChatInputCommand()) {
      handleCommand(interaction as CommandInteraction);
    }
  });

  await client.login(DISCORD_TOKEN);
};
