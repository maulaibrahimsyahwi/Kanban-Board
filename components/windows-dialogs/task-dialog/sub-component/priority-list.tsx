import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Task } from "@/types";

import { IoIosArrowDown } from "react-icons/io";
import { RiArrowDownDoubleFill } from "react-icons/ri";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { MdOutlineKeyboardDoubleArrowUp } from "react-icons/md";
import { IconType } from "react-icons/lib";
import { IoCheckmark } from "react-icons/io5";

type PriorityItem = {
  id: Task["priority"];
  name: string;
  icon: IconType;
  textColor: string;
  backgroundColor: string;
};

const PriorityListArray: PriorityItem[] = [
  {
    id: "low",
    name: "Low",
    icon: RiArrowDownDoubleFill,
    textColor: "text-green-700",
    backgroundColor: "bg-green-500/10",
  },
  {
    id: "medium",
    name: "Medium",
    icon: MdKeyboardDoubleArrowRight,
    textColor: "text-yellow-700",
    backgroundColor: "bg-yellow-500/10",
  },
  {
    id: "important",
    name: "High",
    icon: MdOutlineKeyboardDoubleArrowUp,
    textColor: "text-red-700",
    backgroundColor: "bg-red-500/10",
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
    PriorityListArray[0];

  const handleSelectPriority = (priorityItem: PriorityItem) => {
    onSelectPriority(priorityItem.id);
  };

  function renderSelectedPriority() {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`size-6 ${selectedPriorityItem.backgroundColor} rounded-md flex items-center justify-center text-lg ${selectedPriorityItem.textColor}`}
        >
          <selectedPriorityItem.icon />
        </div>
        <span className={`${selectedPriorityItem.textColor} font-medium`}>
          {selectedPriorityItem.name}
        </span>
      </div>
    );
  }

  function renderDropDownItem(priorityItem: PriorityItem) {
    const isSelected = priorityItem.id === selectedPriority;

    return (
      <DropdownMenuItem
        key={priorityItem.id}
        className="flex justify-between items-center cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800"
        onClick={() => handleSelectPriority(priorityItem)}
      >
        <div className="flex items-center gap-2">
          <div
            className={`size-6 ${priorityItem.backgroundColor} rounded-md flex items-center justify-center text-lg ${priorityItem.textColor}`}
          >
            <priorityItem.icon />
          </div>
          <span className={`${priorityItem.textColor}`}>
            {priorityItem.name}
          </span>
        </div>
        {isSelected && <IoCheckmark className="text-primary" />}
      </DropdownMenuItem>
    );
  }

  return (
    <div>
      <Label className="text-sm font-medium">Priority</Label>
      <div className="mt-2 w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full h-11 flex justify-between focus:ring-2 focus:ring-primary/20"
              type="button"
            >
              {renderSelectedPriority()}
              <IoIosArrowDown className="text-gray-600" />
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
