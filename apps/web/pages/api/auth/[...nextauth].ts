import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@avatar-history/db";
import { NextAuthOptions } from "next-auth";
import { logger } from "@avatar-history/logging";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_APPLICATION_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (user) session.id = user.id;
      logger.debug(session);
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
};

export default NextAuth(authOptions);
