import { NextApiRequest, NextApiResponse } from "next";
import { getAdminStats, getUserPage, UserSort } from "@avatar-history/db";
import { requireRole } from "../../../../utils/admin";

const SORTS: UserSort[] = ["recent", "avatars", "usernames", "hidden"];

// GET ?page=0&q=&sort=recent&dir=desc[&stats=1]
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!(await requireRole(req, res, ["admin", "superadmin"]))) return;

  const { page, q, sort, dir, stats } = req.query;
  const result = await getUserPage({
    page: Number(page) || 0,
    query: typeof q == "string" ? q.slice(0, 100) : "",
    sort: SORTS.includes(sort as UserSort) ? (sort as UserSort) : "recent",
    desc: dir != "asc",
  });
  res.status(200).json({
    ...result,
    stats: stats ? await getAdminStats() : undefined,
  });
}
