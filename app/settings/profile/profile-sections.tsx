import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Camera, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";

const DATE_FORMAT_OPTIONS = [
  { value: "dd/MM/yyyy", label: "26/01/1993 | DD/MM/YYYY" },
  { value: "MM/dd/yyyy", label: "01/26/1993 | MM/DD/YYYY" },
  { value: "yyyy-MM-dd", label: "1993-01-26 | YYYY-MM-DD" },
  { value: "d MMM yyyy", label: "26 Jan 1993 | D MMM YYYY" },
] as const;

function PasswordField({
  id,
  label,
  value,
  placeholder,
  show,
  onToggleShow,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  show: boolean;
  onToggleShow: () => void;
  onChange: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function PersonalInformationSection({
  name,
  email,
  image,
  avatarFallback,
  fileInputRef,
  onImageClick,
  onFileChange,
  onDeleteAccount,
  isDeleting,
}: {
  name: string;
  email: string;
  image: string;
  avatarFallback: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteAccount: () => void;
  isDeleting: boolean;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Personal information</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} disabled className="bg-muted/50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted/50 text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="text-sm text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete my account
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className="relative group cursor-pointer"
            onClick={onImageClick}
          >
            <Avatar className="w-32 h-32 border-4 border-muted">
              <AvatarImage src={image} className="object-cover" />
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
          />
          <p
            className="text-xs text-muted-foreground text-center max-w-[150px] hover:text-primary cursor-pointer"
            onClick={onImageClick}
          >
            Click to upload new picture
          </p>
        </div>
      </div>
    </section>
  );
}

export function PasswordSection({
  isChangingPassword,
  setIsChangingPassword,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  repeatPassword,
  setRepeatPassword,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showRepeatPassword,
  setShowRepeatPassword,
  isLoading,
  onSavePassword,
}: {
  isChangingPassword: boolean;
  setIsChangingPassword: React.Dispatch<React.SetStateAction<boolean>>;
  currentPassword: string;
  setCurrentPassword: React.Dispatch<React.SetStateAction<string>>;
  newPassword: string;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  repeatPassword: string;
  setRepeatPassword: React.Dispatch<React.SetStateAction<string>>;
  showCurrentPassword: boolean;
  setShowCurrentPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showNewPassword: boolean;
  setShowNewPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showRepeatPassword: boolean;
  setShowRepeatPassword: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  onSavePassword: () => void;
}) {
  return (
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
          <PasswordField
            id="current-password"
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Enter current password"
            show={showCurrentPassword}
            onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
          />

          <PasswordField
            id="new-password"
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Enter new password"
            show={showNewPassword}
            onToggleShow={() => setShowNewPassword(!showNewPassword)}
          />

          <PasswordField
            id="repeat-password"
            label="Repeat Password"
            value={repeatPassword}
            onChange={setRepeatPassword}
            placeholder="Repeat new password"
            show={showRepeatPassword}
            onToggleShow={() => setShowRepeatPassword(!showRepeatPassword)}
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsChangingPassword(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onSavePassword} disabled={isLoading}>
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
  );
}

export function WorkspaceSettingsSection({
  dateFormat,
  onDateFormatChange,
}: {
  dateFormat: string;
  onDateFormatChange: (val: string) => void;
}) {
  return (
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
          <Select value={dateFormat} onValueChange={onDateFormatChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select date format" />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMAT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
