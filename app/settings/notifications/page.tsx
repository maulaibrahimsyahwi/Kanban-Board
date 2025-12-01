"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);

  const handleSaveDefault = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Settings restored to default");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-muted-foreground" />
          Notifications
        </h1>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">
            Email and push notifications
          </h2>
          <p className="text-sm text-muted-foreground">
            Set up email and push notifications. In-app notifications are always
            on.
          </p>
        </div>

        <div className="space-y-1">
          {/* Header Row */}
          <div className="flex justify-end gap-8 px-4 mb-2 text-sm font-medium text-muted-foreground">
            <span className="w-8 text-center">Email</span>
            <span className="w-8 text-center">Push</span>
          </div>

          {/* Item 1: End Date */}
          <NotificationRowWithSelect
            label={
              <span>
                Notify me about <span className="font-semibold">end date</span>{" "}
                of task. Before:
              </span>
            }
          />

          {/* Item 2: Deadlines */}
          <NotificationRowWithSelect
            label={
              <span>
                Notify me about <span className="font-semibold">deadlines</span>
                . Before:
              </span>
            }
          />

          {/* Item 3: Start Date */}
          <NotificationRowWithSelect
            label={
              <span>
                Notify me about{" "}
                <span className="font-semibold">start date</span> of task.
                Before:
              </span>
            }
          />

          <Separator className="my-4 opacity-50" />

          {/* Simple Checkbox Rows */}
          <NotificationRowSimple
            label={
              <span>
                Notify me when someone{" "}
                <span className="font-semibold">@mentions</span> me
              </span>
            }
          />
          <NotificationRowSimple
            label={
              <span>
                Notify me when someone{" "}
                <span className="font-semibold">assigns</span> me a task
              </span>
            }
          />
          <NotificationRowSimple
            label={
              <span>
                Notify me about <span className="font-semibold">comments</span>{" "}
                in my tasks
              </span>
            }
          />
          <NotificationRowSimple
            label={
              <span>
                Notify me about{" "}
                <span className="font-semibold">attachments</span> in my tasks
              </span>
            }
          />
        </div>

        <Separator />

        {/* Switch Rows */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              Play a sound when receiving a notification
            </span>
            <div className="flex items-center gap-2">
              <div className="h-[1px] flex-1 bg-border/50 border-dashed w-full min-w-[20px] mx-4 hidden sm:block" />
              <Switch defaultChecked />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              Email notifications on special offers and updates
            </span>
            <div className="flex items-center gap-2">
              <div className="h-[1px] flex-1 bg-border/50 border-dashed w-full min-w-[20px] mx-4 hidden sm:block" />
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <Button
            variant="link"
            className="text-primary hover:text-primary/80"
            onClick={handleSaveDefault}
            disabled={loading}
          >
            Switch back to the default settings
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotificationRowWithSelect({ label }: { label: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 gap-3 sm:gap-0">
      <div className="flex-1 text-sm text-foreground flex items-center whitespace-nowrap mr-2">
        {label}
      </div>

      {/* Dotted Line Spacer */}
      <div className="hidden sm:block flex-1 border-b border-border border-dashed mx-2 h-1 relative top-[2px] opacity-60"></div>

      <div className="flex items-center justify-end gap-4 sm:gap-6">
        <Select defaultValue="1day">
          <SelectTrigger className="w-[90px] h-8 text-xs">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15min">15 min</SelectItem>
            <SelectItem value="1hour">1 hour</SelectItem>
            <SelectItem value="1day">1 day</SelectItem>
            <SelectItem value="2days">2 days</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-8 px-2">
          <div className="w-8 flex justify-center">
            <Checkbox
              defaultChecked
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>
          <div className="w-8 flex justify-center">
            <Checkbox
              defaultChecked
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationRowSimple({ label }: { label: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 gap-3 sm:gap-0">
      <div className="text-sm text-foreground whitespace-nowrap mr-2">
        {label}
      </div>

      {/* Dotted Line Spacer */}
      <div className="hidden sm:block flex-1 border-b border-border border-dashed mx-2 h-1 relative top-[2px] opacity-60"></div>

      <div className="flex items-center justify-end gap-8 px-2">
        <div className="w-8 flex justify-center">
          <Checkbox
            defaultChecked
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
        </div>
        <div className="w-8 flex justify-center">
          <Checkbox
            defaultChecked
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
        </div>
      </div>
    </div>
  );
}
