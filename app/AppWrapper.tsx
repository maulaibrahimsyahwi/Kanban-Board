"use client";

import { ProjectProvider } from "@/contexts/projectContext";
import { SidebarProvider } from "@/contexts/sidebarContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

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
      <SidebarProvider>
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
      </SidebarProvider>
    </ThemeProvider>
  );
}
