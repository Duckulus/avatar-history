import { CommandInteraction } from "discord.js";
import { Command } from "./commandType";
import { overwriteCommands } from "./applicationCommand";
import { AvatarsCommand } from "./impl/avatars";
import { DefaultAvatarsCommand } from "./impl/default";

const commands: Command[] = [];

export const initCommands = async () => {
  register(AvatarsCommand);
  register(DefaultAvatarsCommand);
  await overwriteCommands(commands);
};

export const handleCommand = (interaction: CommandInteraction) => {
  const command = commands.find((cmd) => cmd.name == interaction.commandName);
  if (command) {
    command.execute(interaction, interaction.command!);
  }
};

const register = (command: Command) => {
  commands.push(command);
};
