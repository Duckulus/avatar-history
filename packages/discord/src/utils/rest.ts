import { REST } from "@discordjs/rest";
import { DISCORD_TOKEN } from "@avatar-history/env";

export const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
