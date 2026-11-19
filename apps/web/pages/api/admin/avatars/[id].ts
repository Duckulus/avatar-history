import { NextApiRequest, NextApiResponse } from "next";
import { prisma, setAvatarDeleted } from "@avatar-history/db";
import { requireRole } from "../../../../utils/admin";

// PATCH { deleted: boolean } soft deletes or restores an avatar
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "PATCH") {
    res.setHeader("Allow", "PATCH");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const adminId = await requireRole(req, res, ["admin", "superadmin"]);
  if (!adminId) return;

  const id = req.query.id as string;
  const { deleted } = req.body ?? {};
  if (typeof deleted != "boolean") {
    res.status(400).json({ error: "Body must be { deleted: boolean }" });
    return;
  }
  if (!(await prisma.avatar.findUnique({ where: { id } }))) {
    res.status(404).json({ error: "Avatar not found" });
    return;
  }
  res.status(200).json(await setAvatarDeleted(id, deleted, adminId));
}
