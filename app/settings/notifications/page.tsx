"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
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
// Pastikan path ini sesuai dengan nama file di server actions
import {
  getNotificationSettingsAction,
  updateNotificationSettingsAction,
  restoreDefaultNotificationSettingsAction,
} from "@/app/actions/notifications";
import { NotificationSettingsState } from "@/types";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettingsState>({
    endDateTrigger: "1day",
    endDateEmail: true,
    endDatePush: true,
    deadlineTrigger: "1day",
    deadlineEmail: true,
    deadlinePush: true,
    startDateTrigger: "1day",
    startDateEmail: true,
    startDatePush: true,
    mentionsEmail: true,
    mentionsPush: true,
    assignedEmail: true,
    assignedPush: true,
    commentsEmail: true,
    commentsPush: true,
    attachmentsEmail: true,
    attachmentsPush: true,
    playSound: true,
    marketingEmails: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const res = await getNotificationSettingsAction();
      if (res.success && res.data) {
        setSettings(res.data as unknown as NotificationSettingsState);
      }
      setInitialLoading(false);
    };
    loadSettings();
  }, []);

  const handleUpdate = (
    key: keyof NotificationSettingsState,
    value: string | boolean
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await updateNotificationSettingsAction(settings);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  const handleRestoreDefault = async () => {
    setLoading(true);
    const res = await restoreDefaultNotificationSettingsAction();
    if (res.success) {
      toast.success(res.message);
      const refresh = await getNotificationSettingsAction();
      if (refresh.success && refresh.data) {
        setSettings(refresh.data as unknown as NotificationSettingsState);
      }
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
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
          <div className="flex justify-end gap-8 px-4 mb-2 text-sm font-medium text-muted-foreground">
            <span className="w-8 text-center">Email</span>
            <span className="w-8 text-center">Push</span>
          </div>

          <NotificationRowWithSelect
            label={
              <span>
                Notify me about <span className="font-semibold">end date</span>{" "}
                of task. Before:
              </span>
            }
            selectValue={settings.endDateTrigger}
            onSelectChange={(val) => handleUpdate("endDateTrigger", val)}
            emailChecked={settings.endDateEmail}
            onEmailChange={(val) => handleUpdate("endDateEmail", val)}
            pushChecked={settings.endDatePush}
            onPushChange={(val) => handleUpdate("endDatePush", val)}
          />

          <NotificationRowWithSelect
            label={
              <span>
                Notify me about <span className="font-semibold">deadlines</span>
                . Before:
              </span>
            }
            selectValue={settings.deadlineTrigger}
            onSelectChange={(val) => handleUpdate("deadlineTrigger", val)}
            emailChecked={settings.deadlineEmail}
            onEmailChange={(val) => handleUpdate("deadlineEmail", val)}
            pushChecked={settings.deadlinePush}
            onPushChange={(val) => handleUpdate("deadlinePush", val)}
          />

          <NotificationRowWithSelect
            label={
              <span>
                Notify me about{" "}
                <span className="font-semibold">start date</span> of task.
                Before:
              </span>
            }
            selectValue={settings.startDateTrigger}
            onSelectChange={(val) => handleUpdate("startDateTrigger", val)}
            emailChecked={settings.startDateEmail}
            onEmailChange={(val) => handleUpdate("startDateEmail", val)}
            pushChecked={settings.startDatePush}
            onPushChange={(val) => handleUpdate("startDatePush", val)}
          />

          <Separator className="my-4 opacity-50" />

          <NotificationRowSimple
            label={
              <span>
                Notify me when someone{" "}
                <span className="font-semibold">@mentions</span> me
              </span>
            }
            emailChecked={settings.mentionsEmail}
            onEmailChange={(val) => handleUpdate("mentionsEmail", val)}
            pushChecked={settings.mentionsPush}
            onPushChange={(val) => handleUpdate("mentionsPush", val)}
          />
          <NotificationRowSimple
            label={
              <span>
                Notify me when someone{" "}
                <span className="font-semibold">assigns</span> me a task
              </span>
            }
            emailChecked={settings.assignedEmail}
            onEmailChange={(val) => handleUpdate("assignedEmail", val)}
            pushChecked={settings.assignedPush}
            onPushChange={(val) => handleUpdate("assignedPush", val)}
          />
          <NotificationRowSimple
            label={
              <span>
                Notify me about <span className="font-semibold">comments</span>{" "}
                in my tasks
              </span>
            }
            emailChecked={settings.commentsEmail}
            onEmailChange={(val) => handleUpdate("commentsEmail", val)}
            pushChecked={settings.commentsPush}
            onPushChange={(val) => handleUpdate("commentsPush", val)}
          />
          <NotificationRowSimple
            label={
              <span>
                Notify me about{" "}
                <span className="font-semibold">attachments</span> in my tasks
              </span>
            }
            emailChecked={settings.attachmentsEmail}
            onEmailChange={(val) => handleUpdate("attachmentsEmail", val)}
            pushChecked={settings.attachmentsPush}
            onPushChange={(val) => handleUpdate("attachmentsPush", val)}
          />
        </div>

        <Separator />

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              Play a sound when receiving a notification
            </span>
            <div className="flex items-center gap-2">
              <div className="h-[1px] flex-1 bg-border/50 border-dashed w-full min-w-[20px] mx-4 hidden sm:block" />
              <Switch
                checked={settings.playSound}
                onCheckedChange={(val) => handleUpdate("playSound", val)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              Email notifications on special offers and updates
            </span>
            <div className="flex items-center gap-2">
              <div className="h-[1px] flex-1 bg-border/50 border-dashed w-full min-w-[20px] mx-4 hidden sm:block" />
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(val) => handleUpdate("marketingEmails", val)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-8">
          <Button
            variant="link"
            className="text-muted-foreground hover:text-primary px-0"
            onClick={handleRestoreDefault}
            disabled={loading}
          >
            Switch back to the default settings
          </Button>

          <Button
            onClick={handleSave}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotificationRowWithSelect({
  label,
  selectValue,
  onSelectChange,
  emailChecked,
  onEmailChange,
  pushChecked,
  onPushChange,
}: {
  label: React.ReactNode;
  selectValue: string;
  onSelectChange: (val: string) => void;
  emailChecked: boolean;
  onEmailChange: (val: boolean) => void;
  pushChecked: boolean;
  onPushChange: (val: boolean) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 gap-3 sm:gap-0">
      <div className="flex-1 text-sm text-foreground flex items-center whitespace-nowrap mr-2">
        {label}
      </div>

      <div className="hidden sm:block flex-1 border-b border-border border-dashed mx-2 h-1 relative top-[2px] opacity-60"></div>

      <div className="flex items-center justify-end gap-4 sm:gap-6">
        <Select value={selectValue} onValueChange={onSelectChange}>
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
              checked={emailChecked}
              onCheckedChange={(checked) => onEmailChange(checked as boolean)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>
          <div className="w-8 flex justify-center">
            <Checkbox
              checked={pushChecked}
              onCheckedChange={(checked) => onPushChange(checked as boolean)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationRowSimple({
  label,
  emailChecked,
  onEmailChange,
  pushChecked,
  onPushChange,
}: {
  label: React.ReactNode;
  emailChecked: boolean;
  onEmailChange: (val: boolean) => void;
  pushChecked: boolean;
  onPushChange: (val: boolean) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 gap-3 sm:gap-0">
      <div className="text-sm text-foreground whitespace-nowrap mr-2">
        {label}
      </div>

      <div className="hidden sm:block flex-1 border-b border-border border-dashed mx-2 h-1 relative top-[2px] opacity-60"></div>

      <div className="flex items-center justify-end gap-8 px-2">
        <div className="w-8 flex justify-center">
          <Checkbox
            checked={emailChecked}
            onCheckedChange={(checked) => onEmailChange(checked as boolean)}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
        </div>
        <div className="w-8 flex justify-center">
          <Checkbox
            checked={pushChecked}
            onCheckedChange={(checked) => onPushChange(checked as boolean)}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
        </div>
      </div>
    </div>
  );
}
