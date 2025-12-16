"use client";

import { motion } from "framer-motion";
import { BarChart3, CalendarDays, Layout, ListChecks, Users } from "lucide-react";

import { SectionHeader } from "./section-header";

const views = [
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

export function ViewsSection() {
  return (
    <section id="views" className="py-24 scroll-mt-24">
      <div className="container mx-auto px-4">
        <SectionHeader
          title={
            <>
              Choose the view that fits your{" "}
              <span className="text-primary">workflow</span>
            </>
          }
          description="Switch between board, list, calendar, and charts without losing context — all backed by the same tasks."
        />

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {views.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ y: -5 }}
              className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color}`}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
