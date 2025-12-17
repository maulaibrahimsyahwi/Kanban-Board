"use client";

import type { ChangeEvent, FormEvent } from "react";

import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

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

type RegisterData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterFormProps = {
  isLoading: boolean;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  registerData: RegisterData;
  onRegisterInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  passwordStrength: PasswordStrength;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export function RegisterForm({
  isLoading,
  showPassword,
  onToggleShowPassword,
  registerData,
  onRegisterInputChange,
  passwordStrength,
  onSubmit,
}: RegisterFormProps) {
  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={onSubmit}
      className="grid gap-5"
    >
      <div className="grid gap-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative group">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            className="pl-10 h-11"
            required
            disabled={isLoading}
            value={registerData.name}
            onChange={onRegisterInputChange}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="register-email">Email</Label>
        <div className="relative group">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="register-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            className="pl-10 h-11"
            required
            disabled={isLoading}
            value={registerData.email}
            onChange={onRegisterInputChange}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="register-password">Password</Label>
        <div className="relative group">
          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="pl-10 pr-10 h-11"
            required
            disabled={isLoading}
            value={registerData.password}
            onChange={onRegisterInputChange}
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            className="absolute right-3 top-3.5 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {registerData.password ? (
          <div className="space-y-1.5 mt-1">
            <div className="flex h-1.5 w-full bg-muted overflow-hidden rounded-full">
              <div
                className={cn("h-full transition-all duration-300", passwordStrength.color)}
                style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span
                className={cn(
                  "font-medium",
                  passwordStrength.score < 2
                    ? "text-red-500"
                    : passwordStrength.score < 4
                      ? "text-yellow-600"
                      : "text-green-600"
                )}
              >
                Kekuatan: {passwordStrength.label}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <div className="relative group">
          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="confirm-password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            className="pl-10 pr-10 h-11"
            required
            disabled={isLoading}
            value={registerData.confirmPassword}
            onChange={onRegisterInputChange}
          />
        </div>
      </div>

      <Button
        className="w-full mt-2 h-11 font-semibold text-base"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? <CustomLoader size={20} className="mr-2" /> : "Create Account"}
      </Button>
    </motion.form>
  );
}

