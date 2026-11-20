import { NextApiRequest, NextApiResponse } from "next";
import { createProfileShare, deleteProfileShare, getProfileShareOf } from "@avatar-history/db";
import { getDiscordId } from "../../../utils/id";

// The signed in user's public profile link.
// GET: current link or null, POST: create (idempotent), DELETE: revoke.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getDiscordId(req, res);
  if (!userId) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  switch (req.method) {
    case "GET": {
      const share = await getProfileShareOf(userId);
      res.json({ id: share?.id ?? null });
      return;
    }
    case "POST": {
      const share = await createProfileShare(userId);
      res.json({ id: share.id });
      return;
    }
    case "DELETE":
      await deleteProfileShare(userId);
      res.json({ id: null });
      return;
    default:
      res.setHeader("Allow", "GET, POST, DELETE");
      res.status(405).end();
  }
}
