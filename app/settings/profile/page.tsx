"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";
import { toast } from "sonner";
import {
  changePasswordAction,
  deleteAccountAction,
  updateProfileImageAction,
  updateDateFormatAction,
} from "@/app/actions/profile";
import {
  PasswordSection,
  PersonalInformationSection,
  WorkspaceSettingsSection,
} from "./profile-sections";

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dateFormat, setDateFormat] = useState("dd/MM/yyyy");

  useEffect(() => {
    if (session?.user?.dateFormat) {
      setDateFormat(session.user.dateFormat);
    }
  }, [session]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast.error("File is too large. Max 1MB.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only image files (JPEG, PNG, WEBP) are allowed.");
      return;
    }

    const toastId = toast.loading("Uploading profile photo...");

    try {
      const uploadBody = new FormData();
      uploadBody.append("file", file, file.name);

      const uploadRes = await fetch("/api/avatar/upload", {
        method: "POST",
        body: uploadBody,
      });

      const uploadJson = (await uploadRes.json().catch(() => null)) as
        | { success: true; data: { url: string; path: string } }
        | { success: false; message?: string }
        | null;

      if (!uploadRes.ok || !uploadJson || uploadJson.success !== true) {
        const message =
          (uploadJson && "message" in uploadJson && uploadJson.message) ||
          "Failed to upload image";
        throw new Error(message);
      }

      const publicUrl = uploadJson.data.url;
      const result = await updateProfileImageAction(publicUrl);

      if (result.success) {
        await update({ user: { image: publicUrl } });
        toast.success(result.message, { id: toastId });
      } else {
        toast.error(result.message, { id: toastId });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image.", { id: toastId });
    }
  };

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword || !repeatPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== repeatPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsLoading(true);
    const result = await changePasswordAction(currentPassword, newPassword);
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message);
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    const result = await deleteAccountAction();
    if (result.success) {
      toast.success("Account deleted. Redirecting...");
      await signOut({ callbackUrl: "/" });
    } else {
      toast.error(result.message);
      setIsLoading(false);
    }
  };

  const handleDateFormatChange = async (val: string) => {
    setDateFormat(val);
    const result = await updateDateFormatAction(val);
    if (result.success) {
      await update({ dateFormat: val });
      toast.success(`Date format updated to ${val}`);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-muted-foreground" />
          Profile settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and account preferences.
        </p>
      </div>

      <Separator />

      <div className="space-y-8">
        <PersonalInformationSection
          name={session?.user?.name || ""}
          email={session?.user?.email || ""}
          image={session?.user?.image || ""}
          avatarFallback={session?.user?.name?.[0]?.toUpperCase() || "U"}
          fileInputRef={fileInputRef}
          onImageClick={handleImageClick}
          onFileChange={handleFileChange}
          onDeleteAccount={handleDeleteAccount}
          isDeleting={isLoading}
        />

        <Separator />

        <PasswordSection
          isChangingPassword={isChangingPassword}
          setIsChangingPassword={setIsChangingPassword}
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          repeatPassword={repeatPassword}
          setRepeatPassword={setRepeatPassword}
          showCurrentPassword={showCurrentPassword}
          setShowCurrentPassword={setShowCurrentPassword}
          showNewPassword={showNewPassword}
          setShowNewPassword={setShowNewPassword}
          showRepeatPassword={showRepeatPassword}
          setShowRepeatPassword={setShowRepeatPassword}
          isLoading={isLoading}
          onSavePassword={handlePasswordSave}
        />

        <Separator />

        <WorkspaceSettingsSection
          dateFormat={dateFormat}
          onDateFormatChange={handleDateFormatChange}
        />
      </div>
    </div>
  );
}
