"use client";

import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function InteractiveDemoSection() {
  return (
    <section id="demo" className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Experience a workflow that{" "}
              <span className="text-primary">adapts to you</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Don&apos;t let rigid tools slow you down. Our board adapts to your
              team&apos;s unique workflow with custom columns, labels, and
              automated actions.
            </p>

            <ul className="space-y-4">
              {[
                "Customizable workflow stages",
                "Rich text descriptions & checklists",
                "Priority levels and due dates",
                "Filtering and search capabilities",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="lg:w-1/2 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden relative z-10">
                <div className="border-b border-border p-4 bg-muted/30 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                </div>

                <div className="p-6 grid grid-cols-2 gap-4 h-[300px] bg-muted/10">
                  <div className="flex flex-col gap-3">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      To Do
                    </div>
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 4,
                        ease: "easeInOut",
                      }}
                      className="bg-background p-3 rounded-lg shadow-sm border border-border"
                    >
                      <div className="h-2 w-16 bg-primary/20 rounded mb-2"></div>
                      <div className="h-2 w-full bg-muted rounded mb-1"></div>
                      <div className="h-2 w-2/3 bg-muted rounded"></div>
                    </motion.div>
                    <div className="bg-background p-3 rounded-lg shadow-sm border border-border opacity-60">
                      <div className="h-2 w-12 bg-orange-500/20 rounded mb-2"></div>
                      <div className="h-2 w-3/4 bg-muted rounded"></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      In Progress
                    </div>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut",
                        delay: 1,
                      }}
                      className="bg-background p-3 rounded-lg shadow-sm border border-border"
                    >
                      <div className="h-2 w-10 bg-green-500/20 rounded mb-2"></div>
                      <div className="h-2 w-full bg-muted rounded mb-1"></div>
                      <div className="flex justify-between mt-2">
                        <div className="h-4 w-4 rounded-full bg-muted"></div>
                        <div className="h-2 w-8 bg-muted rounded"></div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
