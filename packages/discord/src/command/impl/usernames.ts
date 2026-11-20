import { SlashCommand, UserCommand } from "../commandType";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";
import { getUsernamesOfUser } from "@avatar-history/db";
import {
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  SectionBuilder,
  ContainerBuilder,
  escapeMarkdown,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  TimestampStyles,
  User,
} from "discord.js";
import { timestamp } from "../../utils/timestamp";
import { ACCENT_COLOR, Pagination } from "../../utils/pagination";
import { WEB_URL } from "@avatar-history/env";
import { promoFooter } from "../../utils/links";
import { replyNotTracked } from "../../utils/notTracked";

const NAMES_PER_PAGE = 10;

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
    await sendUsernameHistory(interaction, user);
  },
};

export const UsernamesConextCommand: UserCommand = {
  name: "Usernames",
  type: ApplicationCommandType.User,
  execute: async (interaction, user) => {
    await sendUsernameHistory(interaction, user);
  },
};

const sendUsernameHistory = async (interaction: CommandInteraction, user: User) => {
  // newest first
  const usernames = await getUsernamesOfUser(user.id);
  if (usernames.length == 0) {
    await replyNotTracked(interaction, user, "usernames");
    return;
  }

  const pageCount = Math.ceil(usernames.length / NAMES_PER_PAGE);
  await new Pagination(interaction, pageCount, (page, nav) => {
    const start = page * NAMES_PER_PAGE;
    const lines = usernames
      .slice(start, start + NAMES_PER_PAGE)
      .map(
        (username, i) =>
          `**${escapeMarkdown(username.value)}**${start + i == 0 ? " (current)" : ""}\n` +
          `-# since ${timestamp(username.createdAt, TimestampStyles.LongDate)} ` +
          `(${timestamp(username.createdAt, TimestampStyles.RelativeTime)})`
      );

    const header = new TextDisplayBuilder().setContent(
      `## ${user.username}'s usernames\n-# ${usernames.length} archived`
    );
    const container = new ContainerBuilder().setAccentColor(ACCENT_COLOR);
    if (WEB_URL) {
      container.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(header)
          .setButtonAccessory(
            new ButtonBuilder().setLabel("Website").setStyle(ButtonStyle.Link).setURL(WEB_URL)
          )
      );
    } else {
      container.addTextDisplayComponents(header);
    }
    container
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join("\n")));

    if (nav) {
      container
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addActionRowComponents(nav);
    }
    return container.addTextDisplayComponents(promoFooter());
  }).start();
};
