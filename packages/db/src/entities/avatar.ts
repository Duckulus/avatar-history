import { prisma } from "../prisma";
import { createUser } from "./user";

export const getAvatars = async () => {
  return await prisma.avatar.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createAvatar = async (id: string, userId: string) => {
  await createUser(userId);
  await prisma.avatar.create({
    data: {
      id: id,
      userId: userId,
    },
  });
};
