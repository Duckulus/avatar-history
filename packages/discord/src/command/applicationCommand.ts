import { ApplicationCommandType, Routes } from "discord-api-types/v10";
import { rest } from "../utils/rest";
import { DISCORD_APPLICATION_ID } from "@avatar-history/env";
import { logger } from "@avatar-history/logging";
import { Command, SlashCommand } from "./commandType";

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
    await rest.put(Routes.applicationCommands(DISCORD_APPLICATION_ID), {
      body: applicationCommands,
    });
    logger.info("Succesfully owerwrote (/) Commands");
  } catch (e) {
    logger.error(e);
  }
};
