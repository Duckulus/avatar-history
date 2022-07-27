import { prisma } from "../prisma";

export const userExists = async (id: string) => {
  return (await getUser(id)) != null;
};

export const createUser = async (id: string) => {
  const user = await getUser(id);
  if (!user) {
    return await prisma.discordUser.create({
      data: {
        id: id,
      },
    });
  }
  return user;
};

export const getUser = async (id: string) => {
  return await prisma.discordUser.findFirst({
    where: {
      id: id,
    },
  });
};
