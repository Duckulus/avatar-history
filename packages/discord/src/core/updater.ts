import { ActivityType, APIGuildMember, Routes } from "discord-api-types/v10";
import { rest } from "../utils/rest";
import { GUILD_ID } from "@avatar-history/env";
import { updateAvatars } from "./avatars";
import { updateUsernames } from "./usernames";
import { client } from "./client";
import { getAvatars } from "@avatar-history/db";

export const update = async () => {
  const members = await fetchMembers();
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

const fetchMembers = async (): Promise<APIGuildMember[]> => {
  const LIMIT = 1000;
  let batch: APIGuildMember[] = [];
  const aggregated: APIGuildMember[] = []
  do {
    const query = new URLSearchParams();
    query.set("limit", LIMIT.toString());
    if (batch.length > 0) {
      const lastId = batch[batch.length - 1]!.user!.id;
      query.set("after", lastId)
    }

    batch = (await rest.get(Routes.guildMembers(GUILD_ID), {
      query: query,
    })) as APIGuildMember[];
    aggregated.push(...batch);
  } while (batch.length === LIMIT)
  return aggregated;
};
