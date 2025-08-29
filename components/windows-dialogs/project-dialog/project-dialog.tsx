"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/contexts/projectContext";
import { HiFolderPlus } from "react-icons/hi2";

const MAX_PROJECT_NAME_LENGTH = 30;

export default function ProjectDialog() {
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");
  const { addProject, projects } = useProjects();
  const [isOpen, setIsOpen] = useState(false);

  // Function to check if project name already exists
  const isProjectNameExists = (name: string) => {
    return projects.some(
      (project) => project.name.toLowerCase() === name.toLowerCase()
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Batasi input maksimal 30 karakter
    if (value.length > MAX_PROJECT_NAME_LENGTH) {
      return; // Tidak izinkan input lebih dari 30 karakter
    }

    setProjectName(value);

    // Clear error when user starts typing
    if (error) {
      setError("");
    }

    // Check for duplicate name in real-time
    const trimmedValue = value.trim();
    if (trimmedValue && isProjectNameExists(trimmedValue)) {
      setError("A project with this name already exists");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = projectName.trim();

    if (!trimmedName) {
      setError("Project name is required");
      return;
    }

    if (trimmedName.length > MAX_PROJECT_NAME_LENGTH) {
      setError(
        `Project name cannot exceed ${MAX_PROJECT_NAME_LENGTH} characters`
      );
      return;
    }

    if (isProjectNameExists(trimmedName)) {
      setError("A project with this name already exists");
      return;
    }

    // If validation passes, create the project
    addProject(trimmedName);
    setProjectName("");
    setError("");
    setIsOpen(false);
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setProjectName("");
      setError("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button className="rounded-3xl px-5 cursor-pointer">
          <HiFolderPlus className="mr-2 size-5" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="poppins sm:max-w-[425px] poppins top-50 translate-y-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="name"
                  value={projectName}
                  onChange={handleInputChange}
                  placeholder="e.g. Website Redesign"
                  maxLength={MAX_PROJECT_NAME_LENGTH}
                  required
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {projectName.length}/{MAX_PROJECT_NAME_LENGTH} characters
                  </span>
                  <span
                    className={
                      projectName.length >= MAX_PROJECT_NAME_LENGTH
                        ? "text-red-500"
                        : ""
                    }
                  >
                    {projectName.length >= MAX_PROJECT_NAME_LENGTH
                      ? "Maximum reached"
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {error && (
            <div className="grid grid-cols-4 gap-4 -mt-2">
              <div></div>
              <p className="col-span-3 text-sm text-red-500 mb-2">{error}</p>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={
                !projectName.trim() ||
                isProjectNameExists(projectName.trim()) ||
                projectName.length > MAX_PROJECT_NAME_LENGTH
              }
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
