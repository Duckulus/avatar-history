import { prisma } from "../prisma";

// Overview of every tracked Discord user for the admin panel.
// Loads only the needed columns and aggregates in a single pass.
export const getUserOverview = async () => {
  const [users, avatars, usernames] = await Promise.all([
    prisma.discordUser.findMany({ select: { id: true } }),
    prisma.avatar.findMany({
      select: { id: true, userId: true, createdAt: true, deletedAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.username.findMany({
      select: { userId: true, value: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const overview = new Map(
    users.map((user) => [
      user.id,
      {
        id: user.id,
        username: null as string | null,
        currentAvatar: null as string | null,
        avatarCount: 0,
        deletedAvatarCount: 0,
        usernameCount: 0,
        lastSeenChange: null as number | null,
      },
    ])
  );
  const touch = (entry: { lastSeenChange: number | null }, date: Date) => {
    entry.lastSeenChange = Math.max(entry.lastSeenChange ?? 0, date.getTime());
  };

  // rows are newest first, so the first match per user is the current one
  for (const avatar of avatars) {
    const entry = overview.get(avatar.userId);
    if (!entry) continue;
    touch(entry, avatar.createdAt);
    if (avatar.deletedAt) {
      entry.deletedAvatarCount++;
    } else {
      entry.avatarCount++;
      entry.currentAvatar ??= avatar.id;
    }
  }
  for (const username of usernames) {
    const entry = overview.get(username.userId);
    if (!entry) continue;
    touch(entry, username.createdAt);
    entry.usernameCount++;
    entry.username ??= username.value;
  }

  return Array.from(overview.values()).sort(
    (a, b) => (b.lastSeenChange ?? 0) - (a.lastSeenChange ?? 0)
  );
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
