"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { UserProfile } from "@/types";
import { convertVirtualResourceAction } from "@/app/actions/resources";

interface ConvertResourceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  resource: UserProfile;
  members: UserProfile[]; // Menerima data members
  onConverted?: () => void;
}

export default function ConvertResourceDialog({
  isOpen,
  onOpenChange,
  projectId,
  resource,
  members,
  onConverted,
}: ConvertResourceDialogProps) {
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [deleteAfterConvert, setDeleteAfterConvert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId("");
      setDeleteAfterConvert(false);
    }
  }, [isOpen]);

  // Cari user object berdasarkan email yang dipilih
  const selectedUser = members.find((m) => m.id === selectedUserId);

  const handleConvert = async () => {
    if (!projectId) {
      toast.error("Project not found.");
      return;
    }

    if (!selectedUser) return;

    setIsLoading(true);
    const result = await convertVirtualResourceAction({
      projectId,
      resourceId: resource.id,
      targetUserId: selectedUser.id,
      deleteAfterConvert,
    });

    if (result.success) {
      const userName = selectedUser?.name || selectedUser?.email || "the user";
      const resourceLabel = resource.name || "the resource";
      toast.success(`Successfully converted ${resourceLabel} to ${userName}`);
      onOpenChange(false);
      setSelectedUserId("");
      setDeleteAfterConvert(false);
      onConverted?.();
    } else {
      toast.error(result.message || "Failed to convert resource");
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-6 overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Convert a virtual resource into a real user
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground/80 mt-2">
            You are going to convert a virtual resource into a real user. After
            the conversion, all virtual resource&apos;s tasks in this project
            will be reassigned to the user.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex items-center gap-3">
          {/* Virtual Resource Display */}
          <div className="flex-1 flex items-center gap-3 bg-muted/30 px-3 py-2 rounded-md border border-border h-10">
            <div className="w-6 h-6 rounded-full bg-slate-500 flex items-center justify-center text-white text-[10px] uppercase font-medium">
              {(resource.name || "R").substring(0, 1)}
            </div>
            <span className="text-sm font-medium">
              {resource.name || "Untitled resource"}
            </span>
          </div>

          <ArrowRight className="w-5 h-5 text-muted-foreground" />

          {/* Real User Combobox */}
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Real user
            </label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between h-10 font-normal px-3 bg-background"
                >
                  {selectedUser ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={selectedUser.image || ""} />
                        <AvatarFallback className="text-[9px] bg-blue-500 text-white">
                          {selectedUser.name?.substring(0, 1).toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">
                        {selectedUser.name || selectedUser.email}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Enter a name or select
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search" className="h-9 text-xs" />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup
                      heading="PROJECT TEAM"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      {members.map((member) => (
                        <CommandItem
                          key={member.id}
                          value={member.name || member.email || ""}
                          onSelect={() => {
                            setSelectedUserId(member.id);
                            setOpenCombobox(false);
                          }}
                          className="text-sm cursor-pointer py-2"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.image || ""} />
                              <AvatarFallback className="text-[10px] bg-blue-500 text-white">
                                {member.name?.substring(0, 1).toUpperCase() ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">
                              {member.name || member.email}
                            </span>
                          </div>
                          {selectedUserId === member.id && (
                            <Check className="ml-auto h-4 w-4 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Checkbox
            id="delete-resource"
            checked={deleteAfterConvert}
            onCheckedChange={(checked) =>
              setDeleteAfterConvert(checked as boolean)
            }
          />
          <label
            htmlFor="delete-resource"
            className="text-sm text-foreground cursor-pointer select-none"
          >
            Delete the virtual resource from the project after the conversion
          </label>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-blue-400 hover:bg-blue-500 text-white min-w-[80px]"
            onClick={handleConvert}
            disabled={!selectedUser || isLoading}
          >
            {isLoading ? "Converting..." : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
