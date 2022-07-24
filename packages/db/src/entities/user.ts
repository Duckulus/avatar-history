import { prisma } from "../prisma";

export const userExists = async (id: string) => {
  return (await getUser(id)) != null;
};

export const createUser = async (id: string) => {
  const user = await getUser(id);
  if (!user) {
    return await prisma.user.create({
      data: {
        id: id,
      },
    });
  }
  return user;
};

export const getUser = async (id: string) => {
  return await prisma.user.findFirst({
    where: {
      id: id,
    },
  });
};
