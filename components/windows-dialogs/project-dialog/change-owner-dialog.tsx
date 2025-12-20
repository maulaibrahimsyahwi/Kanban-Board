"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Loader2 } from "lucide-react";
import { transferProjectOwnershipAction } from "@/app/actions/project";
import { useProjects } from "@/contexts/projectContext";

interface ChangeOwnerDialogProps {
  projectId: string;
  currentOwnerId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  members: UserProfile[];
}

export default function ChangeOwnerDialog({
  isOpen,
  onOpenChange,
  members,
  projectId,
  currentOwnerId,
}: ChangeOwnerDialogProps) {
  const [selectedOwner, setSelectedOwner] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { refreshProjects } = useProjects();

  const eligibleMembers = useMemo(
    () => members.filter((member) => !member.isVirtual && member.id !== currentOwnerId),
    [members, currentOwnerId]
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedOwner("");
    }
  }, [isOpen]);

  const handleTransfer = async () => {
    if (!selectedOwner || isLoading) return;

    setIsLoading(true);
    const result = await transferProjectOwnershipAction(projectId, selectedOwner);

    if (result.success) {
      toast.success("Ownership transferred successfully");
      setSelectedOwner("");
      onOpenChange(false);
      refreshProjects();
    } else {
      toast.error(result.message || "Failed to transfer ownership");
    }
    setIsLoading(false);
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
              {eligibleMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name || member.email || "Unknown"}
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
            disabled={!selectedOwner || isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ok"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
