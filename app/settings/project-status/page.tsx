"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  GripVertical,
  CircleAlert,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Definisi tipe untuk status
type ProjectStatusItem = {
  id: string;
  name: string;
  color: string;
  isSystem: boolean; // Penanda untuk status default sistem (seperti "No status")
};

// Pilihan warna yang tersedia
const COLORS = [
  { name: "Slate", value: "bg-slate-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Amber", value: "bg-amber-400" },
  { name: "Green", value: "bg-green-500" },
  { name: "Blue", value: "bg-blue-500" },
  { name: "Purple", value: "bg-purple-500" },
  { name: "Pink", value: "bg-pink-500" },
];

export default function ProjectStatusPage() {
  const [statuses, setStatuses] = useState<ProjectStatusItem[]>([
    { id: "1", name: "No status", color: "bg-slate-500", isSystem: true },
    { id: "2", name: "On track", color: "bg-green-500", isSystem: false },
    { id: "3", name: "At risk", color: "bg-amber-400", isSystem: false },
    { id: "4", name: "Off track", color: "bg-red-500", isSystem: false },
  ]);

  const handleAddStatus = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newStatus: ProjectStatusItem = {
      id: newId,
      name: "",
      color: "bg-slate-500",
      isSystem: false,
    };
    setStatuses([...statuses, newStatus]);
  };

  const handleDeleteStatus = (id: string) => {
    setStatuses(statuses.filter((s) => s.id !== id));
    toast.success("Status deleted");
  };

  const handleUpdateStatus = (
    id: string,
    field: keyof ProjectStatusItem,
    value: string
  ) => {
    setStatuses(
      statuses.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-muted-foreground" />
            Project status
          </h1>
        </div>
        <Button
          className="bg-[#0052CC] hover:bg-[#0052CC]/90 text-white gap-2"
          onClick={handleAddStatus}
        >
          <Plus className="w-4 h-4" />
          Create new
        </Button>
      </div>

      <p className="text-sm text-muted-foreground max-w-3xl">
        The project status will be displayed next to its name. You can use the
        default statuses or create your own.
      </p>

      <Separator />

      {/* Table Header */}
      <div className="grid grid-cols-[40px_100px_1fr_60px] gap-4 px-4 text-sm font-medium text-muted-foreground">
        <div></div> {/* Placeholder untuk drag handle */}
        <div>Color</div>
        <div>Name</div>
        <div></div> {/* Placeholder untuk action */}
      </div>

      {/* Status List */}
      <div className="space-y-3">
        {statuses.map((status) => (
          <div
            key={status.id}
            className={cn(
              "grid grid-cols-[40px_100px_1fr_60px] gap-4 items-center p-2 rounded-md border bg-card transition-all",
              status.isSystem ? "bg-muted/30" : "hover:border-primary/50"
            )}
          >
            {/* Drag Handle */}
            <div className="flex justify-center">
              {!status.isSystem && (
                <GripVertical className="w-5 h-5 text-muted-foreground/50 cursor-grab active:cursor-grabbing hover:text-foreground" />
              )}
            </div>

            {/* Color Selector */}
            <div>
              <Select
                value={status.color}
                onValueChange={(val) =>
                  handleUpdateStatus(status.id, "color", val)
                }
              >
                <SelectTrigger className="w-[60px] h-9 px-2">
                  <SelectValue>
                    <div className={cn("w-5 h-5 rounded-sm", status.color)} />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <div className="grid grid-cols-4 gap-2 p-2">
                    {COLORS.map((c) => (
                      <SelectItem
                        key={c.value}
                        value={c.value}
                        className="p-1 flex justify-center cursor-pointer focus:bg-accent"
                      >
                        <div
                          className={cn("w-5 h-5 rounded-sm", c.value)}
                          title={c.name}
                        />
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Name Input */}
            <div>
              <Input
                value={status.name}
                onChange={(e) =>
                  handleUpdateStatus(status.id, "name", e.target.value)
                }
                className={cn(
                  "h-9 bg-background",
                  status.isSystem &&
                    "border-transparent bg-transparent shadow-none focus-visible:ring-0 px-0 font-medium"
                )}
                disabled={status.isSystem}
                placeholder="Enter status name"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              {status.isSystem ? (
                <div className="group relative">
                  <CircleAlert className="w-5 h-5 text-muted-foreground/50" />
                  {/* Optional Tooltip logic could go here */}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteStatus(status.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
