import { APIGuildMember, Routes } from "discord-api-types/v10";
import { rest } from "../utils/rest";
import { GUILD_ID } from "@avatar-history/env";
import { updateAvatars } from "./avatars";
import { updateUsernames } from "./usernames";

export const update = async (limit: number) => {
  const members = await fetchMembers(limit);
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
