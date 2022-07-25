import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "./commandType";
import { overwriteCommands } from "./applicationCommand";
import { AvatarsCommand } from "./impl/avatars";
import { DefaultAvatarsCommand } from "./impl/default";
import { UsernamesCommand } from "./impl/usernames";
import { logger } from "@avatar-history/logging";

const commands: Command[] = [];

export const initCommands = async () => {
  register(AvatarsCommand);
  register(UsernamesCommand);
  register(DefaultAvatarsCommand);
  await overwriteCommands(commands);
};

export const handleCommand = (interaction: ChatInputCommandInteraction) => {
  const command = commands.find((cmd) => cmd.name == interaction.commandName);
  if (command) {
    logger.info(
      `/${command.name} Command executed by ${
        interaction.user.tag
      } with options: [${interaction.options.data
        .map((option) => {
          return `${option.name}: ${option.value}`;
        })
        .join(" ")}]`
    );
    command.execute(interaction, interaction.command!);
  }
};

const register = (command: Command) => {
  commands.push(command);
};
