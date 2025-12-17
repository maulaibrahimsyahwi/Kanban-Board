"use client";

import type { FormEvent } from "react";

import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import CustomLoader from "@/components/custom-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PasswordStrength = {
  score: number;
  label: string;
  color: string;
};

type ForgotNewPasswordFormProps = {
  isLoading: boolean;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  newPassword: string;
  onNewPasswordChange: (value: string) => void;
  passwordStrength: PasswordStrength;
  onSubmit: (e: FormEvent) => void;
};

export function ForgotNewPasswordForm({
  isLoading,
  showPassword,
  onToggleShowPassword,
  newPassword,
  onNewPasswordChange,
  passwordStrength,
  onSubmit,
}: ForgotNewPasswordFormProps) {
  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 pt-2"
      onSubmit={onSubmit}
    >
      <div className="grid gap-2">
        <Label>New Password</Label>
        <div className="relative group">
          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            className="pl-10 pr-10 h-11"
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            className="absolute right-3 top-3.5 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="space-y-1.5 mt-1">
          <div className="flex h-1.5 w-full bg-muted overflow-hidden rounded-full">
            <div
              className={cn("h-full transition-all duration-300", passwordStrength.color)}
              style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
            />
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              passwordStrength.score < 2 ? "text-red-500" : "text-green-600"
            )}
          >
            Kekuatan: {passwordStrength.label}
          </span>
        </div>
      </div>
      <Button
        className="w-full h-11"
        type="submit"
        disabled={isLoading || passwordStrength.score < 2}
      >
        {isLoading ? <CustomLoader size={20} className="mr-2" /> : "Reset Password"}
      </Button>
    </motion.form>
  );
}

