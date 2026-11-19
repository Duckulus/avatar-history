import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { prisma } from "@avatar-history/db";
import { Account } from "@prisma/client";
import { authOptions } from "../pages/api/auth/[...nextauth]";

// getServerSession reads the session directly instead of making an HTTP
// request to our own /api/auth/session like getSession does
export const getDiscordId = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<string | null> => {
  const session = await getServerSession(req, res, authOptions);
  return session?.discordId ?? null;
};

export const getAccount = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<Account | null> => {
  const discordId = await getDiscordId(req, res);
  if (!discordId) return null;
  return await prisma.account.findFirst({
    where: { provider: "discord", providerAccountId: discordId },
  });
};
