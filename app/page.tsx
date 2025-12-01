"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import LeftSidebar from "@/components/left-sidebar/left-sidebar";
import ProjectArea from "@/components/projects-area/project-area";
import LandingPage from "@/components/landing-page";
import OnboardingFlow from "@/components/onboarding-flow";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  if (!session.user.onboardingCompleted) {
    return <OnboardingFlow />;
  }

  return (
    <div className="bg-background w-full page-container">
      <LeftSidebar
        isSidebarOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main className={`main-container flex-1 flex flex-col gap-2 sm:gap-4`}>
        <div
          className={`min-w-0 overflow-hidden transition-all duration-300 project-area-container w-full flex-1 min-h-0`}
        >
          <ProjectArea />
        </div>
      </main>
    </div>
  );
}
