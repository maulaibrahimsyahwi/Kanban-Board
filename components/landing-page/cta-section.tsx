"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function CTASection() {
  const router = useRouter();
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -z-10"></div>
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to streamline your workflow?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of teams who have switched to FreeKanban for a better
            project management experience.
          </p>
          <Button
            size="lg"
            className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20"
            onClick={() => router.push("/?login=true")}
          >
            Get Started for Free
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
