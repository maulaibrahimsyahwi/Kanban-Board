"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, ShieldCheck, Smartphone } from "lucide-react";

export function TwoFactorActivateDialog({
  isOpen,
  onOpenChange,
  qrCodeUrl,
  verificationCode,
  setVerificationCode,
  isLoading,
  onActivate,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodeUrl: string;
  verificationCode: string;
  setVerificationCode: (value: string) => void;
  isLoading: boolean;
  onActivate: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#0070f3] hover:bg-[#0060df] text-white">
          Activate
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="bg-muted/50 p-6 space-y-4 border-r">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Two-factor authentication
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Set up an authenticator app as a second layer of security for your
              account.
            </p>
          </div>

          <div className="md:col-span-2 p-6 space-y-6 overflow-y-auto max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Activate Two-Factor Authentication
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Follow the steps below to enable 2FA for your account.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-6">
              <div className="w-24 h-24 bg-muted/30 border rounded-sm flex items-center justify-center flex-shrink-0">
                <Smartphone
                  className="w-10 h-10 text-muted-foreground/50"
                  strokeWidth={1.5}
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Download an authenticator app</h3>
                <p className="text-sm text-muted-foreground">
                  Download and install Google Authenticator (
                  <span className="text-primary cursor-pointer">IOS</span>,{" "}
                  <span className="text-primary cursor-pointer">Android</span>)
                  for your phone or tablet.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-48 h-48 bg-white border rounded-sm flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                {qrCodeUrl ? (
                  <Image
                    src={qrCodeUrl}
                    alt="QR Code"
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-muted animate-pulse">
                    <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Scan the QR code</h3>
                <p className="text-sm text-muted-foreground">
                  Open the authentication app and scan the image to the left,
                  using your phone&apos;s camera.{" "}
                  <strong className="text-foreground">
                    This QR code will not be shown again after 2FA is enabled.
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-24 h-24 bg-muted/30 border rounded-sm flex items-center justify-center flex-shrink-0">
                <Smartphone
                  className="w-10 h-10 text-muted-foreground/50"
                  strokeWidth={1.5}
                />
              </div>
              <div className="space-y-4 flex-1">
                <h3 className="font-semibold">
                  Enable two-factor authentication
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit verification code from the app.
                </p>
                <Input
                  placeholder="000 000"
                  className="max-w-md text-lg tracking-widest"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <Button
                  className="bg-[#0070f3] hover:bg-[#0060df] text-white w-32"
                  onClick={onActivate}
                  disabled={isLoading}
                >
                  {isLoading ? "Activating..." : "Activate"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

