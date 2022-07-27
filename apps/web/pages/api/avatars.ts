import { NextApiRequest, NextApiResponse } from "next";
import { getAvatars } from "@avatar-history/db";
import { getDiscordId } from "../../utils/id";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = await getDiscordId(req);
  if (id) {
    const avatars = (await getAvatars()).filter((avatar) => {
      return avatar.userId == id;
    });
    res.status(200).send(avatars);
    return;
  }

  res.status(400).json({
    error: "Not signed in",
  });
}
