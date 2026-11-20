import { APIGuildMember } from "discord-api-types/v10";
import { createUsername, getLatestUsernames } from "@avatar-history/db";
import { logger } from "@avatar-history/logging";

// `progress` is updated as usernames are added, see updateAvatars
export const updateUsernames = async (
  members: APIGuildMember[],
  progress = { added: 0 }
) => {
  const latest = await getLatestUsernames();
  for (const member of members) {
    const user = member.user!;
    const value = `${user.username}#${user.discriminator}`;
    if (latest.get(user.id) != value) {
      logger.info(`Updating Username for ${value}`);
      await createUsername(user.id, value);
      latest.set(user.id, value);
      progress.added++;
    }
  }
  return progress;
};
