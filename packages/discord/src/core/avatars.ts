import {APIGuildMember} from "discord-api-types/v10";
import * as fs from "fs";
import {pipeline} from "stream/promises";
import axios from "axios";
import {createAvatar, getAvatarIds} from "@avatar-history/db";
import {logger} from "@avatar-history/logging";

export interface AvatarUpdate {
  added: number;
  failedDownloads: number;
}

// `progress` is updated as avatars are added, so a run that fails halfway still
// reports what it did
export const updateAvatars = async (
    members: APIGuildMember[],
    progress: AvatarUpdate = {added: 0, failedDownloads: 0}
) => {
  // includes soft deleted avatars so they are not re-created
  const known = await getAvatarIds();
  for (const member of members) {
    const user = member.user!;
    const avatarId = user.avatar;
    if (!avatarId || known.has(avatarId)) continue;
    logger.info("Downloading " + user.username);
    if (!(await downloadAvatar(avatarId, user.id))) progress.failedDownloads++;
    // recorded even if the download failed, like before
    await createAvatar(avatarId, user.id);
    known.add(avatarId);
    progress.added++;
  }
  return progress;
};

const downloadAvatar = async (avatarId: string, userId: string) => {
  fs.mkdirSync(`../../static/avatars/${userId}`, {
    recursive: true,
  });
  try {
    const url = `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.png?size=4096`;
    const response = await axios.get(url, {responseType: "stream"});
    await pipeline(response.data, fs.createWriteStream(`../../static/avatars/${userId}/${avatarId}.png`));
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
};
