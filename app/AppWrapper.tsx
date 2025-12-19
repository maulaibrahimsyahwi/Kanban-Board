"use client";

import { ProjectProvider } from "@/contexts/projectContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import TwoFactorGuard from "@/components/auth/two-factor-guard";

export default function AppWrapper({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce?: string;
}) {
  return (
    <SessionProvider>
      <TwoFactorGuard />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        nonce={nonce}
      >
        <ProjectProvider>
          {children}
          <Toaster
            richColors
            position="top-right"
            closeButton
            toastOptions={{
              style: {
                fontFamily: "var(--font-poppins)",
              },
            }}
          />
        </ProjectProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
