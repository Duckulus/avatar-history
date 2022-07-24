import { rest } from "./utils/rest";
import { APIGuildMember, Routes } from "discord-api-types/v10";
import { GUILD_ID } from "@avatar-history/env";
import * as fs from "fs";
import axios from "axios";
import { createAvatar, getAvatars } from "@avatar-history/db";

export const updateAvatars = async (limit: number) => {
  const members = await fetchMembers(limit);
  const avatars = await getAvatars();
  for (const member of members) {
    const user = member.user!;
    const newestAvatar = avatars.filter(
      (avatar) => avatar.userId == user.id
    )[0];
    const avatarId = user?.avatar;

    if (avatarId && (!newestAvatar || avatarId != newestAvatar.id)) {
      console.log("Downloading " + user.username);
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
    `../../static/avatars/${userId}/${avatarId}.webp`
  );
  const response = await axios.get(
    `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.webp`,
    { responseType: "stream" }
  );
  response.data.pipe(writer);
};

const fetchMembers = async (limit: number): Promise<APIGuildMember[]> => {
  const query = new URLSearchParams();
  query.set("limit", limit.toString());

  return (await rest.get(Routes.guildMembers(GUILD_ID), {
    query: query,
  })) as APIGuildMember[];
};
