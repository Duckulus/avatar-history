import {APIGuildMember} from "discord-api-types/v10";
import * as fs from "fs";
import axios from "axios";
import {createAvatar, getAvatarIds} from "@avatar-history/db";
import {logger} from "@avatar-history/logging";

export const updateAvatars = async (members: APIGuildMember[]) => {
  // includes soft deleted avatars so they are not re-created
  const known = await getAvatarIds();
  for (const member of members) {
    const user = member.user!;
    const avatarId = user.avatar;
    if (!avatarId || known.has(avatarId)) continue;
    logger.info("Downloading " + user.username);
    await downloadAvatar(avatarId, user.id);
    await createAvatar(avatarId, user.id);
    known.add(avatarId);
  }
};

const downloadAvatar = async (avatarId: string, userId: string) => {
  fs.mkdirSync(`../../static/avatars/${userId}`, {
    recursive: true,
  });
  const writer = fs.createWriteStream(
    `../../static/avatars/${userId}/${avatarId}.png`
  );
  try {
    let url = `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.png?size=4096`
    const response = await axios.get(
        url, {responseType: "stream"}
    );
    response.data.pipe(writer);
  } catch (err) {
    logger.error(err);
  }
};
