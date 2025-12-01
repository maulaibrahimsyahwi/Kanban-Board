"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types";
import { toast } from "sonner";

interface ChangeOwnerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  members: UserProfile[];
}

export default function ChangeOwnerDialog({
  isOpen,
  onOpenChange,
  members,
}: ChangeOwnerDialogProps) {
  const [selectedOwner, setSelectedOwner] = useState("");

  const handleTransfer = () => {
    toast.success("Ownership transferred successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfering project ownership</DialogTitle>
          <DialogDescription className="pt-2 text-foreground/80">
            Choose a new project owner. The list below displays users with the
            right to create projects.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            New project owner
          </label>
          <Select value={selectedOwner} onValueChange={setSelectedOwner}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Enter the name or email" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member, idx) => (
                <SelectItem key={idx} value={member.email || `user-${idx}`}>
                  {member.name || member.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-blue-400 hover:bg-blue-500 text-white min-w-[80px]"
            onClick={handleTransfer}
            disabled={!selectedOwner}
          >
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
