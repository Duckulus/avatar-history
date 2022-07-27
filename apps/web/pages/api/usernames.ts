import { NextApiRequest, NextApiResponse } from "next";
import { getUsernames } from "@avatar-history/db";
import { getDiscordId } from "../../utils/id";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = await getDiscordId(req);
  if (id) {
    const usernames = (await getUsernames()).filter((name) => {
      return name.userId == id;
    });
    res.status(200).send(usernames);
    return;
  }

  res.status(400).json({
    error: "Not signed in",
  });
}
