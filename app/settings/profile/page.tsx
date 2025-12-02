"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User, Camera, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  changePasswordAction,
  deleteAccountAction,
  updateProfileImageAction,
  updateDateFormatAction,
  updateNameAction, // Import fungsi baru
} from "@/app/actions/profile";

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  // State untuk Nama
  const [name, setName] = useState("");

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
    if (session?.user) {
      setDateFormat(session.user.dateFormat || "dd/MM/yyyy");
      setName(session.user.name || "");
    }
  }, [session]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Handler untuk menyimpan nama
  const handleNameSave = async () => {
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }

    if (name === session?.user?.name) {
      return; // Tidak ada perubahan
    }

    setIsSavingName(true);
    const result = await updateNameAction(name);

    if (result.success) {
      await update({ user: { name: name } }); // Update session client-side
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setIsSavingName(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File terlalu besar. Maksimal 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;

      const toastId = toast.loading("Updating profile picture...");
      const result = await updateProfileImageAction(base64String);

      if (result.success) {
        await update({ user: { image: base64String } });
        toast.success(result.message, { id: toastId });
      } else {
        toast.error(result.message, { id: toastId });
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword || !repeatPassword) {
      toast.error("Mohon isi semua kolom password.");
      return;
    }
    if (newPassword !== repeatPassword) {
      toast.error("Password baru tidak cocok.");
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
      toast.success("Akun dihapus. Mengalihkan...");
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
      toast.success(`Format tanggal diubah ke ${val}`);
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
        <section>
          <h2 className="text-lg font-semibold mb-4">Personal information</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-background"
                  />
                </div>
                <Button
                  onClick={handleNameSave}
                  disabled={isSavingName || name === session?.user?.name}
                  className="w-full md:w-28"
                >
                  Save Name
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                />
              </div>

              {/* Delete Account dengan kotak kecil (w-fit) */}
              <div className="pt-2 mt-1">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="group w-fit border border-transparent rounded-lg p-1 -ml-1 transition-all duration-200 hover:bg-red-50 hover:border-red-100 dark:hover:bg-red-900/10 dark:hover:border-red-900/30 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-red-700 dark:group-hover:text-red-400">
                            Delete Account
                          </h3>
                        </div>
                      </div>
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure you want to delete your account?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        If you delete your account, all of your data will be
                        deleted from our backups forever. So, don’t forget to
                        export your projects before you leave.
                        <Separator />
                        If there are any questions left, let us know at
                        <a
                          href="mailto:freekanbanboards@gmail.com"
                          className="text-primary hover:underline ml-1"
                        >
                          freekanbanboards@gmail.com
                        </a>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isLoading ? "Deleting..." : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-3">
              <div
                className="relative group cursor-pointer"
                onClick={handleImageClick}
              >
                <Avatar className="w-32 h-32 border-4 border-muted">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                    {session?.user?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <p
                className="text-xs text-muted-foreground text-center max-w-[150px] hover:text-primary cursor-pointer"
                onClick={handleImageClick}
              >
                Click to upload new picture
              </p>
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Password</h2>
            <p className="text-sm text-muted-foreground">
              Set a unique password to protect your personal account
            </p>
          </div>

          {!isChangingPassword ? (
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsChangingPassword(true)}
            >
              Change password
            </Button>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 max-w-lg space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeat-password">Repeat Password</Label>
                <div className="relative">
                  <Input
                    id="repeat-password"
                    type={showRepeatPassword ? "text" : "password"}
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showRepeatPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handlePasswordSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Password"
                  )}
                </Button>
              </div>
            </div>
          )}
        </section>

        <Separator />

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Workspace settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="id">Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date format</Label>
              <Select value={dateFormat} onValueChange={handleDateFormatChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">
                    26/01/1993 | DD/MM/YYYY
                  </SelectItem>
                  <SelectItem value="MM/dd/yyyy">
                    01/26/1993 | MM/DD/YYYY
                  </SelectItem>
                  <SelectItem value="yyyy-MM-dd">
                    1993-01-26 | YYYY-MM-DD
                  </SelectItem>
                  <SelectItem value="d MMM yyyy">
                    26 Jan 1993 | D MMM YYYY
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
