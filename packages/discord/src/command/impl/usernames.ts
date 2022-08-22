import { SlashCommand, UserCommand } from "../commandType";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";
import { getUsernames } from "@avatar-history/db";
import {
  CommandInteraction,
  EmbedBuilder,
  TimestampStyles,
  User,
} from "discord.js";
import { timestamp } from "../../utils/timestamp";
import { Pagination } from "../../utils/pagination";

export const UsernamesCommand: SlashCommand = {
  name: "usernames",
  type: ApplicationCommandType.ChatInput,
  description: "Shows all Usernames of a User",
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
    await sendUsernameEmbed(interaction, user);
  },
};

export const UsernamesConextCommand: UserCommand = {
  name: "Usernames",
  type: ApplicationCommandType.User,
  execute: async (interaction, user) => {
    await sendUsernameEmbed(interaction, user);
  },
};

const sendUsernameEmbed = async (
  interaction: CommandInteraction,
  user: User
) => {
  const usernames = (await getUsernames()).filter(
    (avatar) => avatar.userId == user.id
  );
  if (usernames.length == 0) {
    await interaction.reply({
      content:
        "No usernames have been archived for this user yet! Try again later",
      ephemeral: true,
    });
    return;
  }
  let namesPerPage = 5;
  let pages: EmbedBuilder[] = [];

  for (let i = 0; i < usernames.length; i += namesPerPage) {
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Username history`)
      .setColor("Greyple")
      .setFooter({
        text: `${i / namesPerPage + 1}/${Math.ceil(
          usernames.length / namesPerPage
        )}`,
      });
    for (let j = i; j < i + namesPerPage; j++) {
      if (usernames[j]) {
        embed.setDescription(
          (embed.data.description ? embed.data.description : "") +
            `\n ${timestamp(
              usernames[j].createdAt,
              TimestampStyles.RelativeTime
            )} ${usernames[j].value}`
        );
      }
    }
    pages.push(embed);
  }

  await new Pagination(interaction, pages, undefined, true).start();
};
