"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronDown, Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { useProjects } from "@/contexts/projectContext";
import { cn } from "@/lib/utils";

interface CreateResourceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const RESOURCE_COLORS = [
  "bg-red-500",
  "bg-blue-600",
  "bg-teal-600",
  "bg-green-500",
  "bg-purple-500",
  "bg-gray-600",
  "bg-pink-400",
  "bg-sky-400",
  "bg-cyan-400",
  "bg-lime-500",
  "bg-fuchsia-500",
  "bg-zinc-500",
  "bg-orange-400",
  "bg-indigo-500",
  "bg-emerald-400",
  "bg-yellow-400",
  "bg-violet-500",
  "bg-slate-500",
  "bg-rose-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-amber-300",
  "bg-purple-300",
  "bg-stone-500",
];

export default function CreateResourceDialog({
  isOpen,
  onOpenChange,
}: CreateResourceDialogProps) {
  const { projects } = useProjects();

  const [inputValue, setInputValue] = useState("");
  const [resourceChips, setResourceChips] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [color, setColor] = useState(RESOURCE_COLORS[11]); // Default to Zinc/Gray-ish
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const isAllSelected =
    projects.length > 0 && selectedProjects.length === projects.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map((p) => p.id));
    }
  };

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects((prev) => [...prev, projectId]);
    } else {
      setSelectedProjects((prev) => prev.filter((id) => id !== projectId));
    }
  };

  const addResources = (input: string) => {
    if (!input) return;

    const newResources = input
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const uniqueNewResources = newResources.filter(
      (res) => !resourceChips.includes(res)
    );

    if (uniqueNewResources.length > 0) {
      setResourceChips((prev) => [...prev, ...uniqueNewResources]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", "Tab", ","].includes(e.key)) {
      e.preventDefault();
      addResources(inputValue);
    } else if (
      e.key === "Backspace" &&
      !inputValue &&
      resourceChips.length > 0
    ) {
      setResourceChips((prev) => prev.slice(0, -1));
    }
  };

  const removeChip = (resToRemove: string) => {
    setResourceChips((prev) => prev.filter((res) => res !== resToRemove));
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleSubmit = async () => {
    if (resourceChips.length === 0) {
      toast.error("Please enter at least one resource name");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success(`${resourceChips.length} resource(s) created successfully`);
    setIsLoading(false);
    onOpenChange(false);

    setResourceChips([]);
    setInputValue("");
    setColor(RESOURCE_COLORS[11]);
    setSelectedProjects([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-visible gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold">
            Create virtual resource
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 space-y-6 pb-6">
          <div className="grid grid-cols-[1fr_100px] gap-4 items-start">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">
                Resource name
              </Label>
              <div
                className={cn(
                  "min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-text",
                  "flex flex-wrap content-start gap-2"
                )}
                onClick={handleContainerClick}
              >
                {resourceChips.map((res, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border group transition-colors"
                  >
                    <div className={cn("w-2 h-2 rounded-full mr-1", color)} />
                    <span className="max-w-[150px] truncate">{res}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeChip(res);
                      }}
                      className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => addResources(inputValue)}
                  className="flex-1 bg-transparent outline-none min-w-[100px] h-6 placeholder:text-muted-foreground/50"
                  placeholder={
                    resourceChips.length === 0 ? "Enter the name" : ""
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">
                Color
              </Label>
              <Popover
                open={isColorPickerOpen}
                onOpenChange={setIsColorPickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full h-[42px] px-2 flex items-center justify-between bg-background"
                  >
                    <div className={cn("w-8 h-6 rounded-sm", color)} />
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[340px] p-4" align="end">
                  <div className="grid grid-cols-6 gap-3">
                    {RESOURCE_COLORS.map((c) => (
                      <div
                        key={c}
                        className={cn(
                          "w-10 h-10 rounded-lg cursor-pointer flex items-center justify-center transition-transform hover:scale-110",
                          c
                        )}
                        onClick={() => {
                          setColor(c);
                          setIsColorPickerOpen(false);
                        }}
                      >
                        {color === c && (
                          <Check className="w-5 h-5 text-white drop-shadow-md" />
                        )}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground">
              Project access
            </Label>
            <Popover
              open={isProjectDropdownOpen}
              onOpenChange={setIsProjectDropdownOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between bg-background font-normal text-foreground min-h-10 h-auto py-2 px-3"
                >
                  {selectedProjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {selectedProjects.map((id) => {
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
                    <span className="text-muted-foreground">
                      Select projects
                    </span>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search projects..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No projects found.</CommandEmpty>
                    <CommandGroup>
                      <div
                        className="px-2 py-2.5 rounded-sm hover:bg-accent cursor-pointer select-none transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelectAll();
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
                            handleSelectProject(
                              project.id,
                              !selectedProjects.includes(project.id)
                            );
                          }}
                          className="flex items-center space-x-2 px-2 py-2 cursor-pointer"
                        >
                          <Checkbox
                            id={project.id}
                            checked={selectedProjects.includes(project.id)}
                            onCheckedChange={(checked) =>
                              handleSelectProject(
                                project.id,
                                checked as boolean
                              )
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
        </div>

        <div className="bg-muted/10 px-6 py-4 flex justify-end gap-3 border-t">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="font-medium bg-muted hover:bg-muted/80 min-w-[80px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || resourceChips.length === 0}
            className="bg-[#8EB6E6] hover:bg-[#0052CC] text-white font-medium min-w-[100px] transition-colors shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
