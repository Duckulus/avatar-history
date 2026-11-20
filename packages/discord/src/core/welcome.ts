import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  GuildMember,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
} from "discord.js";
import { GUILD_ID, WEB_URL, WELCOME_CHANNEL_ID } from "@avatar-history/env";
import { logger } from "@avatar-history/logging";
import { ACCENT_COLOR } from "../utils/pagination";
import { commandMention } from "../command/applicationCommand";
import { installUrl } from "../utils/links";

// Posted when someone joins the tracked guild, in WELCOME_CHANNEL_ID or the
// channel Discord posts its own join messages to.
export const welcome = async (member: GuildMember) => {
  if (member.guild.id != GUILD_ID || member.user.bot) return;

  const channel = WELCOME_CHANNEL_ID
    ? await member.client.channels.fetch(WELCOME_CHANNEL_ID).catch(() => null)
    : member.guild.systemChannel;
  if (!channel?.isSendable()) {
    logger.warn(`Cannot send welcome message for ${member.user.tag}: no sendable channel`);
    return;
  }

  const intro = new TextDisplayBuilder().setContent(
    `## Welcome, ${member}! 👋\n` +
      `You're member **#${member.guild.memberCount}**. From now on I'll archive every avatar ` +
      `and username you use, so you'll never lose an old pfp again.`
  );
  const container = new ContainerBuilder()
    .setAccentColor(ACCENT_COLOR)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(intro)
        .setThumbnailAccessory(
          new ThumbnailBuilder()
            .setURL(member.displayAvatarURL({ extension: "png", size: 256 }))
            .setDescription(`${member.user.username}'s avatar`)
        )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**What you can do**\n` +
          `🖼️ ${commandMention("avatars")} and ${commandMention("usernames")} show anyone's history\n` +
          `🌐 Sign in on the website for your timeline, a zip download and your yearly Wrapped\n` +
          `📲 Add me to your account to use the commands in any server or DM\n` +
          `-# Tracking only runs while you're on this server, so stick around!`
      )
    );

  const buttons: ButtonBuilder[] = [];
  if (WEB_URL) {
    buttons.push(
      new ButtonBuilder().setLabel("Open website").setEmoji("🌐").setStyle(ButtonStyle.Link).setURL(WEB_URL)
    );
  }
  buttons.push(
    new ButtonBuilder().setLabel("Add app").setEmoji("📲").setStyle(ButtonStyle.Link).setURL(installUrl())
  );
  container.addActionRowComponents(new ActionRowBuilder<ButtonBuilder>().addComponents(buttons));

  try {
    await channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { users: [member.id] },
    });
  } catch (e) {
    logger.error(`Failed to send welcome message for ${member.user.tag}`, e);
  }
};
