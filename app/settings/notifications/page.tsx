"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
// Pastikan path ini sesuai dengan nama file di server actions
import {
  getNotificationSettingsAction,
  updateNotificationSettingsAction,
  restoreDefaultNotificationSettingsAction,
} from "@/app/actions/notifications";
import { NotificationSettingsState } from "@/types";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NOTIFICATION_SELECT_ROWS,
  NOTIFICATION_SIMPLE_ROWS,
  NOTIFICATION_TOGGLE_ROWS,
} from "./notification-data";
import {
  EmailPushHeader,
  NotificationRowSimple,
  NotificationRowWithSelect,
  NotificationToggleRow,
} from "./notification-rows";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettingsState>(
    DEFAULT_NOTIFICATION_SETTINGS
  );

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
          <EmailPushHeader />

          {NOTIFICATION_SELECT_ROWS.map((row) => (
            <NotificationRowWithSelect
              key={row.id}
              label={row.label}
              selectValue={settings[row.triggerKey] as string}
              onSelectChange={(val) => handleUpdate(row.triggerKey, val)}
              emailChecked={settings[row.emailKey] as boolean}
              onEmailChange={(val) => handleUpdate(row.emailKey, val)}
              pushChecked={settings[row.pushKey] as boolean}
              onPushChange={(val) => handleUpdate(row.pushKey, val)}
            />
          ))}

          <Separator className="my-4 opacity-50" />

          {NOTIFICATION_SIMPLE_ROWS.map((row) => (
            <NotificationRowSimple
              key={row.id}
              label={row.label}
              emailChecked={settings[row.emailKey] as boolean}
              onEmailChange={(val) => handleUpdate(row.emailKey, val)}
              pushChecked={settings[row.pushKey] as boolean}
              onPushChange={(val) => handleUpdate(row.pushKey, val)}
            />
          ))}
        </div>

        <Separator />

        <div className="space-y-4 pt-2">
          {NOTIFICATION_TOGGLE_ROWS.map((row) => (
            <NotificationToggleRow
              key={row.id}
              label={row.label}
              checked={settings[row.key] as boolean}
              onCheckedChange={(val) => handleUpdate(row.key, val)}
            />
          ))}
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
