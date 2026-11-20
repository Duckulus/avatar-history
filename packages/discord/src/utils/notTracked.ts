import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  ContainerBuilder,
  MessageFlags,
  TextDisplayBuilder,
  User,
} from "discord.js";
import { GUILD_INVITE } from "@avatar-history/env";
import { ACCENT_COLOR } from "./pagination";
import { promoFooter } from "./links";

// Public reply for users without any archived history. Doubles as an invite,
// since this is what people see when they try the app on someone new.
export const replyNotTracked = async (
  interaction: CommandInteraction,
  user: User,
  what: "avatars" | "usernames"
) => {
  const self = user.id == interaction.user.id;
  const container = new ContainerBuilder()
    .setAccentColor(ACCENT_COLOR)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## No ${what} archived for ${user.username} yet\n` +
          (self
            ? "Your history is recorded from the moment you join the avatarhistory server. " +
              "Join now and every pfp and username you use from here on is saved forever."
            : `${user.username} isn't on the avatarhistory server, so nothing has been recorded yet. ` +
              "Invite them so their pfps stop getting lost!")
      )
    );
  if (GUILD_INVITE) {
    container.addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel(self ? "Join the server" : "Get the invite")
          .setEmoji("💬")
          .setStyle(ButtonStyle.Link)
          .setURL(GUILD_INVITE)
      )
    );
  }
  container.addTextDisplayComponents(promoFooter());
  await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
};
