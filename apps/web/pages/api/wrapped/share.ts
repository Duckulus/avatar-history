import { NextApiRequest, NextApiResponse } from "next";
import { createWrappedShare, deleteWrappedShare, getWrappedShareOf } from "@avatar-history/db";
import { getDiscordId } from "../../../utils/id";
import { validYear } from "../../../utils/rank";

// The signed in user's public share link for one year's Wrapped.
// GET: current link or null, POST: create (idempotent), DELETE: revoke.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getDiscordId(req, res);
  if (!userId) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  const year = validYear(req.method == "POST" ? req.body?.year : req.query.year);
  if (year == null) {
    res.status(400).json({ error: "Invalid year" });
    return;
  }

  switch (req.method) {
    case "GET": {
      const share = await getWrappedShareOf(userId, year);
      res.json({ id: share?.id ?? null });
      return;
    }
    case "POST": {
      const share = await createWrappedShare(userId, year);
      res.json({ id: share.id });
      return;
    }
    case "DELETE":
      await deleteWrappedShare(userId, year);
      res.json({ id: null });
      return;
    default:
      res.setHeader("Allow", "GET, POST, DELETE");
      res.status(405).end();
  }
}
