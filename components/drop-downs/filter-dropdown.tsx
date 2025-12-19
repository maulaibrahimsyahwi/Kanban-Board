"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter, CalendarDays, AlertCircle, Tag, LayoutGrid, ListChecks, Layout } from "lucide-react";
import { BsCircleHalf } from "react-icons/bs";
import { useProjects } from "@/contexts/projectContext";
import { DEFAULT_LABELS } from "@/constants";
import { DueDateFilter, PriorityFilter, ProgressFilter } from "@/types";
import { cn } from "@/lib/utils";
import { DUE_DATE_OPTIONS, PRIORITY_OPTIONS, PROGRESS_OPTIONS } from "./filter-dropdown-options";
import { CustomCheckboxItem, FilterSubTrigger } from "./filter-dropdown-ui";

interface FilterDropdownProps {
  dueDates: Set<DueDateFilter>;
  setDueDates: React.Dispatch<React.SetStateAction<Set<DueDateFilter>>>;
  priorities: Set<PriorityFilter>;
  setPriorities: React.Dispatch<React.SetStateAction<Set<PriorityFilter>>>;
  progresses: Set<ProgressFilter>;
  setProgresses: React.Dispatch<React.SetStateAction<Set<ProgressFilter>>>;
  labels: Set<string>;
  setLabels: React.Dispatch<React.SetStateAction<Set<string>>>;
  boards: Set<string>;
  setBoards: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export default function FilterDropdown({
  dueDates,
  setDueDates,
  priorities,
  setPriorities,
  progresses,
  setProgresses,
  labels,
  setLabels,
  boards,
  setBoards,
}: FilterDropdownProps) {
  const { selectedProject } = useProjects();

  const boardsList = selectedProject?.boards || [];
  const labelsList = DEFAULT_LABELS;

  const clearFilters = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDueDates(new Set());
    setPriorities(new Set());
    setProgresses(new Set());
    setLabels(new Set());
    setBoards(new Set());
  };

  const activeFilterCount =
    dueDates.size +
    priorities.size +
    progresses.size +
    labels.size +
    boards.size;

  const handleCheckedChange = <T,>(
    setter: React.Dispatch<React.SetStateAction<Set<T>>>,
    item: T,
    checked: boolean
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(item);
      } else {
        next.delete(item);
      }
      return next;
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 cursor-pointer"
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 p-0" align="end">
        <div className="flex items-center justify-between p-2.5">
          <span className="text-sm font-semibold">Filter</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-auto px-2 py-1 text-primary"
            onClick={clearFilters}
            disabled={activeFilterCount === 0}
          >
            Hapus semua
          </Button>
        </div>

        <DropdownMenuSeparator className="m-0" />

        <div className="p-1">
          <DropdownMenuSub>
            <FilterSubTrigger
              Icon={CalendarDays}
              title="Tenggat waktu"
              count={dueDates.size}
            />
            <DropdownMenuSubContent className="w-44">
              {DUE_DATE_OPTIONS.map((opt) => (
                <CustomCheckboxItem
                  key={opt.id}
                  checked={dueDates.has(opt.id)}
                  onCheckedChange={(checked) =>
                    handleCheckedChange(setDueDates, opt.id, !!checked)
                  }
                  className={opt.className}
                >
                  <opt.icon className="w-4 h-4" />
                  {opt.label}
                </CustomCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <FilterSubTrigger
              Icon={AlertCircle}
              title="Prioritas"
              count={priorities.size}
            />
            <DropdownMenuSubContent className="w-44">
              {PRIORITY_OPTIONS.map((opt) => (
                <CustomCheckboxItem
                  key={opt.id}
                  checked={priorities.has(opt.id)}
                  onCheckedChange={(checked) =>
                    handleCheckedChange(setPriorities, opt.id, !!checked)
                  }
                  className={opt.className}
                >
                  <opt.icon className="w-4 h-4" />
                  {opt.label}
                </CustomCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <FilterSubTrigger
              Icon={BsCircleHalf}
              title="Kemajuan"
              count={progresses.size}
            />
            <DropdownMenuSubContent className="w-44">
              {PROGRESS_OPTIONS.map((opt) => (
                <CustomCheckboxItem
                  key={opt.id}
                  checked={progresses.has(opt.id)}
                  onCheckedChange={(checked) =>
                    handleCheckedChange(setProgresses, opt.id, !!checked)
                  }
                  className={opt.className}
                >
                  <opt.icon className="w-4 h-4" />
                  {opt.label}
                </CustomCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <FilterSubTrigger
              Icon={Tag}
              title="Label"
              count={labels.size}
              total={labelsList.length}
            />
            <DropdownMenuSubContent className="w-44">
              {labelsList.map((label) => (
                <CustomCheckboxItem
                  key={label.id}
                  checked={labels.has(label.name)}
                  onCheckedChange={(checked) =>
                    handleCheckedChange(setLabels, label.name, !!checked)
                  }
                >
                  <span className={cn("w-2 h-2 rounded-full", label.color)} />
                  {label.name}
                </CustomCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <FilterSubTrigger
              Icon={LayoutGrid}
              title="Wadah"
              count={boards.size}
              total={boardsList.length}
            />
            <DropdownMenuSubContent className="w-44">
              {boardsList.map((board) => (
                <CustomCheckboxItem
                  key={board.id}
                  checked={boards.has(board.id)}
                  onCheckedChange={(checked) =>
                    handleCheckedChange(setBoards, board.id, !!checked)
                  }
                >
                  <Layout className="w-4 h-4" />
                  {board.name}
                </CustomCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem
            className="cursor-pointer h-10"
            onSelect={(e) => e.preventDefault()}
          >
            <ListChecks className="w-4 h-4 mr-2" />
            <span>Tasks</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
