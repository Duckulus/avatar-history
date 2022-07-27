import { NextApiRequest, NextApiResponse } from "next";
import { getAvatars, prisma } from "@avatar-history/db";
import { getSession } from "next-auth/react";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  if (session) {
    const account = await prisma.account.findFirst({
      where: {
        userId: session.id as string,
      },
    });
    if (account) {
      const avatars = (await getAvatars()).filter((avatar) => {
        return avatar.userId == account.providerAccountId!.toString();
      });
      res.status(200).send(avatars);
      return;
    }
  }
  res.status(400).json({
    error: "Not signed in",
  });
}
