import { NextApiRequest, NextApiResponse } from "next";
import { statfs, stat } from "fs/promises";
import path from "path";
import { getSiteCounts, getUpdateHealth } from "@avatar-history/db";
import { requireRole } from "../../../utils/admin";

// Paths relative to the workspace cwd, like everywhere else
const DB_FILE = path.resolve(process.cwd(), "../../packages/db/prisma/dev.db");
const STATIC_DIR = path.resolve(process.cwd(), "../../static");

const fileSize = async (file: string) => {
  try {
    return (await stat(file)).size;
  } catch {
    return null;
  }
};

const disk = async (dir: string) => {
  try {
    const fs = await statfs(dir);
    return { total: fs.blocks * fs.bsize, free: fs.bavail * fs.bsize };
  } catch {
    return null;
  }
};

// Update loop runs, activity and system numbers for the health tab of the admin panel
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireRole(req, res, ["admin", "superadmin"]))) return;
  const [updates, counts, dbSize, walSize, staticDisk] = await Promise.all([
    getUpdateHealth(),
    getSiteCounts(),
    fileSize(DB_FILE),
    fileSize(`${DB_FILE}-wal`),
    disk(STATIC_DIR),
  ]);
  res.json({
    ...updates,
    counts,
    system: {
      dbBytes: dbSize == null ? null : dbSize + (walSize ?? 0),
      disk: staticDisk,
      webUptimeSeconds: Math.round(process.uptime()),
      webMemoryBytes: process.memoryUsage().rss,
      node: process.version,
    },
  });
}
