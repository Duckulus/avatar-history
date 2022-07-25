import { APIGuildMember } from "discord-api-types/v10";
import { createUsername, getUsernames } from "@avatar-history/db";
import { logger } from "@avatar-history/logging";

export const updateUsernames = async (members: APIGuildMember[]) => {
  const usernames = await getUsernames();
  for (const member of members) {
    const user = member.user!;
    const newestName = usernames.filter((name) => name.userId == user.id)[0];
    const value = `${user.username}#${user.discriminator}`;
    if (!newestName || newestName.value != value) {
      logger.info(`Updating Username for ${value}`);
      await createUsername(user.id, value);
    }
  }
};
