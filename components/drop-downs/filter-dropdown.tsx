"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Filter,
  CalendarDays,
  AlertCircle,
  Tag,
  LayoutGrid,
  ListChecks,
  TimerOff,
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  CalendarPlus,
  TrendingUp,
  CalendarX,
  BellRing,
  ArrowDown,
  Layout,
  Check,
} from "lucide-react";
import { BsCircleHalf } from "react-icons/bs";
import { FaRegCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { GoDotFill } from "react-icons/go";
import { useProjects } from "@/contexts/projectContext";
import { DEFAULT_LABELS } from "@/constants";
import { DueDateFilter, PriorityFilter, ProgressFilter } from "@/types";
import { cn } from "@/lib/utils";

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

// Komponen item kustom untuk menggantikan DropdownMenuCheckboxItem
const CustomCheckboxItem = ({
  checked,
  onCheckedChange,
  children,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <DropdownMenuItem
    className={cn("cursor-pointer justify-between", className)}
    onSelect={(e) => e.preventDefault()}
    onClick={() => onCheckedChange(!checked)}
  >
    <div className="flex items-center gap-2">{children}</div>
    {checked && <Check className="w-4 h-4 text-primary" />}
  </DropdownMenuItem>
);

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

  const dueDateOptions: {
    id: DueDateFilter;
    label: string;
    icon: React.ElementType;
    className: string;
  }[] = [
    {
      id: "overdue",
      label: "Terlambat",
      icon: TimerOff,
      className: "text-red-600 dark:text-red-400",
    },
    { id: "today", label: "Hari ini", icon: CalendarCheck, className: "" },
    { id: "tomorrow", label: "Besok", icon: CalendarClock, className: "" },
    {
      id: "this-week",
      label: "Minggu ini",
      icon: CalendarRange,
      className: "",
    },
    {
      id: "next-week",
      label: "Minggu depan",
      icon: CalendarPlus,
      className: "",
    },
    { id: "upcoming", label: "Mendatang", icon: TrendingUp, className: "" },
    {
      id: "no-date",
      label: "Tidak ada tanggal",
      icon: CalendarX,
      className: "",
    },
  ];

  const priorityOptions: {
    id: PriorityFilter;
    label: string;
    icon: React.ElementType;
    className: string;
  }[] = [
    {
      id: "urgent",
      label: "Mendesak",
      icon: BellRing,
      className: "text-red-600 dark:text-red-400",
    },
    {
      id: "important",
      label: "Penting",
      icon: AlertCircle,
      className: "text-orange-600 dark:text-orange-400",
    },
    {
      id: "medium",
      label: "Sedang",
      icon: GoDotFill,
      className: "text-green-600 dark:text-green-400",
    },
    {
      id: "low",
      label: "Rendah",
      icon: ArrowDown,
      className: "text-blue-600 dark:text-blue-400",
    },
  ];

  const progressOptions: {
    id: ProgressFilter;
    label: string;
    icon: React.ElementType;
    className: string;
  }[] = [
    {
      id: "not-started",
      label: "Belum dimulai",
      icon: FaRegCircle,
      className: "text-muted-foreground",
    },
    {
      id: "in-progress",
      label: "Dalam proses",
      icon: BsCircleHalf,
      className: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "completed",
      label: "Selesai",
      icon: FaCircleCheck,
      className: "text-green-600 dark:text-green-500",
    },
  ];

  const renderSubTrigger = (
    Icon: React.ElementType,
    title: string,
    count: number,
    total?: number
  ) => (
    <DropdownMenuSubTrigger className="cursor-pointer h-10">
      <Icon className="w-4 h-4 mr-2" />
      <span>
        {title}
        {total !== undefined && ` (${total})`}
      </span>
      {count > 0 && (
        <span className="ml-auto mr-1 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">
          {count}
        </span>
      )}
    </DropdownMenuSubTrigger>
  );

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
            {renderSubTrigger(CalendarDays, "Tenggat waktu", dueDates.size)}
            <DropdownMenuSubContent className="w-44">
              {dueDateOptions.map((opt) => (
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
            {renderSubTrigger(AlertCircle, "Prioritas", priorities.size)}
            <DropdownMenuSubContent className="w-44">
              {priorityOptions.map((opt) => (
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
            {renderSubTrigger(BsCircleHalf, "Kemajuan", progresses.size)}
            <DropdownMenuSubContent className="w-44">
              {progressOptions.map((opt) => (
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
            {renderSubTrigger(Tag, "Label", labels.size, labelsList.length)}
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
            {renderSubTrigger(
              LayoutGrid,
              "Wadah",
              boards.size,
              boardsList.length
            )}
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
            <span>Tugas</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
