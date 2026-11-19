import { NextApiRequest, NextApiResponse } from "next";
import { getUserDetails } from "@avatar-history/db";
import { isSnowflake, requireRole } from "../../../../utils/admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!(await requireRole(req, res, ["admin", "superadmin"]))) return;
  const { id } = req.query;
  const user = isSnowflake(id) ? await getUserDetails(id) : null;
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.status(200).json(user);
}
