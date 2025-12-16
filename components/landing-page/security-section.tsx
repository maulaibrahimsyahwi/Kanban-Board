"use client";

import { motion } from "framer-motion";
import { KeyRound, Lock, Mail, ShieldCheck, Users } from "lucide-react";

import { SectionHeader } from "./section-header";

const items = [
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

export function SecuritySection() {
  return (
    <section id="security" className="py-24 bg-muted/30 scroll-mt-24">
      <div className="container mx-auto px-4">
        <SectionHeader
          title={
            <>
              Built-in <span className="text-primary">security</span> features
            </>
          }
          description="Stay productive without compromising safety — with 2FA, secure sessions, and team controls."
        />

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="bg-card border border-border p-6 rounded-2xl shadow-sm"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color}`}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
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
