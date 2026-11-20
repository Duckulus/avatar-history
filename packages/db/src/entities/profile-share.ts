import { randomBytes } from "crypto";
import { prisma } from "../prisma";

export const getProfileShare = async (id: string) => {
  return await prisma.profileShare.findUnique({ where: { id } });
};

export const getProfileShareOf = async (userId: string) => {
  return await prisma.profileShare.findUnique({ where: { userId } });
};

// Returns the existing share or creates one with an unguessable id
export const createProfileShare = async (userId: string) => {
  const existing = await getProfileShareOf(userId);
  if (existing) return existing;
  return await prisma.profileShare.create({
    data: { id: randomBytes(9).toString("base64url"), userId },
  });
};

export const deleteProfileShare = async (userId: string) => {
  await prisma.profileShare.deleteMany({ where: { userId } });
};
