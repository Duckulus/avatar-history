import { SlashCommand } from "../commandType";
import {
  ActionRowBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { WEB_URL } from "@avatar-history/env";

export const InfoCommand: SlashCommand = {
  name: "info",
  type: ApplicationCommandType.ChatInput,
  description: "Displays infomation about me",
  options: [],
  execute: async (interaction) => {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setEmoji("🌐")
        .setLabel("Official Website")
        .setStyle(ButtonStyle.Link)
        .setURL(WEB_URL),
      new ButtonBuilder()
        .setEmoji("🖥️")
        .setLabel("Source Code")
        .setStyle(ButtonStyle.Link)
        .setURL("https://github.com/Duckulus/avatar-history")
    );
    await interaction.reply({
      content:
        "Hey, I can archive your Discord Avatar and Username History just by being in a server with you.",
      components: [row],
      ephemeral: true,
    });
  },
};
