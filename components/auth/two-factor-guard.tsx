"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { verifyTwoFactorLoginAction } from "@/app/actions/security";

export default function TwoFactorGuard() {
  const { data: session, update } = useSession();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isLocked = session?.user?.requires2FA === true;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsLoading(true);
    try {
      const res = await verifyTwoFactorLoginAction(code);

      if (res.success) {
        await update({ requires2FA: false });
        toast.success("Identity verified successfully");
      } else {
        toast.error(res.message || "Invalid code");
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    signOut({ callbackUrl: "/?login=true" });
  };

  if (!isLocked) return null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center">
            Two-Factor Verification
          </DialogTitle>
          <DialogDescription className="text-center">
            You are logging in with a new session. Please enter the code from
            your authenticator app.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerify} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Verification Code</Label>
            <Input
              placeholder="000 000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="text-center text-lg tracking-widest font-mono"
              maxLength={6}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Verify Identity"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={handleCancel}
            >
              Cancel & Logout
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
