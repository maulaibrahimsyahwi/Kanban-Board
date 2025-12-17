"use client";

import type { FormEvent } from "react";

import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import CustomLoader from "@/components/custom-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ForgotEmailFormProps = {
  isLoading: boolean;
  resetEmail: string;
  onResetEmailChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onBackToLogin: () => void;
};

export function ForgotEmailForm({
  isLoading,
  resetEmail,
  onResetEmailChange,
  onSubmit,
  onBackToLogin,
}: ForgotEmailFormProps) {
  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 pt-2"
      onSubmit={onSubmit}
    >
      <div className="grid gap-2">
        <Label>Email Address</Label>
        <div className="relative group">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="email"
            placeholder="name@example.com"
            className="pl-10 h-11"
            value={resetEmail}
            onChange={(e) => onResetEmailChange(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </div>
      <Button className="w-full h-11" type="submit" disabled={isLoading}>
        {isLoading ? <CustomLoader size={20} className="mr-2" /> : "Send Reset Code"}
      </Button>
      <Button
        variant="ghost"
        className="w-full"
        type="button"
        onClick={onBackToLogin}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
      </Button>
    </motion.form>
  );
}

