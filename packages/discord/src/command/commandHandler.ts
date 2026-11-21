import {
  ChatInputCommandInteraction,
  CommandInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";
import { Command, SlashCommand, UserCommand } from "./commandType";
import { overwriteCommands } from "./applicationCommand";
import { AvatarsCommand, AvatarsContextCommand } from "./impl/avatars";
import { DefaultAvatarsCommand } from "./impl/default";
import { UsernamesCommand, UsernamesConextCommand } from "./impl/usernames";
import { logger } from "@avatar-history/logging";
import { InfoCommand } from "./impl/info";
import { ApplicationCommandType } from "discord-api-types/v10";

const commands: Command[] = [];

export const initCommands = async () => {
  register(AvatarsCommand);
  register(AvatarsContextCommand);
  register(UsernamesCommand);
  register(UsernamesConextCommand);
  register(DefaultAvatarsCommand);
  register(InfoCommand);
  await overwriteCommands(commands);
};

// A failed command must never take the bot down. The usual failure is
// "Unknown interaction" (10062): Discord only accepts a reply within 3 seconds,
// which a slow or overloaded host can miss.
export const handleCommand = (interaction: CommandInteraction) => {
  execute(interaction).catch((e) =>
    logger.error(`Command '${interaction.commandName}' failed`, e)
  );
};

const execute = async (interaction: CommandInteraction) => {
  const command = commands.find((cmd) => cmd.name == interaction.commandName);
  if (command) {
    switch (interaction.commandType) {
      case ApplicationCommandType.ChatInput:
        logger.info(
          `/${command.name} Command executed by ${
            interaction.user.tag
          } with options: [${interaction.options.data
            .map((option) => {
              return `${option.name}: ${option.value}`;
            })
            .join(" ")}]`
        );
        await (command as SlashCommand).execute(
          interaction as ChatInputCommandInteraction,
          interaction.command!
        );
        break;
      case ApplicationCommandType.User:
        logger.info(
          `User Command '${interaction.commandName}' executed by ${
            interaction.user.tag
          } with user: ${
            (interaction as UserContextMenuCommandInteraction).targetUser.tag
          }`
        );
        await (command as UserCommand).execute(
          interaction as UserContextMenuCommandInteraction,
          (interaction as UserContextMenuCommandInteraction).targetUser
        );
    }
  }
};

const register = (command: Command) => {
  commands.push(command);
};
