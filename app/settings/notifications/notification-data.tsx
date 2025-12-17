import type { NotificationSettingsState } from "@/types";

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsState = {
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
};

export const TRIGGER_OPTIONS = [
  { value: "15min", label: "15 min" },
  { value: "1hour", label: "1 hour" },
  { value: "1day", label: "1 day" },
  { value: "2days", label: "2 days" },
] as const;

type SelectRowConfig = {
  id: string;
  label: React.ReactNode;
  triggerKey: keyof NotificationSettingsState;
  emailKey: keyof NotificationSettingsState;
  pushKey: keyof NotificationSettingsState;
};

type SimpleRowConfig = {
  id: string;
  label: React.ReactNode;
  emailKey: keyof NotificationSettingsState;
  pushKey: keyof NotificationSettingsState;
};

type ToggleRowConfig = {
  id: string;
  label: string;
  key: keyof NotificationSettingsState;
};

export const NOTIFICATION_SELECT_ROWS: SelectRowConfig[] = [
  {
    id: "endDate",
    label: (
      <span>
        Notify me about <span className="font-semibold">end date</span> of task.
        Before:
      </span>
    ),
    triggerKey: "endDateTrigger",
    emailKey: "endDateEmail",
    pushKey: "endDatePush",
  },
  {
    id: "deadline",
    label: (
      <span>
        Notify me about <span className="font-semibold">deadlines</span>. Before:
      </span>
    ),
    triggerKey: "deadlineTrigger",
    emailKey: "deadlineEmail",
    pushKey: "deadlinePush",
  },
  {
    id: "startDate",
    label: (
      <span>
        Notify me about <span className="font-semibold">start date</span> of task.
        Before:
      </span>
    ),
    triggerKey: "startDateTrigger",
    emailKey: "startDateEmail",
    pushKey: "startDatePush",
  },
];

export const NOTIFICATION_SIMPLE_ROWS: SimpleRowConfig[] = [
  {
    id: "mentions",
    label: (
      <span>
        Notify me when someone <span className="font-semibold">@mentions</span> me
      </span>
    ),
    emailKey: "mentionsEmail",
    pushKey: "mentionsPush",
  },
  {
    id: "assigned",
    label: (
      <span>
        Notify me when someone <span className="font-semibold">assigns</span> me
        a task
      </span>
    ),
    emailKey: "assignedEmail",
    pushKey: "assignedPush",
  },
  {
    id: "comments",
    label: (
      <span>
        Notify me about <span className="font-semibold">comments</span> in my
        tasks
      </span>
    ),
    emailKey: "commentsEmail",
    pushKey: "commentsPush",
  },
  {
    id: "attachments",
    label: (
      <span>
        Notify me about <span className="font-semibold">attachments</span> in my
        tasks
      </span>
    ),
    emailKey: "attachmentsEmail",
    pushKey: "attachmentsPush",
  },
];

export const NOTIFICATION_TOGGLE_ROWS: ToggleRowConfig[] = [
  {
    id: "playSound",
    label: "Play a sound when receiving a notification",
    key: "playSound",
  },
  {
    id: "marketingEmails",
    label: "Email notifications on special offers and updates",
    key: "marketingEmails",
  },
];

