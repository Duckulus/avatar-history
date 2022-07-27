import { ActivityType, APIGuildMember, Routes } from "discord-api-types/v10";
import { rest } from "../utils/rest";
import { GUILD_ID } from "@avatar-history/env";
import { updateAvatars } from "./avatars";
import { updateUsernames } from "./usernames";
import { client } from "./client";
import { getAvatars } from "@avatar-history/db";

export const update = async (limit: number) => {
  const members = await fetchMembers(limit);
  const avatars = await getAvatars();
  client.user!.setPresence({
    status: "online",
    activities: [
      {
        type: ActivityType.Watching,
        name: `${members.length} Users and ${avatars.length} Avatars`,
      },
    ],
  });
  await updateAvatars(members);
  await updateUsernames(members);
};

const fetchMembers = async (limit: number): Promise<APIGuildMember[]> => {
  const query = new URLSearchParams();
  query.set("limit", limit.toString());

  return (await rest.get(Routes.guildMembers(GUILD_ID), {
    query: query,
  })) as APIGuildMember[];
};
