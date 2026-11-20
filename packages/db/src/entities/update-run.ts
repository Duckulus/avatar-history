import { prisma } from "../prisma";

// A run every 30s is ~2900 rows a day; older rows are pruned
export const UPDATE_RUN_RETENTION_DAYS = 7;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export interface UpdateRunResult {
  startedAt: Date;
  durationMs: number;
  members: number;
  newAvatars: number;
  newUsernames: number;
  failedDownloads: number;
  error?: string | null;
}

export const recordUpdateRun = async (run: UpdateRunResult) => {
  await prisma.updateRun.create({
    data: { ...run, error: run.error ? run.error.slice(0, 500) : null },
  });
};

export const pruneUpdateRuns = async () => {
  await prisma.updateRun.deleteMany({
    where: { startedAt: { lt: new Date(Date.now() - UPDATE_RUN_RETENTION_DAYS * DAY) } },
  });
};

export interface HourBucket {
  start: number;
  runs: number;
  failed: number;
  newAvatars: number;
  newUsernames: number;
  avgDurationMs: number | null;
  maxDurationMs: number | null;
}

export interface DayBucket {
  start: number;
  avatars: number;
  usernames: number;
}

const percentile = (sorted: number[], p: number) =>
  sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : null;

/**
 * Everything the health page of the admin panel shows. Hours and days are UTC
 * buckets, the browser labels them in local time.
 */
export const getUpdateHealth = async (hours = 48, days = 30) => {
  const now = Date.now();
  const firstHour = Math.floor(now / HOUR) * HOUR - (hours - 1) * HOUR;
  const firstDay = Math.floor(now / DAY) * DAY - (days - 1) * DAY;

  const [runs, lastRun, lastSuccess, recent, avatarDays, usernameDays] = await Promise.all([
    prisma.updateRun.findMany({
      where: { startedAt: { gte: new Date(firstHour) } },
      select: {
        startedAt: true,
        durationMs: true,
        newAvatars: true,
        newUsernames: true,
        failedDownloads: true,
        error: true,
      },
      orderBy: { startedAt: "asc" },
    }),
    prisma.updateRun.findFirst({ orderBy: { startedAt: "desc" } }),
    prisma.updateRun.findFirst({ where: { error: null }, orderBy: { startedAt: "desc" } }),
    prisma.updateRun.findMany({
      where: { OR: [{ error: { not: null } }, { newAvatars: { gt: 0 } }, { newUsernames: { gt: 0 } }] },
      orderBy: { startedAt: "desc" },
      take: 15,
    }),
    // Prisma stores DateTime as epoch milliseconds in SQLite
    prisma.$queryRawUnsafe<{ day: bigint; n: bigint }[]>(
      "SELECT createdAt / 86400000 AS day, COUNT(*) AS n FROM Avatar WHERE createdAt >= ? GROUP BY day",
      firstDay
    ),
    prisma.$queryRawUnsafe<{ day: bigint; n: bigint }[]>(
      "SELECT createdAt / 86400000 AS day, COUNT(*) AS n FROM Username WHERE createdAt >= ? GROUP BY day",
      firstDay
    ),
  ]);

  const hourly: HourBucket[] = Array.from({ length: hours }, (_, i) => ({
    start: firstHour + i * HOUR,
    runs: 0,
    failed: 0,
    newAvatars: 0,
    newUsernames: 0,
    avgDurationMs: null,
    maxDurationMs: null,
  }));
  const durationSums = new Array(hours).fill(0);
  for (const run of runs) {
    const i = Math.floor((run.startedAt.getTime() - firstHour) / HOUR);
    const bucket = hourly[i];
    if (!bucket) continue;
    bucket.runs++;
    if (run.error) bucket.failed++;
    bucket.newAvatars += run.newAvatars;
    bucket.newUsernames += run.newUsernames;
    bucket.maxDurationMs = Math.max(bucket.maxDurationMs ?? 0, run.durationMs);
    durationSums[i] += run.durationMs;
  }
  hourly.forEach((bucket, i) => {
    if (bucket.runs) bucket.avgDurationMs = Math.round(durationSums[i] / bucket.runs);
  });

  const daily: DayBucket[] = Array.from({ length: days }, (_, i) => ({
    start: firstDay + i * DAY,
    avatars: 0,
    usernames: 0,
  }));
  const firstDayIndex = firstDay / DAY;
  for (const row of avatarDays) {
    const bucket = daily[Number(row.day) - firstDayIndex];
    if (bucket) bucket.avatars = Number(row.n);
  }
  for (const row of usernameDays) {
    const bucket = daily[Number(row.day) - firstDayIndex];
    if (bucket) bucket.usernames = Number(row.n);
  }

  const last24h = runs.filter((run) => run.startedAt.getTime() >= now - DAY);
  const durations = last24h.map((run) => run.durationMs).sort((a, b) => a - b);

  return {
    now,
    lastRun,
    lastSuccessAt: lastSuccess?.startedAt ?? null,
    recent,
    hourly,
    daily,
    day: {
      runs: last24h.length,
      failed: last24h.filter((run) => run.error).length,
      failedDownloads: last24h.reduce((sum, run) => sum + run.failedDownloads, 0),
      newAvatars: last24h.reduce((sum, run) => sum + run.newAvatars, 0),
      newUsernames: last24h.reduce((sum, run) => sum + run.newUsernames, 0),
      medianDurationMs: percentile(durations, 0.5),
      p95DurationMs: percentile(durations, 0.95),
    },
  };
};

// Counts that are not about the update loop
export const getSiteCounts = async () => {
  const [accounts, activeSessions, profileShares, wrappedShares] = await Promise.all([
    prisma.user.count(),
    prisma.session.count({ where: { expires: { gt: new Date() } } }),
    prisma.profileShare.count(),
    prisma.wrappedShare.count(),
  ]);
  return { accounts, activeSessions, profileShares, wrappedShares };
};
