import NextAuth, {NextAuthOptions} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import {prisma} from "@avatar-history/db";

const adapter = PrismaAdapter(prisma);

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_APPLICATION_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "identify guilds",
        },
      },
    }),
  ],
  callbacks: {
    async session({session, user}) {
      if (user) session.id = user.id;
      return session;
    },
  },
  events: {
    async signIn({user, account}) {
      if (user && adapter && account) {
        try {
          // @ts-ignore
          const userFromDatabase = await adapter.getUser(user.id);
          if (userFromDatabase) {
            await prisma.account.update({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              data: {
                access_token: account.access_token,
                expires_at: account.expires_at,
                id_token: account.id_token,
                refresh_token: account.refresh_token,
                session_state: account.session_state,
                scope: account.scope,
              },
            });
          }
        } catch (err) {
          if (err instanceof Error) {
            console.error(err.message);
          }
        }
      }
    },
  },
  adapter: adapter,
};

declare module "next-auth" {
  interface Session {
    id?: string
  }
}

export default NextAuth(authOptions);
