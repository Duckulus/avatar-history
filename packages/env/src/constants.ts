import * as process from "process";

require("dotenv").config({
  path: "../../.env",
});

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || "";
export const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID || "";
export const GUILD_ID = process.env.GUILD_ID || "";

export const CDN_PORT = process.env.CDN_PORT || 7777;
export const CDN_URL = process.env.CDN_URL || "";
