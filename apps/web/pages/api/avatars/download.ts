import { NextApiRequest, NextApiResponse } from "next";
import { readFile } from "fs/promises";
import path from "path";
import { getAvatarsOfUser } from "@avatar-history/db";
import { getDiscordId } from "../../../utils/id";
import { ZipWriter } from "../../../utils/zip";

// Same directory apps/cdn serves, relative to the workspace cwd
const AVATAR_DIR = path.resolve(process.cwd(), "../../static/avatars");

export const config = {
  api: { responseLimit: false },
};

// Streams all visible avatars of the signed in user as a ZIP archive
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = await getDiscordId(req, res);
  if (!id) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }

  // oldest first so the numbering matches the website
  const avatars = (await getAvatarsOfUser(id)).reverse();
  const digits = Math.max(3, String(avatars.length).length);

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="avatar-history-${id}.zip"`);
  res.setHeader("Cache-Control", "no-store");

  const zip = new ZipWriter(res);
  try {
    for (let index = 0; index < avatars.length; index++) {
      const avatar = avatars[index];
      let data: Buffer;
      try {
        data = await readFile(path.join(AVATAR_DIR, id, `${path.basename(avatar.id)}.png`));
      } catch {
        continue; // file missing on disk, skip it like the website shows a placeholder
      }
      const number = String(index + 1).padStart(digits, "0");
      const day = avatar.createdAt.toISOString().slice(0, 10);
      await zip.add(`${number}_${day}_${avatar.id}.png`, data, avatar.createdAt);
    }
    await zip.finish();
    res.end();
  } catch {
    // client aborted the download
    res.destroy();
  }
}
