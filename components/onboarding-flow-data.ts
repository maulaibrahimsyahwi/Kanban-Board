import { Briefcase, GraduationCap, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const STEPS = [
  {
    id: 1,
    title: "Team size",
    desc: "How many people will use your workspace?",
  },
  {
    id: 2,
    title: "Purpose",
    desc: "What do you plan to use this workspace for?",
  },
  { id: 3, title: "Industry", desc: "Which industry do you work in?" },
] as const;

export const TEAM_SIZE_OPTIONS = [
  "Just me",
  "2-5",
  "6-10",
  "11-20",
  "21-50",
  "50+",
] as const;

export const PURPOSE_OPTIONS: ReadonlyArray<{
  id: string;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "Work", label: "Work", icon: Briefcase },
  { id: "Personal projects", label: "Personal projects", icon: User },
  { id: "Studying", label: "Studying / Education", icon: GraduationCap },
];

export const INDUSTRY_OPTIONS = [
  "Construction",
  "Manufacturing",
  "Technology & Engineering",
  "Consulting",
  "Marketing & Digital",
  "IT / Software",
  "Healthcare",
  "Finance",
  "Other...",
] as const;

export const MOTION_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -50 : 50,
    opacity: 0,
  }),
};
