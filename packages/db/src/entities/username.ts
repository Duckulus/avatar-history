import { prisma } from "../prisma";
import { createUser } from "./user";

export const getUsernames = async () => {
  return await prisma.username.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
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
