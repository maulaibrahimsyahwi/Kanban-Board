"use client";

import React, { useState, useRef, useMemo } from "react";
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
import { EmailChipsInput } from "./invite-user-dialog/email-chips-input";
import { ProjectAccessSelect } from "./invite-user-dialog/project-access-select";
import { RoleSelect } from "./invite-user-dialog/role-select";

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
          <EmailChipsInput
            inputRef={inputRef}
            inputValue={inputValue}
            onInputValueChange={setInputValue}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={() => addEmails(inputValue)}
            placeholder={emailChips.length === 0 ? "Enter email addresses..." : ""}
            disabled={
              remainingSeats <= 0 && emailChips.length >= INITIAL_AVAILABLE_SEATS
            }
            remainingSeats={remainingSeats}
            emailChips={emailChips}
            onRemoveChip={removeChip}
            isValidEmail={isValidEmail}
            existingTeamEmails={existingTeamEmails}
          />

          <div className="grid grid-cols-2 gap-4">
            <RoleSelect role={role} onRoleChange={setRole} getRoleLabel={getRoleLabel} />
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
