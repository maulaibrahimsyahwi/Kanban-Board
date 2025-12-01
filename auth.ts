import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import type { Adapter } from "next-auth/adapters";
import type { User } from "next-auth";

class TwoFactorRequired extends CredentialsSignin {
  code = "2FA_REQUIRED";
}

class InvalidTwoFactorCode extends CredentialsSignin {
  code = "2FA_INVALID";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "2FA Code", type: "text" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) return null;

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValidPassword) return null;

        if (user.twoFactorEnabled) {
          const inputCode = credentials.code as string;

          if (!inputCode) {
            throw new TwoFactorRequired();
          }

          const isValidToken = authenticator.verify({
            token: inputCode,
            secret: user.twoFactorSecret ?? "",
          });

          if (!isValidToken) {
            throw new InvalidTwoFactorCode();
          }
        }

        return user;
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.sub = user.id;
        token.onboardingCompleted = (user as User).onboardingCompleted;
        token.twoFactorEnabled = (user as User).twoFactorEnabled;

        if (account?.provider === "google") {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (dbUser?.twoFactorEnabled) {
            token.requires2FA = true;
          }
        } else if (account?.provider === "credentials") {
          token.requires2FA = false;
        }
      }

      if (trigger === "update" && session?.requires2FA !== undefined) {
        token.requires2FA = session.requires2FA;
      }

      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
          });
          if (dbUser) {
            token.onboardingCompleted = dbUser.onboardingCompleted;
            token.twoFactorEnabled = dbUser.twoFactorEnabled;
          }
        } catch (e) {
          console.error(e);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
        session.user.requires2FA = token.requires2FA as boolean;
      }
      return session;
    },
  },
});
