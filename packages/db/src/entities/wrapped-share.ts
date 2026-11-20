import { randomBytes } from "crypto";
import { prisma } from "../prisma";

export const getWrappedShare = async (id: string) => {
  return await prisma.wrappedShare.findUnique({ where: { id } });
};

export const getWrappedShareOf = async (userId: string, year: number) => {
  return await prisma.wrappedShare.findUnique({ where: { userId_year: { userId, year } } });
};

// Returns the existing share of that year or creates one with an unguessable id
export const createWrappedShare = async (userId: string, year: number) => {
  const existing = await getWrappedShareOf(userId, year);
  if (existing) return existing;
  return await prisma.wrappedShare.create({
    data: { id: randomBytes(9).toString("base64url"), userId, year },
  });
};

export const deleteWrappedShare = async (userId: string, year: number) => {
  await prisma.wrappedShare.deleteMany({ where: { userId, year } });
};
