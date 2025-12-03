"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  CheckCheck,
  Smartphone,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  generateTwoFactorSecretAction,
  activateTwoFactorAction,
  disableTwoFactorAction,
} from "@/app/actions/security";
import {
  getSSOSettingsAction,
  updateSSOSettingsAction,
  deactivateSSOAction,
} from "@/app/actions/sso";

export default function SecurityPage() {
  const { data: session, update } = useSession();

  const [isSSOActive, setIsSSOActive] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(true);
  const [ssoSaving, setSsoSaving] = useState(false);

  // UX FIX: State untuk melacak apakah data sudah tersimpan di server
  const [isSavedOnServer, setIsSavedOnServer] = useState(false);

  const [ssoForm, setSsoForm] = useState({
    domain: "",
    ssoUrl: "",
    issuer: "",
    certificate: "",
    forceSSO: false,
  });

  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isTwoFactorEnabled = session?.user?.twoFactorEnabled || false;

  useEffect(() => {
    const loadSSO = async () => {
      const res = await getSSOSettingsAction();
      if (res.success && res.data) {
        if (res.data.isActive) {
          setIsSSOActive(true);
          setIsSavedOnServer(true); // Tandai bahwa data ini berasal dari server
        }
        setSsoForm({
          domain: res.data.domain || "",
          ssoUrl: res.data.ssoUrl || "",
          issuer: res.data.issuer || "",
          certificate: res.data.certificate || "",
          forceSSO: res.data.forceSSO || false,
        });
      }
      setSsoLoading(false);
    };
    loadSSO();
  }, []);

  const handleSSOChange = (field: string, value: string | boolean) => {
    setSsoForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSSO = async () => {
    setSsoSaving(true);
    const res = await updateSSOSettingsAction({ ...ssoForm, isActive: true });
    if (res.success) {
      toast.success(res.message);
      setIsSavedOnServer(true); // Update status tersimpan setelah berhasil save
    } else {
      toast.error(res.message);
    }
    setSsoSaving(false);
  };

  const handleActivateSSO = () => {
    setIsSSOActive(true);
    // Kita tidak set isSavedOnServer di sini karena user baru saja membuka form
  };

  const handleDeactivateSSO = async () => {
    // UX FIX: Jika belum pernah disimpan ke server (baru buka form),
    // cukup tutup tampilan lokal saja tanpa panggil API.
    if (!isSavedOnServer) {
      setIsSSOActive(false);
      return;
    }

    setSsoSaving(true);
    const res = await deactivateSSOAction();
    if (res.success) {
      setIsSSOActive(false);
      setIsSavedOnServer(false); // Reset status tersimpan
      toast.info(res.message);
    } else {
      toast.error(res.message);
    }
    setSsoSaving(false);
  };

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
          <ShieldCheck className="w-5 h-5 text-muted-foreground mt-1" />
          <div className="space-y-2 flex-1">
            <h2 className="text-lg font-semibold">
              Single sign-on (SSO, SAML)
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              SSO is a solution for organization access management to
              third-party corporate resources and services.
              <br />
              <br />
              FreeKanban can be configured as one of the service providers (SP)
              connected to your SSO identity provider (IdP) using SAML.
              <br />
              <br />
              You can setup SAML connection yourself with the most popular SSO
              systems (e.g.{" "}
              <span className="text-primary hover:underline cursor-pointer">
                Okta
              </span>
              ,{" "}
              <span className="text-primary hover:underline cursor-pointer">
                OneLogin
              </span>
              ,{" "}
              <span className="text-primary hover:underline cursor-pointer">
                Azure AD
              </span>
              ,{" "}
              <span className="text-primary hover:underline cursor-pointer">
                Google Workspace
              </span>
              ) or contact us at{" "}
              <span className="text-primary hover:underline cursor-pointer">
                support@freekanban.com
              </span>{" "}
              to get help.
            </p>
          </div>
        </div>

        {ssoLoading ? (
          <div className="pl-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !isSSOActive ? (
          <div className="pl-8">
            <Button
              onClick={handleActivateSSO}
              className="bg-[#0070f3] hover:bg-[#0060df] text-white"
            >
              Activate
            </Button>
          </div>
        ) : (
          <div className="pl-8 pt-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex gap-4">
              <Input
                placeholder="example.com"
                className="max-w-md"
                value={ssoForm.domain}
                onChange={(e) => handleSSOChange("domain", e.target.value)}
              />
              <Button disabled className="bg-[#0070f3] text-white">
                Domain
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground font-medium">
                Identity provider single sign-on url
              </Label>
              <Input
                placeholder="https://idp.example.com/saml/sso"
                value={ssoForm.ssoUrl}
                onChange={(e) => handleSSOChange("ssoUrl", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground font-medium">
                Identity provider issuer (Entity id)
              </Label>
              <Input
                placeholder="https://idp.example.com"
                value={ssoForm.issuer}
                onChange={(e) => handleSSOChange("issuer", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground font-medium">
                Identity provider signing certificate (X.509)
              </Label>
              <Textarea
                placeholder="-----BEGIN CERTIFICATE----- ... -----END CERTIFICATE-----"
                className="font-mono text-xs min-h-[100px]"
                value={ssoForm.certificate}
                onChange={(e) => handleSSOChange("certificate", e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sso-force"
                checked={ssoForm.forceSSO}
                onCheckedChange={(checked) =>
                  handleSSOChange("forceSSO", checked)
                }
              />
              <Label htmlFor="sso-force" className="text-muted-foreground">
                Enforce SSO for all team members
              </Label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveSSO}
                disabled={ssoSaving}
                className="bg-primary text-primary-foreground min-w-[100px]"
              >
                {ssoSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={handleDeactivateSSO}
                disabled={ssoSaving}
                className="bg-muted hover:bg-muted/80 text-red-600 hover:text-red-700"
              >
                {/* UX FIX: Ubah teks tombol sesuai kondisi */}
                {!isSavedOnServer ? "Cancel" : "Deactivate"}
              </Button>
            </div>
          </div>
        )}
      </section>

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
            <Dialog open={is2FAOpen} onOpenChange={handle2FAOpenChange}>
              <DialogTrigger asChild>
                <Button className="bg-[#0070f3] hover:bg-[#0060df] text-white">
                  Activate
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold uppercase text-muted-foreground text-sm tracking-wider mb-2">
                    Enable Authentication App
                  </DialogTitle>
                  <p className="text-muted-foreground">
                    Make your accounts safer in 3 easy steps:
                  </p>
                </DialogHeader>

                <div className="space-y-8 py-4">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 bg-muted/30 border rounded-sm flex items-center justify-center flex-shrink-0">
                      <ShieldCheck
                        className="w-10 h-10 text-muted-foreground/50"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">
                        Download an authenticator app
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Download and install Google Authenticator (
                        <span className="text-primary cursor-pointer">IOS</span>
                        ,{" "}
                        <span className="text-primary cursor-pointer">
                          Android
                        </span>
                        ) for your phone or tablet.
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
                        Open the authentication app and scan the image to the
                        left, using your phone&apos;s camera.{" "}
                        <strong className="text-foreground">
                          This QR code will not be shown again after 2FA is
                          enabled.
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
                        onClick={handleActivate2FA}
                        disabled={isLoading}
                      >
                        {isLoading ? "Activating..." : "Activate"}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog
              open={isDeactivateDialogOpen}
              onOpenChange={setIsDeactivateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="destructive">Deactivate</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deactivate 2FA</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to disable two-factor authentication
                    for your FreeKanban account?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleDeactivate2FA}
                    disabled={isLoading}
                  >
                    {isLoading ? "Deactivating..." : "Disable 2FA"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </section>
    </div>
  );
}
