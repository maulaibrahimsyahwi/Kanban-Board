"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaGoogle } from "react-icons/fa";
import {
  registerUserAction,
  requestPasswordResetAction,
  resetPasswordAction,
} from "@/app/actions/auth-actions";
import { toast } from "sonner";
import CustomLoader from "@/components/custom-loader";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AuthView =
  | "login"
  | "register"
  | "forgot-email"
  | "forgot-code"
  | "forgot-new-pass";

export function AuthCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") || "";

  const passwordStrength = useMemo(() => {
    const pwd =
      currentView === "register" ? registerData.password : newPassword;
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
        if (result.error === "2FA_REQUIRED") {
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

  const handleSSOLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("boxyhq");
    } catch (error) {
      toast.error("SSO Login failed");
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

  if (is2FARequired) {
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
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex justify-center">
              <Input
                placeholder="000 000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
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
                onClick={() => {
                  setIs2FARequired(false);
                  setTwoFactorCode("");
                }}
              >
                Back to login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-2xl bg-card/85 backdrop-blur-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-70" />

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
          {currentView === "register" &&
            "Enter your information to get started"}
          {currentView === "forgot-email" &&
            "Enter your email to receive a reset code"}
          {currentView === "forgot-code" &&
            `Enter the 6-digit code sent to ${resetEmail}`}
          {currentView === "forgot-new-pass" && "Create a strong new password"}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6 p-8 pt-0">
        {(currentView === "login" || currentView === "register") && (
          <Tabs
            value={currentView}
            className="w-full"
            onValueChange={(val) => setCurrentView(val as AuthView)}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-muted/50 p-1.5 rounded-lg">
              <TabsTrigger value="login" className="text-sm font-medium">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="text-sm font-medium">
                Register
              </TabsTrigger>
            </TabsList>

            <div className="min-h-[280px]">
              <TabsContent value="login" className="mt-0">
                <motion.form
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  className="grid gap-5"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10 h-11"
                        defaultValue={defaultEmail}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        onClick={() => setCurrentView("forgot-email")}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-11"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-2 h-11 font-semibold text-base"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CustomLoader size={20} className="mr-2" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegister}
                  className="grid gap-5"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10 h-11"
                        required
                        disabled={isLoading}
                        value={registerData.name}
                        onChange={handleRegisterInput}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10 h-11"
                        required
                        disabled={isLoading}
                        value={registerData.email}
                        onChange={handleRegisterInput}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="register-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10 h-11"
                        required
                        disabled={isLoading}
                        value={registerData.password}
                        onChange={handleRegisterInput}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {registerData.password && (
                      <div className="space-y-1.5 mt-1">
                        <div className="flex h-1.5 w-full bg-muted overflow-hidden rounded-full">
                          <div
                            className={cn(
                              "h-full transition-all duration-300",
                              passwordStrength.color
                            )}
                            style={{
                              width: `${(passwordStrength.score / 4) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span
                            className={cn(
                              "font-medium",
                              passwordStrength.score < 2
                                ? "text-red-500"
                                : passwordStrength.score < 4
                                ? "text-yellow-600"
                                : "text-green-600"
                            )}
                          >
                            Kekuatan: {passwordStrength.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className="pl-10 pr-10 h-11"
                        required
                        disabled={isLoading}
                        value={registerData.confirmPassword}
                        onChange={handleRegisterInput}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full mt-2 h-11 font-semibold text-base"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CustomLoader size={20} className="mr-2" />
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </motion.form>
              </TabsContent>
            </div>
          </Tabs>
        )}

        {currentView === "forgot-email" && (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 pt-2"
            onSubmit={handleRequestReset}
          >
            <div className="grid gap-2">
              <Label>Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 h-11"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button className="w-full h-11" type="submit" disabled={isLoading}>
              {isLoading ? (
                <CustomLoader size={20} className="mr-2" />
              ) : (
                "Send Reset Code"
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              type="button"
              onClick={() => setCurrentView("login")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
            </Button>
          </motion.form>
        )}

        {currentView === "forgot-code" && (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 pt-2"
            onSubmit={handleVerifyCodeStep}
          >
            <div className="grid gap-2">
              <Label>Verification Code</Label>
              <Input
                placeholder="000 000"
                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                autoFocus
                required
              />
              <p className="text-xs text-muted-foreground text-center">
                Check your email inbox for the code.
              </p>
            </div>
            <Button className="w-full h-11" type="submit">
              Verify Code
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              type="button"
              onClick={() => setCurrentView("forgot-email")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Change Email
            </Button>
          </motion.form>
        )}

        {currentView === "forgot-new-pass" && (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 pt-2"
            onSubmit={handleResetPasswordFinal}
          >
            <div className="grid gap-2">
              <Label>New Password</Label>
              <div className="relative group">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pl-10 pr-10 h-11"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="space-y-1.5 mt-1">
                <div className="flex h-1.5 w-full bg-muted overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      passwordStrength.color
                    )}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    passwordStrength.score < 2
                      ? "text-red-500"
                      : "text-green-600"
                  )}
                >
                  Kekuatan: {passwordStrength.label}
                </span>
              </div>
            </div>
            <Button
              className="w-full h-11"
              type="submit"
              disabled={isLoading || passwordStrength.score < 2}
            >
              {isLoading ? (
                <CustomLoader size={20} className="mr-2" />
              ) : (
                "Reset Password"
              )}
            </Button>
          </motion.form>
        )}

        {(currentView === "login" || currentView === "register") && (
          <>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground font-medium rounded-full">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={handleSSOLogin}
                className="w-full h-11 gap-3 border-input/60 bg-background/50 hover:bg-accent/50 font-medium transition-all"
              >
                {isLoading ? (
                  <CustomLoader size={18} />
                ) : (
                  <>
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <span>Single Sign-On (SSO)</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => signIn("google")}
                className="w-full h-11 gap-3 border-input/60 bg-background/50 hover:bg-accent/50 font-medium transition-all"
              >
                {isLoading ? (
                  <CustomLoader size={18} />
                ) : (
                  <>
                    <FaGoogle className="h-5 w-5 text-red-500" />
                    <span>Google</span>
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="pb-8 pt-0 px-8 text-center justify-center">
        <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline hover:text-primary">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
