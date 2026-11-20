import { NextApiRequest, NextApiResponse } from "next";
import { loadSharedWrapped } from "../../../../utils/sharedWrapped";
import { renderWrappedOg } from "../../../../utils/wrappedOg";

// Link preview image (og:image) of a shared Wrapped
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const shared = await loadSharedWrapped(String(req.query.id).replace(/\.png$/, ""));
  if (!shared) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const host = (process.env.WEB_URL ?? "").replace(/^https?:\/\//, "").replace(/\/+$/, "") || "avatarhistory";
  const image = await renderWrappedOg(shared.stats, shared.name, shared.rank.beatenPercent, host);
  res.setHeader("Content-Type", "image/png");
  // short, so a revoked link stops showing the image and stats stay fresh;
  // Discord caches embeds on its side anyway
  res.setHeader("Cache-Control", "public, max-age=600");
  res.send(Buffer.from(await image.arrayBuffer()));
}
