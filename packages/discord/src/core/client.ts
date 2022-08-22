import { Client, CommandInteraction } from "discord.js";
import { DISCORD_TOKEN } from "@avatar-history/env";
import { handleCommand, initCommands } from "../command/commandHandler";
import { logger } from "@avatar-history/logging";

export const client = new Client({ intents: [] });

export const createClient = async () => {
  await initCommands();

  client.on("ready", () => {
    if (client && client.user) logger.info(`Logged in as ${client.user.tag}!`);
  });

  client.on("interactionCreate", (interaction) => {
    handleCommand(interaction as CommandInteraction);
  });

  await client.login(DISCORD_TOKEN);
};
