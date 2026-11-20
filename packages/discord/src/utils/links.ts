import { DISCORD_APPLICATION_ID, GUILD_INVITE, WEB_URL } from "@avatar-history/env";
import { TextDisplayBuilder } from "discord.js";

// Discord's install dialog. Lets people choose between adding the app to their
// account (user install) or to a server, depending on the installation
// contexts enabled in the developer portal.
export const installUrl = () =>
  `https://discord.com/oauth2/authorize?client_id=${DISCORD_APPLICATION_ID}`;

// Small links line at the bottom of every public command response, so people
// who see someone else use a command know where it comes from.
export const promoFooter = () => {
  const links: string[] = [];
  if (WEB_URL) links.push(`[Website](${WEB_URL})`);
  links.push(`[Add app](${installUrl()})`);
  if (GUILD_INVITE) links.push(`[Join the server](${GUILD_INVITE}) to start tracking your pfps`);
  return new TextDisplayBuilder().setContent(`-# avatarhistory · ${links.join(" · ")}`);
};
