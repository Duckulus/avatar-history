import { getAvatarsOfUser, getUsernamesOfUser, getWrappedShare } from "@avatar-history/db";
import { computeWrapped, WrappedStats } from "./wrapped";
import { WrappedRank, wrappedRank } from "./rank";

export interface SharedWrapped {
  id: string;
  name: string;
  stats: WrappedStats;
  rank: WrappedRank;
}

// Discord's new usernames are stored as "name#0"
export const displayName = (username: string | undefined) =>
  username ? username.replace(/#0$/, "") : "Someone";

// Everything a public share link shows. Only the computed stats of the shared
// year leave the server, never the rest of the user's history. Computed in the
// server's time zone, so month boundaries may differ slightly from the owner's view.
export const loadSharedWrapped = async (id: string): Promise<SharedWrapped | null> => {
  const share = await getWrappedShare(id);
  if (!share) return null;
  const [avatars, usernames, rank] = await Promise.all([
    getAvatarsOfUser(share.userId),
    getUsernamesOfUser(share.userId),
    wrappedRank(share.userId, share.year),
  ]);
  const stats = computeWrapped(share.year, avatars, usernames);
  return {
    id: share.id,
    name: displayName(usernames[0]?.value),
    // dates as strings, like the API responses the page normally works with
    stats: JSON.parse(JSON.stringify(stats)),
    rank,
  };
};
