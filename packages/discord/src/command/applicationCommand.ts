import { Command } from "./commandType";
import { ApplicationCommandType, Routes } from "discord-api-types/v10";
import { rest } from "../utils/rest";
import { DISCORD_APPLICATION_ID } from "@avatar-history/env";
import { logger } from "@avatar-history/logging";

export const overwriteCommands = async (commands: Command[]) => {
  const slashCommands = commands.map((command) => {
    return {
      name: command.name,
      description: command.description,
      options: command.options,
      type: ApplicationCommandType.ChatInput,
    };
  });
  try {
    await rest.put(Routes.applicationCommands(DISCORD_APPLICATION_ID), {
      body: slashCommands,
    });
    logger.info("Succesfully owerwrote (/) Commands");
  } catch (e) {
    logger.error(e);
  }
};
