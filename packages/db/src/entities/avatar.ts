import { prisma } from "../prisma";
import { createUser } from "./user";

// Never load the whole table per request: there are tens of thousands of avatars.

// Newest first. Soft deleted avatars are excluded unless includeDeleted is set.
export const getAvatarsOfUser = async (userId: string, includeDeleted = false) => {
  return await prisma.avatar.findMany({
    where: includeDeleted ? { userId } : { userId, deletedAt: null },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Ids of all avatars including soft deleted ones. The updater must know about
// deleted avatars too, otherwise it would try to re-create them.
export const getAvatarIds = async () => {
  const avatars = await prisma.avatar.findMany({ select: { id: true } });
  return new Set(avatars.map((avatar) => avatar.id));
};

export const countAvatars = async () => {
  return await prisma.avatar.count({ where: { deletedAt: null } });
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

export const setAvatarDeleted = async (
  id: string,
  deleted: boolean,
  deletedBy: string
) => {
  return await prisma.avatar.update({
    where: { id },
    data: deleted
      ? { deletedAt: new Date(), deletedBy }
      : { deletedAt: null, deletedBy: null },
  });
};
