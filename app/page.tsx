"use client";

import NavBar from "@/components/nav-bar/nav-bar";
import ProjectArea from "@/components/projects-area/project-area";
import RightSideBar from "@/components/right-side-bar/right-side-bar";

export default function Home() {
  return (
    <div className="bg-background min-h-screen w-full page-container">
      <NavBar />
      <main className="flex flex-col xl:grid xl:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] px-2 sm:px-3 md:px-4 lg:px-6 mt-3 sm:mt-4 md:mt-6 lg:mt-8 gap-3 sm:gap-4 pb-4 sm:pb-6 md:pb-8 main-container">
        {/* Project Area - Di mobile/tablet akan berada di order-2, di desktop order-1 */}
        <div className="min-w-0 order-2 xl:order-1 overflow-hidden w-full">
          <ProjectArea />
        </div>

        {/* Right Sidebar - Di mobile/tablet akan berada di order-1 (atas), di desktop order-2 */}
        <div className="flex-shrink-0 order-1 xl:order-2 min-w-0 w-full">
          <RightSideBar />
        </div>
      </main>
    </div>
  );
}
