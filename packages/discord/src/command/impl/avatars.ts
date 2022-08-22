import { SlashCommand, UserCommand } from "../commandType";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";
import { getAvatars } from "@avatar-history/db";
import { Pagination } from "../../utils/pagination";
import {
  CommandInteraction,
  EmbedBuilder,
  TimestampStyles,
  User,
} from "discord.js";
import { cdn } from "../../utils/cdn";
import { timestamp } from "../../utils/timestamp";

export const AvatarsCommand: SlashCommand = {
  name: "avatars",
  type: ApplicationCommandType.ChatInput,
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
    await sendAvatarEmbed(interaction, user);
  },
};

export const AvatarsContextCommand: UserCommand = {
  name: "Avatars",
  type: ApplicationCommandType.User,
  execute: async (interaction, user) => {
    await sendAvatarEmbed(interaction, user);
  },
};

const sendAvatarEmbed = async (interaction: CommandInteraction, user: User) => {
  const avatars = (await getAvatars()).filter(
    (avatar) => avatar.userId == user.id
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
      .setDescription(timestamp(avatar.createdAt, TimestampStyles.RelativeTime))
      .setImage(cdn(avatar.id, avatar.userId))
      .setFooter({ text: `${index + 1}/${avatars.length}` })
      .setColor("Greyple");
  });
  await new Pagination(interaction, pages, undefined, true).start();
};
