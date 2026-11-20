import { Client, CommandInteraction, Events, GatewayIntentBits } from "discord.js";
import { DISCORD_TOKEN } from "@avatar-history/env";
import { handleCommand, initCommands } from "../command/commandHandler";
import { logger } from "@avatar-history/logging";
import { welcome } from "./welcome";

// GuildMembers is privileged and must be enabled in the developer portal. The
// updater's member listing already needs it.
export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

export const createClient = async () => {
  await initCommands();

  client.on("ready", () => {
    if (client && client.user) logger.info(`Logged in as ${client.user.tag}!`);
  });

  client.on(Events.GuildMemberAdd, (member) => {
    welcome(member).catch((e) => logger.error(e));
  });

  client.on("interactionCreate", (interaction) => {
    handleCommand(interaction as CommandInteraction);
  });

  await client.login(DISCORD_TOKEN);
};
