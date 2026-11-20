import { ApplicationCommandType, Routes } from "discord-api-types/v10";
import { rest } from "../utils/rest";
import { DISCORD_APPLICATION_ID } from "@avatar-history/env";
import { logger } from "@avatar-history/logging";
import { Command, SlashCommand } from "./commandType";

// command name -> id, known once the commands have been registered
const commandIds = new Map<string, string>();

// Clickable "</name:id>" mention of a slash command, or plain "`/name`" if the id is unknown
export const commandMention = (name: string) => {
  const id = commandIds.get(name);
  return id ? `</${name}:${id}>` : `\`/${name}\``;
};

export const overwriteCommands = async (commands: Command[]) => {
  const applicationCommands = commands.map((command) => {
    switch (command.type) {
      case ApplicationCommandType.ChatInput:
        return {
          name: command.name,
          description: (command as SlashCommand).description,
          options: (command as SlashCommand).options,
          type: ApplicationCommandType.ChatInput,
        };
      case ApplicationCommandType.User:
        return {
          name: command.name,
          type: ApplicationCommandType.User,
        };
    }
  });

  try {
    const registered = (await rest.put(Routes.applicationCommands(DISCORD_APPLICATION_ID), {
      body: applicationCommands,
    })) as { id: string; name: string; type: ApplicationCommandType }[];
    for (const command of registered) {
      if (command.type == ApplicationCommandType.ChatInput) commandIds.set(command.name, command.id);
    }
    logger.info("Succesfully owerwrote (/) Commands");
  } catch (e) {
    logger.error(e);
  }
};
