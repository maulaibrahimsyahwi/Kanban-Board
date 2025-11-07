"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Task } from "@/types";
import { FaRegCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { BsCircleHalf } from "react-icons/bs";
import { ChevronDown } from "lucide-react";
import { IconType } from "react-icons";
import { IoCheckmark } from "react-icons/io5";
import { cn } from "@/lib/utils";

type ProgressItem = {
  id: Task["progress"];
  name: string;
  icon: IconType;
  className: string;
};

const ProgressListArray: ProgressItem[] = [
  {
    id: "not-started",
    name: "Belum dimulai",
    icon: FaRegCircle,
    className: "text-muted-foreground",
  },
  {
    id: "in-progress",
    name: "Dalam proses",
    icon: BsCircleHalf,
    className: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "completed",
    name: "Selesai",
    icon: FaCircleCheck,
    className: "text-green-600 dark:text-green-500",
  },
];

interface ProgressSelectorProps {
  selectedProgress: Task["progress"];
  onSelectProgress: (progress: Task["progress"]) => void;
  size?: "default" | "sm";
}

export default function ProgressSelector({
  selectedProgress,
  onSelectProgress,
  size = "default",
}: ProgressSelectorProps) {
  const selectedProgressItem =
    ProgressListArray.find((p) => p.id === selectedProgress) ||
    ProgressListArray[0];

  const handleSelectProgress = (progressItem: ProgressItem) => {
    onSelectProgress(progressItem.id);
  };

  function renderSelectedProgress() {
    return (
      <div
        className={cn(
          "flex items-center gap-1 min-w-0",
          selectedProgressItem.className
        )}
      >
        <selectedProgressItem.icon className="w-3 h-3 flex-shrink-0" />
        <span
          className={cn("font-medium truncate", size === "sm" && "text-xs")}
        >
          {selectedProgressItem.name}
        </span>
      </div>
    );
  }

  function renderDropDownItem(progressItem: ProgressItem) {
    const isSelected = progressItem.id === selectedProgress;

    return (
      <DropdownMenuItem
        key={progressItem.id}
        className={cn(
          "flex justify-between items-center cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800",
          progressItem.className
        )}
        onClick={() => handleSelectProgress(progressItem)}
      >
        <div className="flex items-center gap-2">
          <progressItem.icon className="w-4 h-4" />
          <span>{progressItem.name}</span>
        </div>
        {isSelected && <IoCheckmark className="text-primary" />}
      </DropdownMenuItem>
    );
  }

  return (
    <div className={cn("space-y-2", size === "sm" && "space-y-0")}>
      {size === "default" && (
        <Label className="text-sm font-medium">Kemajuan</Label>
      )}
      <div className={cn(size === "default" ? "w-full" : "w-fit")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "flex justify-between focus:ring-2 focus:ring-primary/20",
                // Mengubah w-fit menjadi w-full untuk menghindari tumpang tindih di kolom sempit
                size === "default" ? "h-11 w-full px-4" : "h-7 px-1 py-0 w-full"
              )}
              type="button"
            >
              {renderSelectedProgress()}
              <ChevronDown className="text-muted-foreground w-3 h-3 ml-1 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] poppins"
          >
            {ProgressListArray.map((progressItem) =>
              renderDropDownItem(progressItem)
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
