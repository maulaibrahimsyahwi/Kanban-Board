"use client";

import NavBar from "@/components/nav-bar/nav-bar";
import ProjectArea from "@/components/projects-area/project-area";
import RightSideBar from "@/components/right-side-bar/right-side-bar";
import { useSidebar } from "@/contexts/sidebarContext";

export default function Home() {
  const { isRightSidebarVisible } = useSidebar();

  return (
    <div className="bg-background min-h-screen w-full page-container">
      <NavBar />
      <main
        className={`px-2 sm:px-3 md:px-4 lg:px-6 mt-3 sm:mt-4 md:mt-4 lg:mt-4 gap-2 sm:gap-4 pb-4 sm:pb-6 md:pb-8 main-container transition-all duration-300 ${
          isRightSidebarVisible
            ? "sidebar-visible flex flex-col xl:grid xl:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]"
            : "sidebar-hidden flex flex-col"
        }`}
      >
        {/* Project Area - Full width when sidebar is hidden */}
        <div
          className={`min-w-0 overflow-hidden transition-all duration-300 project-area-container ${
            isRightSidebarVisible
              ? "order-2 xl:order-1 xl:pr-2 w-full project-area-with-sidebar"
              : "order-1 w-full project-area-full-width"
          }`}
        >
          <ProjectArea />
        </div>

        {/* Right Sidebar - Only render when visible */}
        {isRightSidebarVisible && (
          <div className="flex-shrink-0 order-1 xl:order-2 min-w-0 w-full transition-all duration-300 right-sidebar-container">
            <RightSideBar />
          </div>
        )}
      </main>
    </div>
  );
}
