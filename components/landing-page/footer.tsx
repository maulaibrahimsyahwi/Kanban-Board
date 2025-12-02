"use client";

import { Layout } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">FreeKanban</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FreeKanban. Built by Maula Ibrahim.
          </p>
          <div className="flex gap-4">
            <FaGithub className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
