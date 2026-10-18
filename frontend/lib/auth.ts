import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  // Session strategy: JWT-based for zero-DB file-first simplicity
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/auth/signin",
  },

  providers: [
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            issuer: "https://github.com/login/oauth",
          }),
        ]
      : []),

    CredentialsProvider({
      id: "dev-credentials",
      name: "Local Dev Learner",
      credentials: {
        username: {
          label: "Learner Name",
          type: "text",
          placeholder: "e.g. Malay",
        },
      },
      async authorize(credentials) {
        if (!credentials?.username) {
          return null;
        }

        // Return a mock learner user profile
        return {
          id: "learner-1",
          name: credentials.username,
          email: `${credentials.username.toLowerCase()}@algoscope.local`,
          image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
            credentials.username,
          )}`,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { name?: string }).name = token.name as string;
        (session.user as { email?: string }).email = token.email as string;
        (session.user as { image?: string }).image = token.image as string;
        (session.user as { provider?: string }).provider =
          token.provider as string;
      }
      return session;
    },
  },
};
