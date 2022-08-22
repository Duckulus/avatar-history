import {
  ApplicationCommand,
  ChatInputCommandInteraction,
  User,
  UserContextMenuCommandInteraction,
} from "discord.js";
import {
  APIApplicationCommandOption,
  ApplicationCommandType,
} from "discord-api-types/v10";

export interface Command {
  name: string;
  type?: ApplicationCommandType;
}

export interface SlashCommand extends Command {
  description: string;
  execute: (
    interaction: ChatInputCommandInteraction,
    command: ApplicationCommand
  ) => void;
  options: APIApplicationCommandOption[];
}

export interface UserCommand extends Command {
  execute: (interaction: UserContextMenuCommandInteraction, user: User) => void;
}
