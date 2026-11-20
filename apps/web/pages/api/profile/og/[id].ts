import { NextApiRequest, NextApiResponse } from "next";
import { loadSharedProfile } from "../../../../utils/sharedProfile";
import { renderProfileOg } from "../../../../utils/profileOg";

// Link preview image (og:image) of a shared profile
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const shared = await loadSharedProfile(String(req.query.id).replace(/\.png$/, ""));
  if (!shared) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const host = (process.env.WEB_URL ?? "").replace(/^https?:\/\//, "").replace(/\/+$/, "") || "avatarhistory";
  const image = await renderProfileOg(shared, host);
  res.setHeader("Content-Type", "image/png");
  // short, so a revoked link stops showing the image; Discord caches embeds anyway
  res.setHeader("Cache-Control", "public, max-age=600");
  res.send(Buffer.from(await image.arrayBuffer()));
}
