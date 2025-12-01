"use client";

import { useState } from "react"; // DIUBAH: Tambahkan import useState
import LeftSidebar from "@/components/left-sidebar/left-sidebar";
import ProjectArea from "@/components/projects-area/project-area";

export default function Home() {
  // BARU: Tambahkan state untuk mengelola sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="bg-background w-full page-container">
      {/* DIUBAH: Teruskan props ke LeftSidebar */}
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
