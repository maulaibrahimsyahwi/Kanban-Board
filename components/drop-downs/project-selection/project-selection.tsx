"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import ProjectCommandItems from "./project-command-items";
import { useProjects } from "@/contexts/projectContext";

export default function ProjectSelectionDropDown() {
  const { projects, selectedProject, selectProject } = useProjects();

  if (!selectedProject) {
    return (
      <div className="w-full text-center p-4 bg-muted rounded-xl">
        <p className="text-muted-foreground">No projects found.</p>
        <p className="text-sm text-muted-foreground">
          Click &apos;Create Project&apos; to start.
        </p>
      </div>
    );
  }

  const IconComponent = selectedProject.icon;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex justify-between py-9 rounded-xl bg-card border hover:bg-card/80 cursor-pointer min-w-0"
        >
          {/* Left side - Project info with proper text truncation */}
          <div className="flex items-start flex-col text-base gap-1 text-left min-w-0 flex-1 pr-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide flex-shrink-0">
              PROJECT
            </p>
            <p
              className="font-bold text-foreground truncate w-full text-left"
              title={selectedProject.name} // Show full name on hover
            >
              {selectedProject.name}
            </p>
          </div>

          {/* Right side - Icon and chevron */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="size-10 bg-primary rounded-full flex items-center justify-center text-2xl text-primary-foreground">
              {IconComponent && <IconComponent />}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 poppins rounded-xl w-[var(--radix-popover-trigger-width)] bg-popover border border-border shadow-lg">
        <ProjectCommandItems
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={selectProject}
        />
      </PopoverContent>
    </Popover>
  );
}
