import { SlashCommand, UserCommand } from "../commandType";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";
import { getAvatarsOfUser } from "@avatar-history/db";
import { WEB_URL } from "@avatar-history/env";
import { ACCENT_COLOR, Pagination } from "../../utils/pagination";
import {
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  TimestampStyles,
  User,
} from "discord.js";
import { cdn } from "../../utils/cdn";
import { timestamp } from "../../utils/timestamp";

const AVATARS_PER_PAGE = 4;

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
    await sendAvatarHistory(interaction, user);
  },
};

export const AvatarsContextCommand: UserCommand = {
  name: "Avatars",
  type: ApplicationCommandType.User,
  execute: async (interaction, user) => {
    await sendAvatarHistory(interaction, user);
  },
};

const sendAvatarHistory = async (interaction: CommandInteraction, user: User) => {
  // newest first
  const avatars = await getAvatarsOfUser(user.id);
  if (avatars.length == 0) {
    await interaction.reply({
      content: "No avatars have been archived for this user yet! Try again later",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const pageCount = Math.ceil(avatars.length / AVATARS_PER_PAGE);
  await new Pagination(interaction, pageCount, (page, nav) => {
    const start = page * AVATARS_PER_PAGE;
    const shown = avatars.slice(start, start + AVATARS_PER_PAGE).map((avatar, i) => ({
      avatar,
      // numbered chronologically like on the website
      number: avatars.length - start - i,
      url: cdn(avatar.id, avatar.userId),
    }));

    const header = new TextDisplayBuilder().setContent(
      `## ${user.username}'s avatars\n-# ${avatars.length} archived` +
        (pageCount > 1 ? ` · showing #${shown[shown.length - 1].number}–#${shown[0].number}` : "")
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
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          shown.map(({ avatar, number, url }) =>
            new MediaGalleryItemBuilder()
              .setURL(url)
              .setDescription(`Avatar #${number}, recorded ${avatar.createdAt.toDateString()}`)
          )
        )
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          shown
            .map(
              ({ avatar, number, url }) =>
                `**#${number}**${number == avatars.length ? " (latest)" : ""} · ` +
                `${timestamp(avatar.createdAt, TimestampStyles.LongDate)} ` +
                `(${timestamp(avatar.createdAt, TimestampStyles.RelativeTime)}) · [original](${url})`
            )
            .join("\n")
        )
      );

    if (nav) {
      container
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addActionRowComponents(nav);
    }
    return container;
  }).start();
};
