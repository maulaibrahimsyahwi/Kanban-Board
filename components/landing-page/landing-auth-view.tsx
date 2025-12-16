"use client";

import { useRouter } from "next/navigation";
import { IoChevronBackOutline } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import { AuthCard } from "./auth-card";

export function LandingAuthView() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-300 relative overflow-hidden">
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-50">
        <Button
          variant="ghost"
          onClick={() => router.replace("/")}
          className="text-muted-foreground hover:text-foreground gap-2 hover:bg-muted/50 transition-colors"
        >
          <IoChevronBackOutline className="w-5 h-5" /> Back to Home
        </Button>
      </div>

      <div className="w-full max-w-[500px] flex flex-col gap-8 relative z-10">
        <AuthCard />
      </div>

      <div className="fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-primary/15 opacity-40 blur-[120px]"></div>
      </div>
    </div>
  );
}

