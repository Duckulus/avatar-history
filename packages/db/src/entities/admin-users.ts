import { prisma } from "../prisma";

// Overview of every tracked Discord user for the admin panel
export const getUserOverview = async () => {
  const users = await prisma.discordUser.findMany({
    include: {
      Avatar: { orderBy: { createdAt: "desc" } },
      Username: { orderBy: { createdAt: "desc" } },
    },
  });
  return users
    .map((user) => {
      const visible = user.Avatar.filter((a) => !a.deletedAt);
      return {
        id: user.id,
        username: user.Username[0]?.value ?? null,
        currentAvatar: visible[0]?.id ?? null,
        avatarCount: visible.length,
        deletedAvatarCount: user.Avatar.length - visible.length,
        usernameCount: user.Username.length,
        lastSeenChange: latest([
          user.Avatar[0]?.createdAt,
          user.Username[0]?.createdAt,
        ]),
      };
    })
    .sort((a, b) => (b.lastSeenChange ?? 0) - (a.lastSeenChange ?? 0));
};

export const getUserDetails = async (id: string) => {
  return await prisma.discordUser.findUnique({
    where: { id },
    include: {
      Avatar: { orderBy: { createdAt: "desc" } },
      Username: { orderBy: { createdAt: "desc" } },
    },
  });
};

const latest = (dates: (Date | undefined)[]) => {
  const times = dates.filter((d): d is Date => !!d).map((d) => d.getTime());
  return times.length ? Math.max(...times) : null;
};
