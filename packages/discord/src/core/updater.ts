import { ActivityType, APIGuildMember, Routes } from "discord-api-types/v10";
import { rest } from "../utils/rest";
import { GUILD_ID } from "@avatar-history/env";
import { updateAvatars } from "./avatars";
import { updateUsernames } from "./usernames";
import { client } from "./client";
import { countAvatars } from "@avatar-history/db";
import { logger } from "@avatar-history/logging";

let running = false;

// Called every 30s by cron. Runs are skipped while the previous one is still
// in progress so slow runs can't pile up.
export const update = async () => {
  if (running) {
    logger.warn("Previous update still running, skipping");
    return;
  }
  running = true;
  try {
    await runUpdate();
  } finally {
    running = false;
  }
};

const runUpdate = async () => {
  const members = await fetchMembers();
  const avatarCount = await countAvatars();
  client.user!.setPresence({
    status: "online",
    activities: [
      {
        type: ActivityType.Watching,
        name: `${members.length} Users and ${avatarCount} Avatars`,
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
