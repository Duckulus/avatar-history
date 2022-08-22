import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";
import { SlashCommand } from "../commandType";
import { rest } from "../../utils/rest";

export const DefaultAvatarsCommand: SlashCommand = {
  name: "default",
  type: ApplicationCommandType.ChatInput,
  description: "Shows the default Discord Avatar",
  options: [
    {
      name: "variant",
      description: "The Avatars variant",
      type: ApplicationCommandOptionType.Integer,
      required: true,
      choices: [
        {
          name: "0",
          value: 0,
        },
        {
          name: "1",
          value: 1,
        },
        {
          name: "2",
          value: 2,
        },
        {
          name: "3",
          value: 3,
        },
        {
          name: "4",
          value: 4,
        },
        {
          name: "5",
          value: 5,
        },
      ],
    },
  ],
  execute: async (interaction) => {
    await interaction.reply({
      content: rest.cdn.defaultAvatar(
        interaction.options.get("variant")!.value as number
      ),
      ephemeral: true,
    });
  },
};
