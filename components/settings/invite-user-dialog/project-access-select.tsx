"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Project } from "@/types";

type ProjectAccessSelectProps = {
  projects: Project[];
  selectedProjectIds: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onSelectProject: (projectId: string, checked: boolean) => void;
};

export function ProjectAccessSelect({
  projects,
  selectedProjectIds,
  isOpen,
  onOpenChange,
  isAllSelected,
  onSelectAll,
  onSelectProject,
}: ProjectAccessSelectProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground">
        Project access
      </Label>
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between bg-background font-normal text-foreground min-h-10 h-auto py-2 px-3"
          >
            {selectedProjectIds.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 flex-1">
                {selectedProjectIds.map((id) => {
                  const project = projects.find((p) => p.id === id);
                  return (
                    <div
                      key={id}
                      className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium border border-primary/20"
                    >
                      {project?.name}
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-muted-foreground">Select projects</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search projects..." className="h-9" />
            <CommandList>
              <CommandEmpty>No projects found.</CommandEmpty>
              <CommandGroup>
                <div
                  className="px-2 py-2.5 rounded-sm hover:bg-accent cursor-pointer select-none transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectAll();
                  }}
                >
                  <span className="text-sm font-medium leading-none text-[#0052CC] pl-1">
                    {isAllSelected ? "Unselect all" : "Select all"}
                  </span>
                </div>

                <div className="h-px bg-border my-1 mx-2" />

                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={project.name}
                    onSelect={() => {
                      onSelectProject(
                        project.id,
                        !selectedProjectIds.includes(project.id)
                      );
                    }}
                    className="flex items-center space-x-2 px-2 py-2 cursor-pointer"
                  >
                    <Checkbox
                      id={project.id}
                      checked={selectedProjectIds.includes(project.id)}
                      onCheckedChange={(checked) =>
                        onSelectProject(project.id, checked as boolean)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label
                      htmlFor={project.id}
                      className="text-sm leading-none cursor-pointer flex-1 truncate select-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {project.name}
                    </label>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

