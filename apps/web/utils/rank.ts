import { countAvatarsPerUser, countUsers, prisma } from "@avatar-history/db";

export interface WrappedRank {
  year: number;
  // percentage of all tracked users that recorded fewer avatars in that year
  beatenPercent: number | null;
  trackedUsers: number;
}

// How a user's number of new avatars in a year compares to everyone else
export const wrappedRank = async (userId: string, year: number): Promise<WrappedRank> => {
  const from = new Date(Date.UTC(year, 0, 1));
  const to = new Date(Date.UTC(year + 1, 0, 1));
  const [counts, own, trackedUsers] = await Promise.all([
    countAvatarsPerUser(from, to),
    prisma.avatar.count({ where: { userId, deletedAt: null, createdAt: { gte: from, lt: to } } }),
    countUsers(),
  ]);

  // Everyone without an avatar that year recorded fewer, as did everyone below us.
  // Ties count as not beaten.
  const atLeast = counts.filter((count) => count >= own).length;
  const beaten = trackedUsers - atLeast;
  return {
    year,
    beatenPercent: own == 0 || trackedUsers <= 1 ? null : Math.floor((beaten / trackedUsers) * 100),
    trackedUsers,
  };
};

export const validYear = (value: unknown): number | null => {
  const year = Number(value);
  return Number.isInteger(year) && year >= 2000 && year <= 3000 ? year : null;
};
