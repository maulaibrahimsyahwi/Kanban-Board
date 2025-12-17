import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import type { Adapter } from "next-auth/adapters";
import type { User } from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: false,
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
            throw new Error("2FA_REQUIRED");
          }

          const isValidToken = authenticator.verify({
            token: inputCode,
            secret: user.twoFactorSecret ?? "",
          });

          if (!isValidToken) {
            throw new Error("2FA_INVALID");
          }
        }

        return {
          ...user,
          dateFormat: user.dateFormat,
        } as User;
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.sub = user.id;
        token.onboardingCompleted = user.onboardingCompleted;
        token.twoFactorEnabled = user.twoFactorEnabled;
        token.dateFormat = user.dateFormat || "dd/MM/yyyy";
        if (account?.provider) token.authProvider = account.provider;
      }

      if (trigger === "update" && session) {
        if (session.dateFormat) token.dateFormat = session.dateFormat;
        if (session.user?.image) token.picture = session.user.image;
      }

      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
          });
          if (dbUser) {
            token.onboardingCompleted = dbUser.onboardingCompleted;
            token.twoFactorEnabled = dbUser.twoFactorEnabled;
            token.dateFormat = dbUser.dateFormat;
            token.picture = dbUser.image;
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
        session.user.dateFormat = (token.dateFormat as string) || "dd/MM/yyyy";
        session.user.image = token.picture;
        session.user.authProvider =
          typeof token.authProvider === "string" ? token.authProvider : undefined;
      }
      return session;
    },
  },
});
