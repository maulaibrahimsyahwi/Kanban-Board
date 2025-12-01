import NextAuth, { AuthError } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";

// Definisikan error khusus agar tidak dianggap Server Error 500
class TwoFactorError extends AuthError {
  constructor(msg: string) {
    super(msg);
    this.type = "CredentialsSignin";
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
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
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const email = credentials.email as string;
          const user = await prisma.user.findUnique({ where: { email } });

          if (!user || !user.password) {
            // Return null akan dianggap sebagai "CredentialsSignin" error standar
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValidPassword) {
            return null;
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const userAny = user as any;

          // Cek status 2FA
          if (userAny.twoFactorEnabled) {
            const inputCode = credentials.code as string;

            // Jika kode belum diinput (Login Tahap 1)
            if (!inputCode) {
              // Lempar error string biasa yang akan ditangkap oleh signIn di frontend
              throw new Error("2FA_REQUIRED");
            }

            // Verifikasi kode
            const isValidToken = authenticator.verify({
              token: inputCode,
              secret: userAny.twoFactorSecret,
            });

            if (!isValidToken) {
              return null; // Kode salah, login gagal
            }
          }

          return userAny;
        } catch (error) {
          // Log error ke terminal server untuk debugging
          console.error("Auth Error:", error);

          // Jika error 2FA_REQUIRED, lempar ulang agar ditangkap frontend
          if (error instanceof Error && error.message === "2FA_REQUIRED") {
            throw error;
          }

          return null;
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.onboardingCompleted = (user as any).onboardingCompleted;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.twoFactorEnabled = (user as any).twoFactorEnabled;
      }

      if (trigger === "update") {
        if (session?.onboardingCompleted !== undefined)
          token.onboardingCompleted = session.onboardingCompleted;
        if (session?.twoFactorEnabled !== undefined)
          token.twoFactorEnabled = session.twoFactorEnabled;
      }

      if (token.sub) {
        // Bungkus dengan try-catch agar tidak crash jika DB error
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
          });
          if (dbUser) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            token.onboardingCompleted = (dbUser as any).onboardingCompleted;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            token.twoFactorEnabled = (dbUser as any).twoFactorEnabled;
          }
        } catch (e) {
          console.error("JWT Callback DB Error:", e);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
      }
      return session;
    },
  },
});
