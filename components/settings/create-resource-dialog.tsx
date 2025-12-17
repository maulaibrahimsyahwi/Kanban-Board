"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProjects } from "@/contexts/projectContext";
import { ColorPicker } from "./create-resource-dialog/color-picker";
import { ProjectAccessSelect } from "./create-resource-dialog/project-access-select";
import { RESOURCE_COLORS } from "./create-resource-dialog/resource-colors";
import { ResourceChipsInput } from "./create-resource-dialog/resource-chips-input";

interface CreateResourceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateResourceDialog({
  isOpen,
  onOpenChange,
}: CreateResourceDialogProps) {
  const { projects } = useProjects();

  const [inputValue, setInputValue] = useState("");
  const [resourceChips, setResourceChips] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [color, setColor] = useState<string>(RESOURCE_COLORS[11]); // Default to Zinc/Gray-ish
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
            <ResourceChipsInput
              inputRef={inputRef}
              inputValue={inputValue}
              onInputValueChange={setInputValue}
              onKeyDown={handleKeyDown}
              onBlur={() => addResources(inputValue)}
              placeholder={resourceChips.length === 0 ? "Enter the name" : ""}
              chips={resourceChips}
              chipColorClass={color}
              onRemoveChip={removeChip}
            />

            <ColorPicker
              color={color}
              setColor={setColor}
              colors={RESOURCE_COLORS}
              isOpen={isColorPickerOpen}
              onOpenChange={setIsColorPickerOpen}
            />
          </div>

          <ProjectAccessSelect
            projects={projects}
            selectedProjectIds={selectedProjects}
            isOpen={isProjectDropdownOpen}
            onOpenChange={setIsProjectDropdownOpen}
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll}
            onSelectProject={handleSelectProject}
          />
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
