import { getAvatarsOfUser, getProfileShare, getUsernamesOfUser } from "@avatar-history/db";
import { displayName } from "./sharedWrapped";

export interface SharedProfile {
  id: string;
  name: string;
  avatars: { id: string; userId: string; createdAt: string }[];
  usernames: { id: number; value: string; createdAt: string }[];
}

// Everything a public profile link shows: the visible avatars and the usernames,
// i.e. what the owner sees on their own avatars/usernames tabs. Hidden avatars stay hidden.
export const loadSharedProfile = async (id: string): Promise<SharedProfile | null> => {
  const share = await getProfileShare(id);
  if (!share) return null;
  const [avatars, usernames] = await Promise.all([
    getAvatarsOfUser(share.userId),
    getUsernamesOfUser(share.userId),
  ]);
  return {
    id: share.id,
    name: displayName(usernames[0]?.value),
    avatars: avatars.map((a) => ({ id: a.id, userId: a.userId, createdAt: a.createdAt.toISOString() })),
    usernames: usernames.map((u) => ({ id: u.id, value: u.value, createdAt: u.createdAt.toISOString() })),
  };
};
