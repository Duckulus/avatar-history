import { ApplicationCommand, ChatInputCommandInteraction } from "discord.js";
import { APIApplicationCommandOption } from "discord-api-types/v10";

export type Command = {
  name: string;
  description: string;
  execute: (
    interaction: ChatInputCommandInteraction,
    command: ApplicationCommand
  ) => void;
  options: APIApplicationCommandOption[];
};
