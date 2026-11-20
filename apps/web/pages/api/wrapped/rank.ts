import { NextApiRequest, NextApiResponse } from "next";
import { countAvatarsPerUser, countUsers, prisma } from "@avatar-history/db";
import { getDiscordId } from "../../../utils/id";

export interface WrappedRank {
  year: number;
  // percentage of all tracked users that recorded fewer avatars in that year
  beatenPercent: number | null;
  trackedUsers: number;
}

// How the signed in user's number of new avatars in a year compares to everyone else
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = await getDiscordId(req, res);
  if (!id) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  const year = Number(req.query.year);
  if (!Number.isInteger(year) || year < 2000 || year > 3000) {
    res.status(400).json({ error: "Invalid year" });
    return;
  }

  const from = new Date(Date.UTC(year, 0, 1));
  const to = new Date(Date.UTC(year + 1, 0, 1));
  const [counts, own, trackedUsers] = await Promise.all([
    countAvatarsPerUser(from, to),
    prisma.avatar.count({ where: { userId: id, deletedAt: null, createdAt: { gte: from, lt: to } } }),
    countUsers(),
  ]);

  // Everyone without an avatar that year recorded fewer, as did everyone below us.
  // Ties count as not beaten.
  const atLeast = counts.filter((count) => count >= own).length;
  const beaten = trackedUsers - atLeast;
  const result: WrappedRank = {
    year,
    beatenPercent: own == 0 || trackedUsers <= 1 ? null : Math.floor((beaten / trackedUsers) * 100),
    trackedUsers,
  };
  res.setHeader("Cache-Control", "private, max-age=300");
  res.json(result);
}
