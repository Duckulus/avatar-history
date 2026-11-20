import { NextApiRequest, NextApiResponse } from "next";
import { getDiscordId } from "../../../utils/id";
import { validYear, wrappedRank } from "../../../utils/rank";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = await getDiscordId(req, res);
  if (!id) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  const year = validYear(req.query.year);
  if (year == null) {
    res.status(400).json({ error: "Invalid year" });
    return;
  }
  res.setHeader("Cache-Control", "private, max-age=300");
  res.json(await wrappedRank(id, year));
}
