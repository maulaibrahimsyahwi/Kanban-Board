"use client";

import { IoCheckmark } from "react-icons/io5";
import { Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TaskLabel } from "@/constants";

type EditableTaskLabelsDropdownProps = {
  labels: TaskLabel[];
  availableLabels: TaskLabel[];
  onToggleLabel: (label: TaskLabel) => void;
  onRemoveLabelFromBadge: (e: React.MouseEvent, labelName: string) => void;
  onOpenEditLabelDialog: (e: React.MouseEvent, label: TaskLabel) => void;
};

export function EditableTaskLabelsDropdown({
  labels,
  availableLabels,
  onToggleLabel,
  onRemoveLabelFromBadge,
  onOpenEditLabelDialog,
}: EditableTaskLabelsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-wrap gap-1 cursor-pointer hover:underline py-0.5 w-full h-full min-h-[30px] items-center">
          {labels.slice(0, 1).map((label) => (
            <Badge
              key={label.name}
              className={cn("text-xs px-2 py-0.5 font-medium", label.color)}
              onClick={(e) => e.stopPropagation()}
            >
              {label.name}
              <X
                className="w-3 h-3 ml-1"
                onClick={(e) => onRemoveLabelFromBadge(e, label.name)}
              />
            </Badge>
          ))}
          {labels.length > 1 && (
            <span className="text-xs text-muted-foreground">
              +{labels.length - 1}
            </span>
          )}
          {labels.length === 0 ? (
            <span className="text-muted-foreground/70 italic text-xs hover:underline">
              Tambahkan label
            </span>
          ) : null}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-[200px] poppins" align="start">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b mb-1">
          Label Terpilih
        </div>
        {labels.map((label) => (
          <DropdownMenuItem
            key={label.id}
            className={cn(
              "flex justify-between items-center cursor-pointer bg-accent/50 group"
            )}
            onSelect={(e) => e.preventDefault()}
            onClick={() => onToggleLabel(label)}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn("w-3 h-3 rounded-full", label.color.split(" ")[0])}
              />
              <span className="text-sm">{label.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <IoCheckmark className="w-4 h-4 text-primary" />
            </div>
          </DropdownMenuItem>
        ))}

        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1">
          Pilih Label
        </div>
        {availableLabels.map((label) => (
          <DropdownMenuItem
            key={label.id}
            className="flex justify-between items-center cursor-pointer group"
            onSelect={(e) => e.preventDefault()}
            onClick={() => onToggleLabel(label)}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn("w-3 h-3 rounded-full", label.color.split(" ")[0])}
              />
              <span className="text-sm">{label.name}</span>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              className="w-5 h-5 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100"
              onClick={(e) => onOpenEditLabelDialog(e, label)}
            >
              <Pencil className="w-3 h-3" />
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

