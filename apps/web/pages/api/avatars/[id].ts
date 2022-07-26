import { NextApiRequest, NextApiResponse } from "next";
import { getAvatars } from "@avatar-history/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const avatars = (await getAvatars()).filter((avatar) => {
    return avatar.userId == id!.toString();
  });
  res.status(200).send(avatars);
}
