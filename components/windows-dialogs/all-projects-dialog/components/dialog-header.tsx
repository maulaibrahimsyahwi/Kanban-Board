import React from "react";
import {
  DialogDescription,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { useProjects } from "@/contexts/projectContext";
import ProjectDialog from "@/components/windows-dialogs/project-dialog/project-dialog";

interface DialogHeaderProps {
  onDeleteAll: () => void;
}

export function DialogHeader({ onDeleteAll }: DialogHeaderProps) {
  const { projects } = useProjects();

  return (
    <ShadcnDialogHeader className="pb-3 pt-4 px-4 sm:px-6 border-b flex-shrink-0">
      <div className="flex flex-col gap-3">
        {/* Title Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 sm:size-10 bg-primary/10 rounded-lg flex justify-center items-center">
              <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl text-foreground">
                All Projects
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Manage your workspace
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2">
          <ProjectDialog>
            <Button
              size="sm"
              className="flex items-center gap-2 flex-1 sm:flex-none cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Button>
          </ProjectDialog>

          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteAll}
            disabled={projects.length === 0}
            className="flex items-center gap-2 transition-all duration-200 flex-1 sm:flex-none hover:bg-red-600 hover:text-white hover:border-red-600 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear All</span>
            <span className="sm:hidden">Clear</span>
          </Button>
        </div>
      </div>
    </ShadcnDialogHeader>
  );
}
