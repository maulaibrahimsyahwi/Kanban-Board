"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  registerUserAction,
  requestPasswordResetAction,
  resetPasswordAction,
} from "@/app/actions/auth-actions";

export type AuthView =
  | "login"
  | "register"
  | "forgot-email"
  | "forgot-code"
  | "forgot-new-pass";

export type PasswordStrength = {
  score: number;
  label: string;
  color: string;
};

const computePasswordStrength = (pwd: string): PasswordStrength => {
  let score = 0;
  if (!pwd) return { score: 0, label: "", color: "bg-muted" };

  if (pwd.length > 5) score++;
  if (pwd.length > 7) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  switch (score) {
    case 0:
    case 1:
      return { score, label: "Lemah", color: "bg-red-500" };
    case 2:
    case 3:
      return { score, label: "Sedang", color: "bg-yellow-500" };
    case 4:
      return { score, label: "Kuat", color: "bg-green-500" };
    default:
      return { score: 0, label: "", color: "bg-muted" };
  }
};

export function useAuthCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [currentView, setCurrentView] = useState<AuthView>("login");

  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const passwordStrength = useMemo(() => {
    const pwd =
      currentView === "register" ? registerData.password : newPassword;
    return computePasswordStrength(pwd);
  }, [registerData.password, newPassword, currentView]);

  const handleRegisterInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = is2FARequired ? tempEmail : (formData.get("email") as string);
    const password = is2FARequired
      ? tempPassword
      : (formData.get("password") as string);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        code: twoFactorCode,
      });

      if (result?.error) {
        if (
          result.error === "2FA_REQUIRED" ||
          result.error.includes("2FA_REQUIRED")
        ) {
          setIs2FARequired(true);
          setTempEmail(email);
          setTempPassword(password);
          toast.info("Two-factor authentication required");
        } else {
          toast.error("Login failed", {
            description: "Check your credentials.",
          });
        }
      } else {
        toast.success("Login successful!");
        window.location.href = "/";
      }
    } catch {
      toast.error("System error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }
    if (passwordStrength.score < 2) {
      toast.warning("Password terlalu lemah");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", registerData.name);
    formData.append("email", registerData.email);
    formData.append("password", registerData.password);

    const result = await registerUserAction(formData);
    if (result.success) {
      toast.success("Registration Successful");
      await signIn("credentials", {
        redirect: false,
        email: registerData.email,
        password: registerData.password,
      });
      window.location.reload();
    } else {
      toast.error(result.message || "Registration Failed");
    }
    setIsLoading(false);
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setIsLoading(true);

    const res = await requestPasswordResetAction(resetEmail);
    setIsLoading(false);

    if (res.success) {
      toast.success("Kode telah dikirim ke email Anda.");
      setCurrentView("forgot-code");
    } else {
      toast.error(res.message);
    }
  };

  const handleVerifyCodeStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode.length < 6) {
      toast.error("Masukkan 6 digit kode.");
      return;
    }
    setCurrentView("forgot-new-pass");
  };

  const handleResetPasswordFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;

    setIsLoading(true);
    const res = await resetPasswordAction(resetEmail, resetCode, newPassword);
    setIsLoading(false);

    if (res.success) {
      toast.success(res.message);
      setCurrentView("login");
      setResetEmail("");
      setResetCode("");
      setNewPassword("");
    } else {
      toast.error(res.message);
    }
  };

  const backFromTwoFactor = () => {
    setIs2FARequired(false);
    setTwoFactorCode("");
  };

  return {
    isLoading,
    setIsLoading,
    is2FARequired,
    twoFactorCode,
    setTwoFactorCode,
    showPassword,
    setShowPassword,
    currentView,
    setCurrentView,
    resetEmail,
    setResetEmail,
    resetCode,
    setResetCode,
    newPassword,
    setNewPassword,
    registerData,
    handleRegisterInput,
    passwordStrength,
    handleLogin,
    handleRegister,
    handleRequestReset,
    handleVerifyCodeStep,
    handleResetPasswordFinal,
    backFromTwoFactor,
  };
}

