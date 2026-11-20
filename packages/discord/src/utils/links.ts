import { DISCORD_APPLICATION_ID } from "@avatar-history/env";

// Discord's install dialog. Lets people choose between adding the app to their
// account (user install) or to a server, depending on the installation
// contexts enabled in the developer portal.
export const installUrl = () =>
  `https://discord.com/oauth2/authorize?client_id=${DISCORD_APPLICATION_ID}`;
