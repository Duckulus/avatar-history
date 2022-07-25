import { Command } from "../commandType";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { getAvatars } from "@avatar-history/db";
import { Pagination } from "../../utils/pagination";
import { EmbedBuilder, TimestampStyles } from "discord.js";
import { cdn } from "../../utils/cdn";
import { timestamp } from "../../utils/timestamp";

export const AvatarsCommand: Command = {
  name: "avatars",
  description: "Shows all Avatars of a User",
  options: [
    {
      name: "user",
      description: "The User",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  execute: async (interaction) => {
    const user = interaction.options.getUser("user") || interaction.user;
    const userId = user.id;
    const avatars = (await getAvatars()).filter(
      (avatar) => avatar.userId == userId
    );
    if (avatars.length == 0) {
      await interaction.reply({
        content:
          "No avatars have been archived for this user yet! Try again later",
        ephemeral: true,
      });
      return;
    }
    const pages = avatars.map((avatar, index) => {
      return new EmbedBuilder()
        .setTitle(`${user!.username}'s Avatar History`)
        .setDescription(
          timestamp(avatar.createdAt, TimestampStyles.RelativeTime)
        )
        .setImage(cdn(avatar.id, avatar.userId))
        .setFooter({ text: `${index + 1}/${avatars.length}` })
        .setColor("Greyple");
    });
    await new Pagination(interaction, pages, undefined, true).start();
  },
};
