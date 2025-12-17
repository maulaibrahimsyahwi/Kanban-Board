"use client";

import type { FormEvent } from "react";

import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomLoader from "@/components/custom-loader";
import { Input } from "@/components/ui/input";

type TwoFactorCardProps = {
  isLoading: boolean;
  twoFactorCode: string;
  onTwoFactorCodeChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onBackToLogin: () => void;
};

export function TwoFactorCard({
  isLoading,
  twoFactorCode,
  onTwoFactorCodeChange,
  onSubmit,
  onBackToLogin,
}: TwoFactorCardProps) {
  return (
    <Card className="border-border/60 shadow-2xl bg-card/95 backdrop-blur-md animate-in zoom-in-95 duration-300 overflow-hidden">
      <CardHeader className="pb-4 pt-8 px-8 bg-muted/20">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-center text-xl">
          Two-Factor Authentication
        </CardTitle>
        <CardDescription className="text-center px-4">
          Enter the 6-digit code from your authenticator app to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex justify-center">
            <Input
              placeholder="000 000"
              value={twoFactorCode}
              onChange={(e) => onTwoFactorCodeChange(e.target.value)}
              className="text-center text-2xl tracking-[0.5em] font-mono h-14 w-full max-w-[280px] border-2 focus-visible:ring-0 focus-visible:border-primary transition-all"
              maxLength={6}
              autoFocus
            />
          </div>
          <div className="space-y-3">
            <Button
              className="w-full h-11 font-medium text-base shadow-lg shadow-primary/20"
              type="submit"
              disabled={isLoading || twoFactorCode.length < 6}
            >
              {isLoading ? (
                <CustomLoader size={18} className="mr-2" />
              ) : (
                "Verify & Login"
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
              type="button"
              onClick={onBackToLogin}
            >
              Back to login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

