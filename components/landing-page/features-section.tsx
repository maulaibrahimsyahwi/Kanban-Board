"use client";

import {
  Bell,
  Layout,
  ListChecks,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

import { SectionHeader } from "./section-header";

export function FeaturesSection() {
  const features = [
    {
      title: "Drag & Drop",
      desc: "Intuitive kanban board with smooth drag and drop interactions.",
      icon: Layout,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Multiple Views",
      desc: "Switch between board, list, calendar, charts, and people view.",
      icon: ListChecks,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      title: "Team Management",
      desc: "Invite members, assign roles, and manage access in settings.",
      icon: Users,
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      title: "Labels, priorities, due dates",
      desc: "Organize tasks with rich metadata so nothing slips through.",
      icon: Tags,
      color: "bg-pink-500/10 text-pink-600",
    },
    {
      title: "Notifications",
      desc: "Tune email and push notifications to match your workflow.",
      icon: Bell,
      color: "bg-yellow-500/10 text-yellow-700",
    },
    {
      title: "2FA Security",
      desc: "Add an extra layer of protection with two-factor auth.",
      icon: ShieldCheck,
      color: "bg-green-500/10 text-green-600",
    },
  ];

  return (
    <section id="features" className="py-24 bg-muted/30 scroll-mt-24">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Everything you need to ship"
          description="Features mapped to the real workflow inside FreeKanban — from task planning to team and security settings."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
