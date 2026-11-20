import { ActivityType, APIGuildMember, Routes } from "discord-api-types/v10";
import { rest } from "../utils/rest";
import { GUILD_ID } from "@avatar-history/env";
import { updateAvatars } from "./avatars";
import { updateUsernames } from "./usernames";
import { client } from "./client";
import { countAvatars, countUsers, pruneUpdateRuns, recordUpdateRun } from "@avatar-history/db";
import { logger } from "@avatar-history/logging";

let running = false;
let runsSincePrune = 0;

// Called every 30s by cron. Runs are skipped while the previous one is still
// in progress so slow runs can't pile up.
export const update = async () => {
  if (running) {
    logger.warn("Previous update still running, skipping");
    return;
  }
  running = true;
  const startedAt = new Date();
  const avatars = { added: 0, failedDownloads: 0 };
  const usernames = { added: 0 };
  let members = 0;
  let error: string | null = null;
  try {
    members = await runUpdate(avatars, usernames);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    logger.error("Update failed", e);
  } finally {
    running = false;
  }
  // stats for the health page of the admin panel; never let them break the loop
  try {
    await recordUpdateRun({
      startedAt,
      durationMs: Date.now() - startedAt.getTime(),
      members,
      newAvatars: avatars.added,
      newUsernames: usernames.added,
      failedDownloads: avatars.failedDownloads,
      error,
    });
    if (++runsSincePrune >= 120) {
      runsSincePrune = 0;
      await pruneUpdateRuns();
    }
  } catch (e) {
    logger.error("Could not record update run", e);
  }
};

const runUpdate = async (
  avatarProgress: { added: number; failedDownloads: number },
  usernameProgress: { added: number }
) => {
  const members = await fetchMembers();
  const [userCount, avatarCount] = await Promise.all([countUsers(), countAvatars()]);
  client.user!.setPresence({
    status: "online",
    activities: [
      {
        type: ActivityType.Watching,
        name: `${userCount} Users and ${avatarCount} Avatars`,
      },
    ],
  });
  await updateAvatars(members, avatarProgress);
  await updateUsernames(members, usernameProgress);
  return members.length;
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
