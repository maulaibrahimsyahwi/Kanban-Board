"use client";

import { Separator } from "../ui/separator";
import { ModeToggle } from "../mode-toggle";
import AppNameAndLogo from "./logo-app";
import ProjectDialog from "../windows-dialogs/project-dialog/CreateProjectDialog";
import AllProjectsDialog from "../windows-dialogs/all-projects-dialog/all-projects-dialog";
import { Button } from "../ui/button";
import { Grid3X3, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeftSidebarProps {
  isSidebarOpen: boolean;
  onToggle: () => void;
}

export default function LeftSidebar({
  isSidebarOpen,
  onToggle,
}: LeftSidebarProps) {
  return (
    <aside
      className={cn(
        "poppins flex h-screen flex-col justify-between border-r border-border p-4 transition-all duration-300",
        isSidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex flex-col gap-4">
        {/* HAPUS justify-center/between toggle disini. Gunakan items-center dan biarkan child mengatur posisi */}
        <div
          className={cn(
            "mb-2 flex items-center min-h-[40px] transition-all duration-300",
            // Selalu justify-between agar layout stabil saat transisi
            // Saat tertutup, elemen kanan (tombol toggle di sidebar) hilang, jadi logo tetap di kiri
            "justify-between"
          )}
        >
          <AppNameAndLogo isSidebarOpen={isSidebarOpen} onToggle={onToggle} />
        </div>

        <div className="flex flex-col gap-2">
          <AllProjectsDialog
            trigger={
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 text-muted-foreground hover:text-foreground cursor-pointer overflow-hidden",
                  !isSidebarOpen && "justify-center"
                )}
              >
                <Grid3X3 className="w-4 h-4 flex-shrink-0" />
                {/* Gunakan conditional rendering yang aman untuk transisi atau max-width seperti logo jika perlu, 
                    tapi untuk tombol ini justify-center saat closed sudah cukup oke karena lebar container buttonnya penuh */}
                {isSidebarOpen && (
                  <span className="whitespace-nowrap">All Projects</span>
                )}
              </Button>
            }
          />
          <ProjectDialog>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 text-muted-foreground hover:text-foreground cursor-pointer overflow-hidden",
                !isSidebarOpen && "justify-center"
              )}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              {isSidebarOpen && (
                <span className="whitespace-nowrap">Create Project</span>
              )}
            </Button>
          </ProjectDialog>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Separator />
        <div
          className={cn(
            "flex items-center justify-center",
            isSidebarOpen && "sm:justify-start"
          )}
        >
          <ModeToggle />
        </div>
      </div>
    </aside>
  );
}
