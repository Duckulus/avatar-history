import { prisma } from "../prisma";
import { createUser } from "./user";

// Soft deleted avatars are excluded unless includeDeleted is set.
// The updater must include them, otherwise it would try to re-create a deleted avatar.
export const getAvatars = async (includeDeleted = false) => {
  return await prisma.avatar.findMany({
    where: includeDeleted ? undefined : { deletedAt: null },
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
