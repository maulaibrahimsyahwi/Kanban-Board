import { Briefcase, GraduationCap, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const STEPS = [
  {
    id: 1,
    title: "Ukuran Tim",
    desc: "Berapa banyak anggota tim yang akan menggunakan GanttPRO?",
  },
  {
    id: 2,
    title: "Tujuan",
    desc: "Untuk apa Anda berencana menggunakan GanttPRO?",
  },
  { id: 3, title: "Industri", desc: "Di industri apa Anda bekerja?" },
] as const;

export const TEAM_SIZE_OPTIONS = [
  "Hanya saya",
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
  { id: "Work", label: "Pekerjaan", icon: Briefcase },
  { id: "Personal projects", label: "Proyek Pribadi", icon: User },
  { id: "Studying", label: "Belajar / Studi", icon: GraduationCap },
];

export const INDUSTRY_OPTIONS = [
  "Konstruksi",
  "Manufaktur",
  "Teknologi & Engineering",
  "Konsultan",
  "Pemasaran & Digital",
  "IT / Software",
  "Kesehatan",
  "Keuangan",
  "Lainnya...",
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

