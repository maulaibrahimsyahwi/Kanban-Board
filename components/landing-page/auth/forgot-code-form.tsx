"use client";

import type { FormEvent } from "react";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ForgotCodeFormProps = {
  resetCode: string;
  onResetCodeChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onChangeEmail: () => void;
};

export function ForgotCodeForm({
  resetCode,
  onResetCodeChange,
  onSubmit,
  onChangeEmail,
}: ForgotCodeFormProps) {
  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 pt-2"
      onSubmit={onSubmit}
    >
      <div className="grid gap-2">
        <Label>Verification Code</Label>
        <Input
          placeholder="000 000"
          className="text-center text-2xl tracking-[0.5em] font-mono h-14"
          maxLength={6}
          value={resetCode}
          onChange={(e) => onResetCodeChange(e.target.value)}
          autoFocus
          required
        />
        <p className="text-xs text-muted-foreground text-center">
          Check your email inbox for the code.
        </p>
      </div>
      <Button className="w-full h-11" type="submit">
        Verify Code
      </Button>
      <Button
        variant="ghost"
        className="w-full"
        type="button"
        onClick={onChangeEmail}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Change Email
      </Button>
    </motion.form>
  );
}

