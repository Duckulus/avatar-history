import { NextApiRequest, NextApiResponse } from "next";
import {
  addAdmin,
  getAdmins,
  prisma,
  removeAdmin,
  SUPER_ADMIN_ID,
} from "@avatar-history/db";
import { isSnowflake, requireRole } from "../../../utils/admin";

// Only the super admin can list, grant and revoke admin rights
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const superAdminId = await requireRole(req, res, ["superadmin"]);
  if (!superAdminId) return;

  switch (req.method) {
    case "GET":
      break;
    case "POST": {
      const { discordId } = req.body ?? {};
      if (!isSnowflake(discordId)) {
        res.status(400).json({ error: "Invalid Discord id" });
        return;
      }
      if (discordId == SUPER_ADMIN_ID) {
        res.status(400).json({ error: "That is the super admin" });
        return;
      }
      await addAdmin(discordId, superAdminId);
      break;
    }
    case "DELETE": {
      const { discordId } = req.query;
      if (!isSnowflake(discordId)) {
        res.status(400).json({ error: "Invalid Discord id" });
        return;
      }
      await removeAdmin(discordId);
      break;
    }
    default:
      res.setHeader("Allow", "GET, POST, DELETE");
      res.status(405).json({ error: "Method not allowed" });
      return;
  }

  res.status(200).json(await listAdmins());
}

const listAdmins = async () => {
  const admins = await getAdmins();
  const ids = [SUPER_ADMIN_ID, ...admins.map((a) => a.discordId)];
  const usernames = await prisma.username.findMany({
    where: { userId: { in: ids } },
    orderBy: { createdAt: "desc" },
  });
  const avatars = await prisma.avatar.findMany({
    where: { userId: { in: ids }, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  const describe = (discordId: string) => ({
    discordId,
    username: usernames.find((u) => u.userId == discordId)?.value ?? null,
    avatar: avatars.find((a) => a.userId == discordId)?.id ?? null,
  });
  return {
    superAdmin: describe(SUPER_ADMIN_ID),
    admins: admins.map((admin) => ({
      ...describe(admin.discordId),
      createdAt: admin.createdAt,
      grantedBy: admin.grantedBy,
    })),
  };
};
