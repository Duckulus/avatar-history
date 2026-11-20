import { SlashCommand } from "../commandType";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { GUILD_INVITE, WEB_URL } from "@avatar-history/env";
import { installUrl } from "../../utils/links";
import {
  ApplicationCommandType,
} from "discord-api-types/v10";

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
        .setURL("https://github.com/Duckulus/avatar-history"),
      new ButtonBuilder()
        .setEmoji("📲")
        .setLabel("Add app")
        .setStyle(ButtonStyle.Link)
        .setURL(installUrl())
    );
    if (GUILD_INVITE) {
      row.addComponents(
        new ButtonBuilder()
          .setEmoji("💬")
          .setLabel("Join the server")
          .setStyle(ButtonStyle.Link)
          .setURL(GUILD_INVITE)
      );
    }
    await interaction.reply({
      content:
        "Hey, I archive the avatar and username history of everyone on the avatarhistory server. " +
        "Join it to start tracking yours, then look it up with `/avatars` and `/usernames` " +
        "or on the website. Add me to your account to use my commands in any server or DM.",
      components: [row],
    });
  },
};
