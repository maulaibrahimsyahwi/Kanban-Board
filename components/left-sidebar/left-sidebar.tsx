"use client";

import { Separator } from "../ui/separator";
import { ModeToggle } from "../mode-toggle";
import AppNameAndLogo from "./logo-app";
import ProjectDialog from "../windows-dialogs/project-dialog/CreateProjectDialog";
import AllProjectsDialog from "../windows-dialogs/all-projects-dialog/all-projects-dialog";
import { Button } from "../ui/button";
import { Grid3X3, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import UserButton from "./user-button"; // BARU: Import UserButton

interface LeftSidebarProps {
  isSidebarOpen: boolean;
  onToggle: () => void;
}

export default function LeftSidebar({
  isSidebarOpen,
  onToggle,
}: LeftSidebarProps) {
  const textTransitionClass = cn(
    "whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out",
    isSidebarOpen
      ? "opacity-100 max-w-[150px] ml-2 translate-x-0"
      : "opacity-0 max-w-0 ml-0 -translate-x-2"
  );

  return (
    <aside
      className={cn(
        "poppins flex h-screen flex-col justify-between border-r border-border p-4 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex flex-col gap-4">
        {/* Header Logo */}
        <div
          className={cn(
            "mb-2 flex items-center min-h-[40px] transition-all duration-300",
            isSidebarOpen ? "justify-between" : "justify-center"
          )}
        >
          <AppNameAndLogo isSidebarOpen={isSidebarOpen} onToggle={onToggle} />
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-2">
          <AllProjectsDialog
            trigger={
              <Button
                variant="ghost"
                className={cn(
                  "w-full text-muted-foreground hover:text-foreground cursor-pointer overflow-hidden transition-all duration-300",
                  isSidebarOpen ? "justify-start px-4" : "justify-center px-0"
                )}
              >
                <Grid3X3 className="w-4 h-4 flex-shrink-0" />
                <span className={textTransitionClass}>All Projects</span>
              </Button>
            }
          />
          <ProjectDialog>
            <Button
              variant="ghost"
              className={cn(
                "w-full text-muted-foreground hover:text-foreground cursor-pointer overflow-hidden transition-all duration-300",
                isSidebarOpen ? "justify-start px-4" : "justify-center px-0"
                )}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className={textTransitionClass}>Create Project</span>
            </Button>
          </ProjectDialog>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div
          className={cn(
            "flex items-center justify-center transition-all duration-300",
            isSidebarOpen && "sm:justify-end"
          )}
        >
          <ModeToggle />
        </div>

        <Separator />

        <UserButton isSidebarOpen={isSidebarOpen} />
      </div>
    </aside>
  );
}
