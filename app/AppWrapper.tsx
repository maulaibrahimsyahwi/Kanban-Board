"use client";

import { ProjectProvider } from "@/contexts/projectContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react"; // BARU

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // BARU: Bungkus dengan SessionProvider
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
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
