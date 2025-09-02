import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, MoreVertical, Trash2 } from "lucide-react";
import { useProjects } from "@/contexts/projectContext";
import { Project } from "@/contexts/projectContext";
import { formatDateSafely } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onSelect, onDelete }: ProjectCardProps) {
  const { selectedProject } = useProjects();
  const IconComponent = project.icon;
  const allTasks = project.boards.flatMap((board) => board.tasks);
  const totalTasks = allTasks.length;
  const isSelected = selectedProject?.id === project.id;

  return (
    <div
      className={`border rounded-xl transition-all duration-200 cursor-pointer hover:shadow-lg bg-card w-full min-h-[180x] flex flex-col ${
        isSelected
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
          : "border-border hover:border-primary/30"
      }`}
      onClick={onSelect}
    >
      {/* Header Section */}
      <div className="p-4 lg:p-5 border-b border-border/50 flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="size-12 lg:size-14 bg-primary rounded-xl flex items-center justify-center text-primary-foreground flex-shrink-0">
              <IconComponent className="w-6 h-6 lg:w-7 lg:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground text-lg lg:text-xl truncate leading-tight">
                  {project.name}
                </h3>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate">
                  {formatDateSafely(project.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 flex-shrink-0 hover:bg-muted"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="flex items-center gap-2 text-red-600 cursor-pointer text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-4 lg:px-5 py-4 lg:py-5">
        <div className="flex items-center justify-between text-sm lg:text-base">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="font-medium">{project.boards.length} boards</span>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <span className="font-medium">{totalTasks} tasks</span>
          </div>
          <div className="text-xs text-muted-foreground">
            ID: {project.id.slice(-6).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
