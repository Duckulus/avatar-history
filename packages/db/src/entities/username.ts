import { prisma } from "../prisma";
import { createUser } from "./user";

// Newest first
export const getUsernamesOfUser = async (userId: string) => {
  return await prisma.username.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Current (newest) username per user id
export const getLatestUsernames = async () => {
  const usernames = await prisma.username.findMany({
    select: { userId: true, value: true },
    orderBy: { createdAt: "desc" },
  });
  const latest = new Map<string, string>();
  for (const username of usernames) {
    if (!latest.has(username.userId)) latest.set(username.userId, username.value);
  }
  return latest;
};

export const createUsername = async (userId: string, value: string) => {
  await createUser(userId);
  await prisma.username.create({
    data: {
      userId: userId,
      value: value,
    },
  });
};
