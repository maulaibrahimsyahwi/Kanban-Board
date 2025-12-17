import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  KeyRound,
  Layout,
  ListChecks,
  Lock,
  Mail,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";

export type MarketingIconCardItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#views", label: "Views" },
  { href: "#demo", label: "How it works" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
] as const;

export const FEATURES: MarketingIconCardItem[] = [
  {
    title: "Drag & Drop",
    description: "Intuitive kanban board with smooth drag and drop interactions.",
    icon: Layout,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Multiple Views",
    description: "Switch between board, list, calendar, charts, and people view.",
    icon: ListChecks,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Team Management",
    description: "Invite members, assign roles, and manage access in settings.",
    icon: Users,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    title: "Labels, priorities, due dates",
    description: "Organize tasks with rich metadata so nothing slips through.",
    icon: Tags,
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    title: "Notifications",
    description: "Tune email and push notifications to match your workflow.",
    icon: Bell,
    color: "bg-yellow-500/10 text-yellow-700",
  },
  {
    title: "2FA Security",
    description: "Add an extra layer of protection with two-factor auth.",
    icon: ShieldCheck,
    color: "bg-green-500/10 text-green-600",
  },
];

export const VIEWS: MarketingIconCardItem[] = [
  {
    title: "Kanban Board",
    description: "Drag & drop tasks and columns for instant progress updates.",
    icon: Layout,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "List View",
    description: "Scan, edit, and bulk-manage tasks in a fast table layout.",
    icon: ListChecks,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Calendar",
    description: "Plan due dates and move tasks directly on the calendar.",
    icon: CalendarDays,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Charts",
    description: "Track status distribution and overall progress at a glance.",
    icon: BarChart3,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    title: "People",
    description: "See workload and assignments by teammate to balance delivery.",
    icon: Users,
    color: "bg-pink-500/10 text-pink-600",
  },
];

export const SECURITY_ITEMS: MarketingIconCardItem[] = [
  {
    title: "Two-factor authentication (2FA)",
    description: "Add an extra layer of protection for every sign-in.",
    icon: ShieldCheck,
    color: "bg-green-500/10 text-green-600",
  },
  {
    title: "Secure sessions",
    description: "Keep access scoped to the right devices and accounts.",
    icon: Lock,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Password reset flow",
    description: "Built-in reset flow with verification code support.",
    icon: Mail,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Roles & team controls",
    description: "Manage teams, invitations, and access through settings.",
    icon: Users,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    title: "Strong passwords",
    description: "Password strength indicator to guide better security.",
    icon: KeyRound,
    color: "bg-pink-500/10 text-pink-600",
  },
];

export const FAQS = [
  {
    q: "Can I use this as a personal kanban board?",
    a: "Yes. Create a project, add boards, and manage tasks with priorities, labels, and due dates.",
  },
  {
    q: "Does it support different views?",
    a: "Yes - board, list, calendar, charts, and people view are available to fit different workflows.",
  },
  {
    q: "Is 2FA available?",
    a: "Yes. You can enable two-factor authentication from the security/team settings area.",
  },
  {
    q: "Can I customize project statuses?",
    a: "Yes. Project statuses can be created and edited so your team can use consistent progress labels.",
  },
] as const;

export const DEMO_FEATURE_ITEMS = [
  "Customizable workflow stages",
  "Rich text descriptions & checklists",
  "Priority levels and due dates",
  "Filtering and search capabilities",
] as const;

