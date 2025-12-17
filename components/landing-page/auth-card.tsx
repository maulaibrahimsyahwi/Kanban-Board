"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomLoader from "@/components/custom-loader";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { ForgotCodeForm } from "./auth/forgot-code-form";
import { ForgotEmailForm } from "./auth/forgot-email-form";
import { ForgotNewPasswordForm } from "./auth/forgot-new-password-form";
import { RegisterForm } from "./auth/register-form";
import { SocialLogin } from "./auth/social-login";
import { TwoFactorCard } from "./auth/two-factor-card";
import { AuthCardHeader } from "./auth/auth-card-header";
import { AuthCardFooter } from "./auth/auth-card-footer";
import { AuthView, useAuthCard } from "./auth/use-auth-card";

export function AuthCard() {
  const {
    isLoading,
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
  } = useAuthCard();

  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") || "";

  if (is2FARequired) {
    return (
      <TwoFactorCard
        isLoading={isLoading}
        twoFactorCode={twoFactorCode}
        onTwoFactorCodeChange={setTwoFactorCode}
        onSubmit={handleLogin}
        onBackToLogin={backFromTwoFactor}
      />
    );
  }

  return (
    <Card className="border-border/60 shadow-2xl bg-card/85 backdrop-blur-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-70" />

      <AuthCardHeader currentView={currentView} resetEmail={resetEmail} />

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
                <RegisterForm
                  isLoading={isLoading}
                  showPassword={showPassword}
                  onToggleShowPassword={() => setShowPassword(!showPassword)}
                  registerData={registerData}
                  onRegisterInputChange={handleRegisterInput}
                  passwordStrength={passwordStrength}
                  onSubmit={handleRegister}
                />
              </TabsContent>
            </div>
          </Tabs>
        )}

        {currentView === "forgot-email" && (
          <ForgotEmailForm
            isLoading={isLoading}
            resetEmail={resetEmail}
            onResetEmailChange={setResetEmail}
            onSubmit={handleRequestReset}
            onBackToLogin={() => setCurrentView("login")}
          />
        )}

        {currentView === "forgot-code" && (
          <ForgotCodeForm
            resetCode={resetCode}
            onResetCodeChange={setResetCode}
            onSubmit={handleVerifyCodeStep}
            onChangeEmail={() => setCurrentView("forgot-email")}
          />
        )}

        {currentView === "forgot-new-pass" && (
          <ForgotNewPasswordForm
            isLoading={isLoading}
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword(!showPassword)}
            newPassword={newPassword}
            onNewPasswordChange={setNewPassword}
            passwordStrength={passwordStrength}
            onSubmit={handleResetPasswordFinal}
          />
        )}

        {(currentView === "login" || currentView === "register") && (
          <SocialLogin
            isLoading={isLoading}
            onGoogleSignIn={() => signIn("google")}
          />
        )}
      </CardContent>

      <AuthCardFooter />
    </Card>
  );
}
