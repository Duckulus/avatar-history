import { NextApiRequest, NextApiResponse } from "next";
import { getAccount } from "../../utils/id";
import { getDiscord } from "../../utils/discord";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const account = await getAccount(req);
  if (account) {
    res.json(
      await getDiscord("/users/@me", {
        headers: {
          authorization: `Bearer ${account.access_token}`,
        },
      })
    );
    return;
  }
  res.status(400).json({
    error: "Not signed in",
  });
}
