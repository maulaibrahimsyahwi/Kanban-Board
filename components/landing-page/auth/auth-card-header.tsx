import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AuthView } from "./use-auth-card";

export function AuthCardHeader({
  currentView,
  resetEmail,
}: {
  currentView: AuthView;
  resetEmail: string;
}) {
  return (
    <CardHeader className="space-y-1 p-8 pb-4 text-center">
      <CardTitle className="text-2xl font-bold tracking-tight">
        {currentView === "login" && "Welcome back"}
        {currentView === "register" && "Create an account"}
        {currentView === "forgot-email" && "Reset Password"}
        {currentView === "forgot-code" && "Enter Code"}
        {currentView === "forgot-new-pass" && "New Password"}
      </CardTitle>
      <CardDescription className="text-base">
        {currentView === "login" &&
          "Enter your credentials to access your account"}
        {currentView === "register" && "Enter your information to get started"}
        {currentView === "forgot-email" &&
          "Enter your email to receive a reset code"}
        {currentView === "forgot-code" &&
          `Enter the 6-digit code sent to ${resetEmail}`}
        {currentView === "forgot-new-pass" && "Create a strong new password"}
      </CardDescription>
    </CardHeader>
  );
}

