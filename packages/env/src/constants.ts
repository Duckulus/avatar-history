require("dotenv").config({
  path: "../../.env",
});

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || "";
export const GUILD_ID = process.env.GUILD_ID || "";

export const CDN_PORT = process.env.CDN_PORT || 7777;
