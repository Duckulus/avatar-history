import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";
import { SlashCommand } from "../commandType";
import { rest } from "../../utils/rest";
import {
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  TextDisplayBuilder,
} from "discord.js";
import { ACCENT_COLOR } from "../../utils/pagination";
import { promoFooter } from "../../utils/links";

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
    const variant = interaction.options.get("variant")!.value as number;
    const url = rest.cdn.defaultAvatar(variant);
    const container = new ContainerBuilder()
      .setAccentColor(ACCENT_COLOR)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## Default avatar ${variant}\n-# [original](${url})`)
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(url).setDescription(`Default avatar ${variant}`)
        )
      )
      .addTextDisplayComponents(promoFooter());
    await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  },
};
