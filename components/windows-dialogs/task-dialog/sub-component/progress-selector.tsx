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
}

export default function ProgressSelector({
  selectedProgress,
  onSelectProgress,
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
          "flex items-center gap-2",
          selectedProgressItem.className
        )}
      >
        <selectedProgressItem.icon className="w-4 h-4" />
        <span className="font-medium">{selectedProgressItem.name}</span>
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
    <div className="space-y-2">
      <Label className="text-sm font-medium">Kemajuan</Label>
      <div className="w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full h-11 flex justify-between focus:ring-2 focus:ring-primary/20"
              type="button"
            >
              {renderSelectedProgress()}
              <ChevronDown className="text-muted-foreground w-4 h-4" />
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
