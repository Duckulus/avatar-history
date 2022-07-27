import { NextApiRequest } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@avatar-history/db";
import { Account } from "@prisma/client";

export const getDiscordId = async (
  req: NextApiRequest
): Promise<string | null> => {
  const session = await getSession({ req });
  if (session) {
    const account = await prisma.account.findFirst({
      where: {
        userId: session.id as string,
      },
    });

    if (account) {
      return account.providerAccountId;
    }
  }
  return null;
};

export const getAccount = async (
  req: NextApiRequest
): Promise<Account | null> => {
  const session = await getSession({ req });
  if (session) {
    const account = await prisma.account.findFirst({
      where: {
        userId: session.id as string,
      },
    });

    if (account) {
      return account;
    }
  }
  return null;
};
