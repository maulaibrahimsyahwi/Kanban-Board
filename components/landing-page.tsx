"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Layout,
  CheckCircle2,
  Users,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import logo from "@/app/assets/logo.svg";
import { FaGoogle } from "react-icons/fa";
import { registerUserAction } from "@/app/actions/auth-actions";
import { toast } from "sonner";

export default function LandingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const isLoginMode = searchParams.get("login") === "true";

  if (isLoginMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 animate-in fade-in duration-300">
        <div className="mb-6 flex flex-col items-center">
          <Image
            src={logo}
            alt="Logo"
            width={48}
            height={48}
            className="logo-dark-mode mb-4"
          />
          <h1 className="text-2xl font-bold tracking-tight">
            Sign in to FreeKanban
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your details to switch or access your account
          </p>
        </div>

        <div className="w-full max-w-md">
          <AuthCard />
        </div>

        <Button
          variant="ghost"
          onClick={() => router.replace("/")}
          className="mt-8 text-muted-foreground hover:text-foreground gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground poppins selection:bg-primary/20">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={logo}
              alt="Logo"
              width={28}
              height={28}
              className="logo-dark-mode"
            />
            <span className="text-xl font-bold tracking-tight">
              Free<span className="text-primary font-light">Kanban</span>
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/?login=true")}
              className="font-medium cursor-pointer hidden sm:inline-flex"
            >
              Log in
            </Button>
            <Button
              onClick={() => router.push("/?login=true")}
              className="font-medium cursor-pointer"
            >
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="container mx-auto px-4 py-12 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 animate-in fade-in slide-in-from-left-4 duration-1000 ease-out">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground">
                ✨ Project Management Simplified
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
                Manage tasks with <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                  Agility & Focus
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                A clean, modern, and open-source Kanban board to organize your
                projects, collaborate with your team, and track progress
                effortlessly.
              </p>
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 cursor-pointer"
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-right-4 duration-1000 delay-200">
              <AuthCard />
            </div>
          </div>
        </section>

        <section
          id="features"
          className="w-full py-20 px-4 border-t border-border/50 bg-muted/20"
        >
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-12">Everything you need</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={Layout}
                title="Intuitive Boards"
                description="Drag and drop tasks with customizable columns."
              />
              <FeatureCard
                icon={Users}
                title="Collaboration"
                description="Invite team members and work together in real-time."
              />
              <FeatureCard
                icon={CheckCircle2}
                title="Progress Tracking"
                description="Monitor project health with charts and calendars."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FreeKanban. Built with Next.js 15.</p>
        </div>
      </footer>
    </div>
  );
}

function AuthCard() {
  const [isLoading, setIsLoading] = useState(false);

  // State khusus untuk menangani 2FA
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  // Simpan email & password sementara
  const [tempEmail, setTempEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") || "";

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    // Gunakan data form ATAU data sementara (jika sedang input kode 2FA)
    const email = is2FARequired ? tempEmail : (formData.get("email") as string);
    const password = is2FARequired
      ? tempPassword
      : (formData.get("password") as string);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        code: twoFactorCode, // Kirim kode 2FA (kosong jika login tahap 1)
      });

      if (result?.error) {
        // DETEKSI ERROR KHUSUS DARI BACKEND
        if (result.error === "2FA_REQUIRED") {
          setIs2FARequired(true);
          setTempEmail(email);
          setTempPassword(password);
          toast.info("Two-factor authentication required", {
            description: "Please enter the code from your app.",
          });
        } else {
          toast.error("Login gagal.", {
            description: "Cek email, password, atau kode 2FA.",
          });
        }
      } else {
        toast.success("Login berhasil!");
        window.location.href = "/";
      }
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = await registerUserAction(formData);

    if (result.success) {
      toast.success("Registrasi Berhasil", {
        description: result.message,
      });
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      await signIn("credentials", { redirect: false, email, password });
      window.location.reload();
    } else {
      toast.error("Registrasi Gagal", {
        description: result.message,
      });
    }
    setIsLoading(false);
  };

  // TAMPILAN KHUSUS INPUT KODE 2FA
  if (is2FARequired) {
    return (
      <Card className="border-border shadow-2xl bg-card/95 backdrop-blur-sm animate-in zoom-in-95 duration-300">
        <CardHeader>
          <CardTitle className="text-center">
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-center">
            Enter the code from your authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input
                placeholder="000 000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                autoFocus
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Verify & Login"
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              type="button"
              onClick={() => {
                setIs2FARequired(false);
                setTwoFactorCode("");
              }}
            >
              Back to login
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // TAMPILAN LOGIN BIASA
  return (
    <Card className="border-border shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Login or create an account to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" className="cursor-pointer">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="cursor-pointer">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  defaultValue={defaultEmail}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isLoading}
                  autoFocus={!!defaultEmail}
                />
              </div>
              <Button
                className="w-full mt-2 cursor-pointer"
                type="submit"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input
                  id="reg-name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  name="password"
                  type="password"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                className="w-full mt-2 cursor-pointer"
                type="submit"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => signIn("google")}
          className="w-full gap-2 cursor-pointer"
        >
          <FaGoogle className="h-4 w-4" /> Google
        </Button>
      </CardContent>
    </Card>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 bg-primary/10 text-primary rounded-xl mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
