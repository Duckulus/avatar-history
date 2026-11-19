import { NextApiRequest, NextApiResponse } from "next";
import { getAvatarsOfUser } from "@avatar-history/db";
import { getDiscordId } from "../../utils/id";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = await getDiscordId(req, res);
  if (id) {
    res.status(200).send(await getAvatarsOfUser(id));
    return;
  }

  res.status(400).json({
    error: "Not signed in",
  });
}
