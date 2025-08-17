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

export default function ProjectDialog() {
  const [projectName, setProjectName] = useState("");
  const { addProject } = useProjects();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const validateProjectName = (name: string) => {
    if (!name.trim()) {
      setError("Project name is required");
      return false;
    }
    if (name.length < 3) {
      setError("Project name must be at least 3 characters");
      return false;
    }
    if (name.length > 30) {
      setError("Project name must be less than 30 characters");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProjectName(projectName)) {
      return;
    }

    addProject(projectName.trim());
    setProjectName("");
    setError("");
    setIsOpen(false);
  };

  const handleCancel = () => {
    setProjectName("");
    setError("");
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProjectName(value);
    if (error) {
      validateProjectName(value);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setProjectName("");
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-3xl px-5">Create Project</Button>
      </DialogTrigger>
      <DialogContent className="poppins sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="name" className="text-right pt-2">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={projectName}
                  onChange={handleInputChange}
                  className={error ? "border-red-500" : ""}
                  placeholder="e.g. Website Redesign"
                  required
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!projectName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
