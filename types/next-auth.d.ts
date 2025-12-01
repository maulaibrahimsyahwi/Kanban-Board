import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      onboardingCompleted: boolean;
      twoFactorEnabled: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    onboardingCompleted: boolean;
    twoFactorEnabled: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    onboardingCompleted: boolean;
    twoFactorEnabled: boolean;
  }
}
