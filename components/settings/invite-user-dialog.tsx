"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
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
import { ChevronDown, Loader2, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useProjects } from "@/contexts/projectContext";
import { cn } from "@/lib/utils";

interface InviteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper untuk validasi email
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Simulasi batas total kursi
const INITIAL_AVAILABLE_SEATS = 39;

export default function InviteUserDialog({
  isOpen,
  onOpenChange,
}: InviteUserDialogProps) {
  const { projects } = useProjects();

  // State untuk Input Email Chips
  const [inputValue, setInputValue] = useState("");
  const [emailChips, setEmailChips] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [role, setRole] = useState("member");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // Hitung sisa kursi
  const remainingSeats = INITIAL_AVAILABLE_SEATS - emailChips.length;

  // Ambil semua email yang sudah ada di tim
  const existingTeamEmails = useMemo(() => {
    const emails = new Set<string>();
    projects.forEach((p) => {
      if (p.owner?.email) emails.add(p.owner.email.toLowerCase());
      p.members?.forEach((m) => {
        if (m.email) emails.add(m.email.toLowerCase());
      });
    });
    return emails;
  }, [projects]);

  // Logic: Select All Projects
  const isAllSelected =
    projects.length > 0 && selectedProjects.length === projects.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProjects([]); // Unselect all
    } else {
      setSelectedProjects(projects.map((p) => p.id)); // Select all
    }
  };

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects((prev) => [...prev, projectId]);
    } else {
      setSelectedProjects((prev) => prev.filter((id) => id !== projectId));
    }
  };

  // --- LOGIC EMAIL CHIP INPUT ---
  const addEmails = (input: string) => {
    if (!input) return;

    const newEmails = input
      .split(/[\s,]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const uniqueNewEmails = newEmails.filter(
      (email) => !emailChips.includes(email)
    );

    if (uniqueNewEmails.length > 0) {
      if (
        emailChips.length + uniqueNewEmails.length >
        INITIAL_AVAILABLE_SEATS
      ) {
        toast.error("Not enough seats available.");
        return;
      }
      setEmailChips((prev) => [...prev, ...uniqueNewEmails]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", "Tab", ",", " "].includes(e.key)) {
      e.preventDefault();
      addEmails(inputValue);
    } else if (e.key === "Backspace" && !inputValue && emailChips.length > 0) {
      setEmailChips((prev) => prev.slice(0, -1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    addEmails(pastedData);
  };

  const removeChip = (emailToRemove: string) => {
    setEmailChips((prev) => prev.filter((email) => email !== emailToRemove));
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    const hasErrors = emailChips.some(
      (email) =>
        !isValidEmail(email) || existingTeamEmails.has(email.toLowerCase())
    );

    if (emailChips.length === 0) {
      toast.error("Please enter at least one email address");
      return;
    }

    if (hasErrors) {
      toast.error("Please remove invalid or existing emails before sending.");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success(`Invitation sent to ${emailChips.length} user(s)`);
    setIsLoading(false);
    onOpenChange(false);

    // Reset form
    setEmailChips([]);
    setInputValue("");
    setRole("member");
    setSelectedProjects([]);
  };

  const getRoleLabel = (r: string) => {
    if (r === "admin") return "Account Admin";
    return "Account Member";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-visible gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold">Invite users</DialogTitle>
        </DialogHeader>

        <div className="px-6 space-y-6 pb-6">
          {/* Email Input Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold text-muted-foreground">
                Emails
              </Label>
              <span
                className={cn(
                  "text-xs",
                  remainingSeats < 0 ? "text-red-500" : "text-muted-foreground"
                )}
              >
                You have {remainingSeats} seats left
              </span>
            </div>

            <div
              className={cn(
                "min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-text",
                "flex flex-wrap content-start gap-2"
              )}
              onClick={handleContainerClick}
            >
              {emailChips.map((email, index) => {
                const isFormatValid = isValidEmail(email);
                const isMember = existingTeamEmails.has(email.toLowerCase());
                const isError = !isFormatValid || isMember;

                let errorMessage = "";
                if (!isFormatValid) errorMessage = "Invalid format";
                else if (isMember) errorMessage = "Already in team";

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors group relative",
                      isError
                        ? "bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                        : "bg-primary/10 text-primary border border-primary/20"
                    )}
                    title={errorMessage}
                  >
                    {isError && <AlertCircle className="w-3 h-3 mr-0.5" />}
                    <span className="max-w-[150px] truncate">{email}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeChip(email);
                      }}
                      className={cn(
                        "ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none"
                      )}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onBlur={() => addEmails(inputValue)}
                className="flex-1 bg-transparent outline-none min-w-[120px] h-7 placeholder:text-muted-foreground/50"
                placeholder={
                  emailChips.length === 0 ? "Enter email addresses..." : ""
                }
                disabled={
                  remainingSeats <= 0 &&
                  emailChips.length >= INITIAL_AVAILABLE_SEATS
                }
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Press Enter, Comma, or Space to add multiple emails.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Account Role Dropdown */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">
                Account role
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full bg-background h-10">
                  <span>{getRoleLabel(role)}</span>
                </SelectTrigger>
                <SelectContent className="w-[280px]">
                  <SelectItem
                    value="admin"
                    className="py-3 cursor-pointer focus:bg-blue-600 focus:text-white data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-700 group"
                  >
                    <div className="flex flex-col gap-1 items-start text-left">
                      <span className="font-medium text-sm">Account Admin</span>
                      <span className="text-xs text-muted-foreground group-focus:text-blue-100 group-data-[state=checked]:text-blue-600 whitespace-normal leading-tight">
                        Can create projects and manage people, has access to all
                        account settings
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="member"
                    className="py-3 cursor-pointer focus:bg-blue-600 focus:text-white data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-700 group"
                  >
                    <div className="flex flex-col gap-1 items-start text-left">
                      <span className="font-medium text-sm">
                        Account Member
                      </span>
                      <span className="text-xs text-muted-foreground group-focus:text-blue-100 group-data-[state=checked]:text-blue-600 whitespace-normal leading-tight">
                        Can be a member of projects to which access has been
                        given
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Project Access Dropdown */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">
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
                <PopoverContent className="w-[280px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search projects..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No projects found.</CommandEmpty>
                      <CommandGroup>
                        {/* Select All Option */}
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

                        {/* Project List Items */}
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
        </div>

        <div className="bg-muted/10 px-6 py-4 flex justify-end gap-3 border-t">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || emailChips.length === 0}
            className="bg-[#8EB6E6] hover:bg-[#0052CC] text-white font-medium min-w-[140px] transition-colors shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Send invitation"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
