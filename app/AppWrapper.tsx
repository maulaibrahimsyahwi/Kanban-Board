"use client";

import { ProjectProvider } from "@/contexts/projectContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "react-circular-progressbar/dist/styles.css"; // <-- TAMBAHKAN BARIS INI

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
          position="bottom-right"
          closeButton
          visibleToasts={2}
          duration={2500}
          toastOptions={{
            style: {
              fontFamily: "var(--font-poppins)",
            },
          }}
        />
      </ProjectProvider>
    </ThemeProvider>
  );
}
