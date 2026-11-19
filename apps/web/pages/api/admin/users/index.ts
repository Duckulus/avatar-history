import { NextApiRequest, NextApiResponse } from "next";
import { getUserOverview } from "@avatar-history/db";
import { requireRole } from "../../../../utils/admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!(await requireRole(req, res, ["admin", "superadmin"]))) return;
  res.status(200).json(await getUserOverview());
}
