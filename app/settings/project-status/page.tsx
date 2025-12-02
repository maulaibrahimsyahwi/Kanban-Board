"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProjectStatus } from "@/types";
import {
  getProjectStatusesAction,
  createProjectStatusAction,
  updateProjectStatusAction,
  deleteProjectStatusAction,
} from "@/app/actions/project-status";
import { useProjects } from "@/contexts/projectContext";

const COLORS = [
  { name: "Slate", value: "bg-slate-500" },
  { name: "Red", value: "bg-red-600" },
  { name: "Orange", value: "bg-orange-600" },
  { name: "Amber", value: "bg-amber-500" },
  { name: "Green", value: "bg-green-600" },
  { name: "Blue", value: "bg-blue-600" },
  { name: "Purple", value: "bg-purple-600" },
  { name: "Pink", value: "bg-pink-600" },
];

export default function ProjectStatusPage() {
  const { refreshStatuses } = useProjects();
  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    setIsLoading(true);
    const res = await getProjectStatusesAction();
    if (res.success && res.data) {
      setStatuses(res.data);
    }
    setIsLoading(false);
  };

  const handleAddStatus = async () => {
    const tempId = "temp-" + Date.now();
    const newStatus: ProjectStatus = {
      id: tempId,
      name: "New Status",
      color: "bg-blue-600",
      isSystem: false,
    };
    setStatuses([...statuses, newStatus]);

    const res = await createProjectStatusAction("New Status", "bg-blue-600");
    if (res.success && res.data) {
      setStatuses((prev) => prev.map((s) => (s.id === tempId ? res.data! : s)));
      toast.success("Status created");
      refreshStatuses();
    } else {
      toast.error("Failed to create status");
      loadStatuses();
    }
  };

  const handleDeleteStatus = async (id: string) => {
    setStatuses(statuses.filter((s) => s.id !== id));

    const res = await deleteProjectStatusAction(id);
    if (res.success) {
      toast.success("Status deleted");
      refreshStatuses();
    } else {
      toast.error("Failed to delete status");
      loadStatuses();
    }
  };

  const handleUpdateStatus = async (
    id: string,
    field: "name" | "color",
    value: string
  ) => {
    setStatuses(
      statuses.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );

    await updateProjectStatusAction(id, { [field]: value });
    refreshStatuses();
  };

  if (isLoading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
        Manage statuses available for your projects. Changes here will reflect
        in the project dropdown immediately.
      </p>

      <Separator />

      <div className="grid grid-cols-[40px_100px_1fr_1fr_60px] gap-4 px-4 text-sm font-medium text-muted-foreground">
        <div></div>
        <div>Color</div>
        <div>Name</div>
        <div>Preview</div>
        <div></div>
      </div>

      <div className="space-y-3">
        {statuses.map((status) => (
          <div
            key={status.id}
            className={cn(
              "grid grid-cols-[40px_100px_1fr_1fr_60px] gap-4 items-center p-3 rounded-md border bg-card transition-all",
              status.isSystem ? "bg-muted/30" : "hover:border-primary/50"
            )}
          >
            <div className="flex justify-center">
              {!status.isSystem && (
                <GripVertical className="w-5 h-5 text-muted-foreground/50 cursor-grab active:cursor-grabbing hover:text-foreground" />
              )}
            </div>

            <div>
              <Select
                value={status.color}
                onValueChange={(val) =>
                  handleUpdateStatus(status.id, "color", val)
                }
                disabled={status.isSystem}
              >
                <SelectTrigger className="w-[80px] h-9 px-2">
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
                        className="p-1 flex justify-center cursor-pointer focus:bg-accent rounded-sm"
                      >
                        <div
                          className={cn("w-6 h-6 rounded-sm", c.value)}
                          title={c.name}
                        />
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Input
                value={status.name}
                onChange={(e) =>
                  handleUpdateStatus(status.id, "name", e.target.value)
                }
                className={cn(
                  "h-9 bg-background",
                  status.isSystem &&
                    "border-transparent bg-transparent shadow-none focus-visible:ring-0 px-0 font-medium text-muted-foreground cursor-default"
                )}
                disabled={status.isSystem}
              />
            </div>

            <div className="flex items-center">
              <span
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium text-white transition-all",
                  status.color
                )}
              >
                {status.name}
              </span>
            </div>

            <div className="flex justify-center">
              {status.isSystem ? (
                <div className="group relative" title="System default">
                  <CircleAlert className="w-5 h-5 text-muted-foreground/30" />
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
