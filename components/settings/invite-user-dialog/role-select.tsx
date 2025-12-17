"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type RoleSelectProps = {
  role: string;
  onRoleChange: (value: string) => void;
  getRoleLabel: (value: string) => string;
};

export function RoleSelect({ role, onRoleChange, getRoleLabel }: RoleSelectProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground">
        Account role
      </Label>
      <Select value={role} onValueChange={onRoleChange}>
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
                Can create projects and manage people, has access to all account
                settings
              </span>
            </div>
          </SelectItem>
          <SelectItem
            value="member"
            className="py-3 cursor-pointer focus:bg-blue-600 focus:text-white data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-700 group"
          >
            <div className="flex flex-col gap-1 items-start text-left">
              <span className="font-medium text-sm">Account Member</span>
              <span className="text-xs text-muted-foreground group-focus:text-blue-100 group-data-[state=checked]:text-blue-600 whitespace-normal leading-tight">
                Can be a member of projects to which access has been given
              </span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

