"use client";

import { Layout, Zap, Users, Shield, Globe, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
  const features = [
    {
      title: "Drag & Drop",
      desc: "Intuitive kanban board with smooth drag and drop interactions.",
      icon: Layout,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Real-time Sync",
      desc: "Collaborate with your team and see updates instantly.",
      icon: Zap,
      color: "bg-yellow-500/10 text-yellow-600",
    },
    {
      title: "Team Management",
      desc: "Invite members, assign roles, and track individual progress.",
      icon: Users,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      title: "Secure & Private",
      desc: "Enterprise-grade security with 2FA and data encryption.",
      icon: Shield,
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "Global Access",
      desc: "Access your boards from anywhere, on any device.",
      icon: Globe,
      color: "bg-pink-500/10 text-pink-600",
    },
    {
      title: "Progress Tracking",
      desc: "Visual charts and calendars to keep your project on track.",
      icon: CheckCircle2,
      color: "bg-orange-500/10 text-orange-600",
    },
  ];

  return (
    <section
      id="features"
      className="py-24 bg-muted/30 border-y border-border/50"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Everything you need to ship
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help your team focus on what matters
            most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
