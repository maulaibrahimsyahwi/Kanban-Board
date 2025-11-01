import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Task } from "@/types";
import {
  BellRing,
  AlertCircle,
  Circle,
  ArrowDown,
  ChevronDown,
} from "lucide-react";
import { IconType } from "lucide-react";
import { IoCheckmark } from "react-icons/io5";
import { cn } from "@/lib/utils";

type PriorityItem = {
  id: Task["priority"];
  name: string;
  icon: IconType;
  className: string;
};

const PriorityListArray: PriorityItem[] = [
  {
    id: "urgent",
    name: "Mendesak",
    icon: BellRing,
    className: "text-red-600 dark:text-red-400",
  },
  {
    id: "important",
    name: "Penting",
    icon: AlertCircle,
    className: "text-orange-600 dark:text-orange-400",
  },
  {
    id: "medium",
    name: "Sedang",
    icon: Circle,
    className: "text-green-600 dark:text-green-400",
  },
  {
    id: "low",
    name: "Rendah",
    icon: ArrowDown,
    className: "text-blue-600 dark:text-blue-400",
  },
];

interface PrioritySelectorProps {
  selectedPriority: Task["priority"];
  onSelectPriority: (priority: Task["priority"]) => void;
}

export default function PrioritySelector({
  selectedPriority,
  onSelectPriority,
}: PrioritySelectorProps) {
  const selectedPriorityItem =
    PriorityListArray.find((p) => p.id === selectedPriority) ||
    PriorityListArray[2];

  const handleSelectPriority = (priorityItem: PriorityItem) => {
    onSelectPriority(priorityItem.id);
  };

  function renderSelectedPriority() {
    return (
      <div
        className={cn(
          "flex items-center gap-2",
          selectedPriorityItem.className
        )}
      >
        <selectedPriorityItem.icon className="w-4 h-4" />
        <span className="font-medium">{selectedPriorityItem.name}</span>
      </div>
    );
  }

  function renderDropDownItem(priorityItem: PriorityItem) {
    const isSelected = priorityItem.id === selectedPriority;

    return (
      <DropdownMenuItem
        key={priorityItem.id}
        className={cn(
          "flex justify-between items-center cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800",
          priorityItem.className
        )}
        onClick={() => handleSelectPriority(priorityItem)}
      >
        <div className="flex items-center gap-2">
          <priorityItem.icon className="w-4 h-4" />
          <span>{priorityItem.name}</span>
        </div>
        {isSelected && <IoCheckmark className="text-primary" />}
      </DropdownMenuItem>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Prioritas</Label>
      <div className="w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full h-11 flex justify-between focus:ring-2 focus:ring-primary/20"
              type="button"
            >
              {renderSelectedPriority()}
              <ChevronDown className="text-muted-foreground w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] poppins"
          >
            {PriorityListArray.map((priorityItem) =>
              renderDropDownItem(priorityItem)
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
