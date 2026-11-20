import { NextApiRequest, NextApiResponse } from "next";
import { readFile } from "fs/promises";
import path from "path";
import { getAvatar } from "@avatar-history/db";
import { getDiscordId } from "../../../../utils/id";

// Same directory apps/cdn serves, relative to the workspace cwd
const AVATAR_DIR = path.resolve(process.cwd(), "../../static/avatars");

// Serves one of the signed in user's own avatars from our origin. The Wrapped
// share card draws avatars onto a canvas, which images from the CDN (another
// origin, without CORS headers) would taint, making the PNG export fail.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getDiscordId(req, res);
  if (!userId) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  const avatar = await getAvatar(String(req.query.id));
  if (!avatar || avatar.userId != userId) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  try {
    const data = await readFile(path.join(AVATAR_DIR, userId, `${path.basename(avatar.id)}.png`));
    res.setHeader("Content-Type", "image/png");
    // avatar ids are content hashes, the file never changes
    res.setHeader("Cache-Control", "private, max-age=31536000, immutable");
    res.send(data);
  } catch {
    res.status(404).json({ error: "File missing" });
  }
}
