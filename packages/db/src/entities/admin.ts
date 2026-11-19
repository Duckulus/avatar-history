import { prisma } from "../prisma";

export const SUPER_ADMIN_ID = "347130390181445633";

export type Role = "superadmin" | "admin" | "user";

export const getRole = async (discordId: string): Promise<Role> => {
  if (discordId == SUPER_ADMIN_ID) return "superadmin";
  const admin = await prisma.admin.findUnique({ where: { discordId } });
  return admin ? "admin" : "user";
};

export const getAdmins = async () => {
  return await prisma.admin.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const addAdmin = async (discordId: string, grantedBy: string) => {
  return await prisma.admin.upsert({
    where: { discordId },
    create: { discordId, grantedBy },
    update: {},
  });
};

export const removeAdmin = async (discordId: string) => {
  await prisma.admin.deleteMany({ where: { discordId } });
};
