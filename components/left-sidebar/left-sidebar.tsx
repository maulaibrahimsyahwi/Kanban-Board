"use client";

import { Separator } from "../ui/separator";
import { ModeToggle } from "../mode-toggle";
import AppNameAndLogo from "./logo-app";
import ProjectDialog from "../windows-dialogs/project-dialog/CreateProjectDialog";
import AllProjectsDialog from "../windows-dialogs/all-projects-dialog/all-projects-dialog";
import { Button } from "../ui/button";
import { Grid3X3, Plus } from "lucide-react";

export default function LeftSidebar() {
  return (
    <aside className="poppins flex h-screen w-64 flex-col justify-between border-r border-border p-4">
      <div className="flex flex-col gap-4">
        {/* Logo and App Name */}
        <div className="mb-2">
          <AppNameAndLogo />
        </div>

        {/* Project Actions */}
        <div className="flex flex-col gap-2">
          <AllProjectsDialog
            trigger={
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Grid3X3 className="w-4 h-4" />
                <span>All Projects</span>
              </Button>
            }
          />
          <ProjectDialog>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </Button>
          </ProjectDialog>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col gap-2">
        <Separator />
        <div className="flex items-center justify-center">
          <ModeToggle />
        </div>
      </div>
    </aside>
  );
}
