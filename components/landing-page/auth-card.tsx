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
import { registerUserAction } from "@/app/actions/auth-actions";
import { toast } from "sonner";
import CustomLoader from "@/components/custom-loader";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AuthCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State untuk toggle confirm password
  const [activeTab, setActiveTab] = useState("login");

  // State untuk form register
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") || "";

  // --- LOGIKA KEKUATAN PASSWORD ---
  const passwordStrength = useMemo(() => {
    const pwd = registerData.password;
    let score = 0;
    if (!pwd) return { score: 0, label: "", color: "bg-muted" };

    if (pwd.length > 5) score++; // Minimal 6 karakter
    if (pwd.length > 7) score++; // Lebih dari 7 karakter
    if (/[0-9]/.test(pwd)) score++; // Ada angka
    if (/[^A-Za-z0-9]/.test(pwd)) score++; // Ada simbol

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
  }, [registerData.password]);

  // --- HANDLER UPDATE INPUT REGISTER ---
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
          toast.info("Two-factor authentication required", {
            description: "Please enter the code from your app.",
          });
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

    // Validasi Password Match
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Password tidak cocok", {
        description: "Pastikan kolom password dan konfirmasi password sama.",
      });
      return;
    }

    // Validasi Kekuatan Password (Optional: minimal 'Sedang')
    if (passwordStrength.score < 2) {
      toast.warning("Password terlalu lemah", {
        description:
          "Gunakan minimal 6 karakter dengan kombinasi angka/simbol.",
      });
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
      toast.error("Registration Failed");
    }
    setIsLoading(false);
  };

  // --- TAMPILAN 2FA ---
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

  // --- TAMPILAN LOGIN / REGISTER ---
  return (
    <Card className="border-border/60 shadow-2xl bg-card/85 backdrop-blur-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-70" />

      <CardHeader className="space-y-1 p-8 pb-4 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {activeTab === "login" ? "Welcome back" : "Create an account"}
        </CardTitle>
        <CardDescription className="text-base">
          {activeTab === "login"
            ? "Enter your credentials to access your account"
            : "Enter your information to get started"}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6 p-8 pt-0">
        <Tabs
          defaultValue="login"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-muted/50 p-1.5 rounded-lg">
            <TabsTrigger
              value="login"
              className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all text-sm font-medium"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all text-sm font-medium"
            >
              Register
            </TabsTrigger>
          </TabsList>

          <div className="min-h-[280px]">
            {/* --- FORM LOGIN --- */}
            <TabsContent value="login" className="mt-0">
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
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
                      className="pl-10 h-11 bg-background/50 border-input/60 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                      defaultValue={defaultEmail}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 bg-background/50 border-input/60 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
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
                  className="w-full mt-2 h-11 font-semibold text-base shadow-md shadow-primary/10 transition-all hover:shadow-primary/25 hover:-translate-y-0.5"
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

            {/* --- FORM REGISTER --- */}
            <TabsContent value="register" className="mt-0">
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
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
                      className="pl-10 h-11 bg-background/50 border-input/60 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
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
                      className="pl-10 h-11 bg-background/50 border-input/60 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                      required
                      disabled={isLoading}
                      value={registerData.email}
                      onChange={handleRegisterInput}
                    />
                  </div>
                </div>

                {/* Password Field dengan Strength Meter */}
                <div className="grid gap-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="register-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="pl-10 pr-10 h-11 bg-background/50 border-input/60 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                      required
                      disabled={isLoading}
                      value={registerData.password}
                      onChange={handleRegisterInput}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
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
                        {passwordStrength.score < 4 && (
                          <span className="text-muted-foreground/70">
                            Saran: Gunakan 8+ karakter, angka & simbol
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      className={cn(
                        "pl-10 pr-10 h-11 bg-background/50 border-input/60 focus-visible:ring-1 focus-visible:ring-primary/20 transition-all",
                        registerData.confirmPassword &&
                          registerData.password !==
                            registerData.confirmPassword &&
                          "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20",
                        registerData.confirmPassword &&
                          registerData.password ===
                            registerData.confirmPassword &&
                          "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20"
                      )}
                      required
                      disabled={isLoading}
                      value={registerData.confirmPassword}
                      onChange={handleRegisterInput}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {/* Indikator Match Password */}
                  {registerData.confirmPassword && (
                    <div className="flex items-center gap-1.5 text-xs mt-1">
                      {registerData.password ===
                      registerData.confirmPassword ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-green-600 font-medium">
                            Password cocok
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-red-500 font-medium">
                            Password tidak cocok
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full mt-2 h-11 font-semibold text-base shadow-md shadow-primary/10 transition-all hover:shadow-primary/25 hover:-translate-y-0.5"
                  type="submit"
                  disabled={
                    isLoading ||
                    !registerData.password ||
                    registerData.password !== registerData.confirmPassword
                  }
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

        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => signIn("google")}
          className="w-full h-11 gap-3 border-input/60 bg-background/50 hover:bg-accent/50 hover:text-accent-foreground font-medium transition-all hover:border-primary/30"
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
      </CardContent>

      <CardFooter className="pb-8 pt-0 px-8 text-center justify-center">
        <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
          By clicking continue, you agree to our{" "}
          <a
            href="#"
            className="underline hover:text-primary transition-colors font-medium"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="underline hover:text-primary transition-colors font-medium"
          >
            Privacy Policy
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
