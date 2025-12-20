"use client";

import { User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types";

const getUserKey = (user: UserProfile) => user.id || user.email || "";

const isSameUser = (a: UserProfile, b: UserProfile) => {
  if (a.id && b.id) return a.id === b.id;
  if (a.email && b.email) return a.email === b.email;
  return false;
};

type TaskAssigneePopoverProps = {
  members?: UserProfile[];
  assignees: UserProfile[];
  onToggleAssignee: (member: UserProfile) => void;
};

export default function TaskAssigneePopover({
  members,
  assignees,
  onToggleAssignee,
}: TaskAssigneePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3 rounded-md gap-2 transition-all duration-200",
            "bg-transparent text-muted-foreground",
            "hover:bg-blue-100 hover:text-blue-700",
            "dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
          )}
        >
          <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center opacity-70">
            <User className="w-3 h-3" />
          </div>
          <span>Add assignee</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup heading="Project Members">
              {members?.map((member) => {
                const isSelected = assignees.some((a) => isSameUser(a, member));
                return (
                  <CommandItem
                    key={getUserKey(member)}
                    onSelect={() => onToggleAssignee(member)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={member.image || ""} />
                      <AvatarFallback className="text-[10px]">
                        {member.name?.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                      <span
                        className={cn(
                          "text-sm truncate flex-1",
                          isSelected ? "font-bold text-primary" : ""
                        )}
                      >
                        {member.name || member.email || "Unknown"}
                      </span>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </CommandItem>
                );
              })}
              {(!members || members.length === 0) && (
                <div className="p-2 text-xs text-muted-foreground text-center">
                  No members found.
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type SelectedAssigneesProps = {
  assignees: UserProfile[];
  onToggleAssignee: (member: UserProfile) => void;
};

export function SelectedAssignees({
  assignees,
  onToggleAssignee,
}: SelectedAssigneesProps) {
  if (assignees.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {assignees.map((user, idx) => (
        <div
          key={getUserKey(user) || String(idx)}
          className="flex items-center gap-2 bg-muted/50 pl-1 pr-2 py-1 rounded-full border text-xs"
        >
          <Avatar className="w-5 h-5">
            <AvatarImage src={user.image || ""} />
          <AvatarFallback className="text-[9px]">
            {user.name?.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
          <span className="max-w-[100px] truncate">
            {user.name || user.email || "Unknown"}
          </span>
          <button
            onClick={() => onToggleAssignee(user)}
            className="hover:text-red-500 ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
