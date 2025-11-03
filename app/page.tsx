"use client";

import LeftSidebar from "@/components/left-sidebar/left-sidebar";
import ProjectArea from "@/components/projects-area/project-area";

export default function Home() {
  return (
    <div className="bg-background w-full page-container">
      <LeftSidebar />
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
