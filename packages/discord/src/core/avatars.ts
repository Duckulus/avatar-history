import {APIGuildMember} from "discord-api-types/v10";
import * as fs from "fs";
import axios from "axios";
import {createAvatar, getAvatars} from "@avatar-history/db";
import {logger} from "@avatar-history/logging";

export const updateAvatars = async (members: APIGuildMember[]) => {
  const avatars = await getAvatars();
  for (const member of members) {
    const user = member.user!;
    const newestAvatar = avatars.filter(
      (avatar) => avatar.userId == user.id
    )[0];
    const avatarId = user?.avatar;
    if (avatars.filter((a) => a.id == avatarId).length > 0) continue;
    if (avatarId && (!newestAvatar || avatarId != newestAvatar.id)) {
      logger.info("Downloading " + user.username);
      await downloadAvatar(avatarId, user.id);
      await createAvatar(avatarId, user.id);
    }
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
