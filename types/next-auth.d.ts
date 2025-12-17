import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      onboardingCompleted: boolean;
      twoFactorEnabled: boolean;
      dateFormat: string;
      authProvider?: string;
    } & DefaultSession["user"];
  }

  interface User {
    onboardingCompleted: boolean;
    twoFactorEnabled: boolean;
    dateFormat: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    onboardingCompleted: boolean;
    twoFactorEnabled: boolean;
    dateFormat: string;
    authProvider?: string;
  }
}
