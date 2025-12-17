"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import { CheckCheck, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  activateTwoFactorAction,
  disableTwoFactorAction,
  generateTwoFactorSecretAction,
} from "@/app/actions/security";
import { TwoFactorActivateDialog } from "./two-factor-activate-dialog";
import { TwoFactorDeactivateDialog } from "./two-factor-deactivate-dialog";

export default function SecurityPageContent() {
  const { data: session, update } = useSession();

  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isTwoFactorEnabled = session?.user?.twoFactorEnabled || false;

  const handle2FAOpenChange = async (open: boolean) => {
    setIs2FAOpen(open);

    if (open && !secretKey) {
      try {
        const res = await generateTwoFactorSecretAction();
        if (res.success && res.secret && res.otpauth) {
          setSecretKey(res.secret);
          const encodedUrl = encodeURIComponent(res.otpauth);
          setQrCodeUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`
          );
        } else {
          toast.error("Failed to generate security keys");
        }
      } catch {
        toast.error("Network error occurred");
      }
    } else if (!open) {
      setSecretKey("");
      setQrCodeUrl("");
      setVerificationCode("");
    }
  };

  const handleActivate2FA = async () => {
    if (verificationCode.length !== 6 || isNaN(Number(verificationCode))) {
      toast.error("Invalid code. Please enter 6 digits.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await activateTwoFactorAction(verificationCode, secretKey);

      if (result.success) {
        await update({ twoFactorEnabled: true });
        toast.success("Two-factor authentication enabled successfully!");
        setIs2FAOpen(false);
      } else {
        toast.error(result.message || "Failed to verify code.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate2FA = async () => {
    setIsLoading(true);
    try {
      const result = await disableTwoFactorAction();

      if (result.success) {
        await update({ twoFactorEnabled: false });
        toast.success("Two-factor authentication disabled.");
        setIsDeactivateDialogOpen(false);
      } else {
        toast.error("Failed to disable 2FA.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-muted-foreground" />
          Security
        </h1>
      </div>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <CheckCheck className="w-5 h-5 text-muted-foreground mt-1" />
          <div className="space-y-2 flex-1">
            <h2 className="text-lg font-semibold">Two-factor authentication</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Two-factor authentication (also known as 2-step verification, 2FA
              or MFA) adds an extra layer of security to your FreeKanban
              Account.
              <br />
              <br />
              It will require you to have access to your mobile phone when you
              sign in. You&apos;ll receive a verification code from an
              authentication app on your phone.
              <br />
              <br />
              Once you have set up two-factor authentication, every time you
              sign in, you&apos;ll be asked to enter a secondary verification
              code along with your password.
            </p>
          </div>
        </div>

        <div className="pl-8">
          {!isTwoFactorEnabled ? (
            <TwoFactorActivateDialog
              isOpen={is2FAOpen}
              onOpenChange={handle2FAOpenChange}
              qrCodeUrl={qrCodeUrl}
              verificationCode={verificationCode}
              setVerificationCode={setVerificationCode}
              isLoading={isLoading}
              onActivate={handleActivate2FA}
            />
          ) : (
            <TwoFactorDeactivateDialog
              isOpen={isDeactivateDialogOpen}
              onOpenChange={setIsDeactivateDialogOpen}
              isLoading={isLoading}
              onDeactivate={handleDeactivate2FA}
            />
          )}
        </div>
      </section>
    </div>
  );
}
