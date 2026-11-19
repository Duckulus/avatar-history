import { prisma } from "../prisma";

export type UserSort = "recent" | "avatars" | "usernames" | "hidden";

// whitelisted ORDER BY expressions; never interpolate user input here
const SORT_COLUMNS: Record<UserSort, string> = {
  recent: "lastChange",
  avatars: "avatarCount",
  usernames: "usernameCount",
  hidden: "hiddenCount",
};

export const ADMIN_PAGE_SIZE = 40;

/**
 * One page of the admin user list. Counting, filtering and sorting happen in
 * SQLite so only ADMIN_PAGE_SIZE users are sent to the browser.
 * `query` matches a Discord id or any past username of the user.
 */
export const getUserPage = async ({
  page,
  query,
  sort,
  desc,
}: {
  page: number;
  query: string;
  sort: UserSort;
  desc: boolean;
}) => {
  const q = query.trim();
  const filter = q
    ? "WHERE u.id LIKE ?1 OR EXISTS (SELECT 1 FROM Username s WHERE s.userId = u.id AND s.value LIKE ?1)"
    : "";
  const params = q ? [`%${q}%`] : [];
  const base = `
    FROM DiscordUser u
    LEFT JOIN (
      SELECT userId,
             SUM(deletedAt IS NULL) AS visible,
             SUM(deletedAt IS NOT NULL) AS hidden,
             MAX(createdAt) AS last
      FROM Avatar GROUP BY userId
    ) a ON a.userId = u.id
    LEFT JOIN (
      SELECT userId, COUNT(*) AS cnt, MAX(createdAt) AS last
      FROM Username GROUP BY userId
    ) n ON n.userId = u.id
    ${filter}`;

  const [{ total }] = await prisma.$queryRawUnsafe<{ total: bigint }[]>(
    `SELECT COUNT(*) AS total ${base}`,
    ...params
  );
  const rows = await prisma.$queryRawUnsafe<
    {
      id: string;
      avatarCount: bigint;
      hiddenCount: bigint;
      usernameCount: bigint;
      lastChange: bigint | null;
    }[]
  >(
    `SELECT u.id,
            COALESCE(a.visible, 0) AS avatarCount,
            COALESCE(a.hidden, 0) AS hiddenCount,
            COALESCE(n.cnt, 0) AS usernameCount,
            MAX(COALESCE(a.last, 0), COALESCE(n.last, 0)) AS lastChange
     ${base}
     ORDER BY ${SORT_COLUMNS[sort]} ${desc ? "DESC" : "ASC"}, lastChange DESC, u.id
     LIMIT ${ADMIN_PAGE_SIZE} OFFSET ${Math.max(0, Math.floor(page)) * ADMIN_PAGE_SIZE}`,
    ...params
  );

  // current username and avatar, only for the users on this page
  const ids = rows.map((r) => r.id);
  const [usernames, avatars] = await Promise.all([
    prisma.username.findMany({
      where: { userId: { in: ids } },
      select: { userId: true, value: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.avatar.findMany({
      where: { userId: { in: ids }, deletedAt: null },
      select: { userId: true, id: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    total: Number(total),
    pageSize: ADMIN_PAGE_SIZE,
    users: rows.map((r) => ({
      id: r.id,
      username: usernames.find((u) => u.userId == r.id)?.value ?? null,
      currentAvatar: avatars.find((a) => a.userId == r.id)?.id ?? null,
      avatarCount: Number(r.avatarCount),
      deletedAvatarCount: Number(r.hiddenCount),
      usernameCount: Number(r.usernameCount),
      lastSeenChange: r.lastChange ? Number(r.lastChange) : null,
    })),
  };
};

export const getAdminStats = async () => {
  const [users, avatars, hidden, usernames] = await Promise.all([
    prisma.discordUser.count(),
    prisma.avatar.count({ where: { deletedAt: null } }),
    prisma.avatar.count({ where: { deletedAt: { not: null } } }),
    prisma.username.count(),
  ]);
  return { users, avatars, hidden, usernames };
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
