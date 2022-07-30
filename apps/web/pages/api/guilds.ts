import { NextApiRequest, NextApiResponse } from "next";
import { getAccount } from "../../utils/id";
import { getDiscord } from "../../utils/discord";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const account = await getAccount(req);
  if (account) {
    try {
      res.json(
        await getDiscord("/users/@me/guilds", {
          headers: {
            authorization: `Bearer ${account.access_token}`,
          },
        })
      );
    } catch (e) {
      res.json([]);
    }

    return;
  }
  res.status(400).json({
    error: "Not signed in",
  });
}
