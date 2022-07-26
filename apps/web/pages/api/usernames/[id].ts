import { NextApiRequest, NextApiResponse } from "next";
import { getUsernames } from "@avatar-history/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const avatars = (await getUsernames()).filter((name) => {
    return name.userId == id!.toString();
  });
  res.status(200).send(avatars);
}
