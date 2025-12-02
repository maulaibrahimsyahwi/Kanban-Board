import { useState, useEffect } from "react";
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
  ArrowLeft,
  Zap,
  Shield,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { registerUserAction } from "@/app/actions/auth-actions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import CustomLoader from "@/components/custom-loader";

// --- KOMPONEN UTAMA ---

export default function LandingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isLoginMode = searchParams.get("login") === "true";

  // --- LOGIKA LOGIN/REGISTER ---
  if (isLoginMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-300">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Layout className="text-primary-foreground w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Sign in to FreeKanban
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Welcome back! Please enter your details.
          </p>
        </div>

        <div className="w-full max-w-md relative z-10">
          <AuthCard />
        </div>

        <Button
          variant="ghost"
          onClick={() => router.replace("/")}
          className="mt-8 text-muted-foreground hover:text-foreground gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>

        <div className="fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear_gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN LANDING PAGE INTERAKTIF ---
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        <FeaturesSection />
        <InteractiveDemoSection />
        <TestimonialSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/40 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer"
          onClick={() => window.scrollTo(0, 0)}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Layout className="text-primary-foreground w-5 h-5" />
          </div>
          <span>
            Free<span className="text-primary">Kanban</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#demo"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How it works
          </a>
          <a
            href="#testimonials"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Reviews
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/?login=true")}>
            Log in
          </Button>
          <Button
            onClick={() => router.push("/?login=true")}
            className="rounded-full px-6"
          >
            Get Started
          </Button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-background border-b border-border p-4 md:hidden shadow-xl"
          >
            <nav className="flex flex-col gap-4">
              <a
                href="#features"
                className="text-sm font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#demo"
                className="text-sm font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it works
              </a>
              <Button
                className="w-full"
                onClick={() => router.push("/?login=true")}
              >
                Get Started
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              v2.0 is now available
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6"
          >
            Manage projects with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              Unmatched Speed
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
          >
            The open-source Kanban board that helps you organize tasks,
            collaborate with your team, and ship faster. No bloat, just focus.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Button
              size="lg"
              className="h-12 px-8 rounded-full text-base"
              onClick={() => router.push("/?login=true")}
            >
              Start for free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 rounded-full text-base"
            >
              View Github
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "Drag & Drop",
      desc: "Intuitive kanban board with smooth drag and drop interactions.",
      icon: Layout,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Real-time Sync",
      desc: "Collaborate with your team and see updates instantly.",
      icon: Zap,
      color: "bg-yellow-500/10 text-yellow-600",
    },
    {
      title: "Team Management",
      desc: "Invite members, assign roles, and track individual progress.",
      icon: Users,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      title: "Secure & Private",
      desc: "Enterprise-grade security with 2FA and data encryption.",
      icon: Shield,
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "Global Access",
      desc: "Access your boards from anywhere, on any device.",
      icon: Globe,
      color: "bg-pink-500/10 text-pink-600",
    },
    {
      title: "Progress Tracking",
      desc: "Visual charts and calendars to keep your project on track.",
      icon: CheckCircle2,
      color: "bg-orange-500/10 text-orange-600",
    },
  ];

  return (
    <section
      id="features"
      className="py-24 bg-muted/30 border-y border-border/50"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Everything you need to ship
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help your team focus on what matters
            most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InteractiveDemoSection() {
  return (
    <section id="demo" className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Experience a workflow that{" "}
              <span className="text-primary">adapts to you</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Don&apos;t let rigid tools slow you down. Our board adapts to your
              team&apos;s unique workflow with custom columns, labels, and
              automated actions.
            </p>

            <ul className="space-y-4">
              {[
                "Customizable workflow stages",
                "Rich text descriptions & checklists",
                "Priority levels and due dates",
                "Filtering and search capabilities",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="lg:w-1/2 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden relative z-10">
                <div className="border-b border-border p-4 bg-muted/30 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                </div>

                <div className="p-6 grid grid-cols-2 gap-4 h-[300px] bg-muted/10">
                  <div className="flex flex-col gap-3">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      To Do
                    </div>
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 4,
                        ease: "easeInOut",
                      }}
                      className="bg-background p-3 rounded-lg shadow-sm border border-border"
                    >
                      <div className="h-2 w-16 bg-primary/20 rounded mb-2"></div>
                      <div className="h-2 w-full bg-muted rounded mb-1"></div>
                      <div className="h-2 w-2/3 bg-muted rounded"></div>
                    </motion.div>
                    <div className="bg-background p-3 rounded-lg shadow-sm border border-border opacity-60">
                      <div className="h-2 w-12 bg-orange-500/20 rounded mb-2"></div>
                      <div className="h-2 w-3/4 bg-muted rounded"></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      In Progress
                    </div>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut",
                        delay: 1,
                      }}
                      className="bg-background p-3 rounded-lg shadow-sm border border-border"
                    >
                      <div className="h-2 w-10 bg-green-500/20 rounded mb-2"></div>
                      <div className="h-2 w-full bg-muted rounded mb-1"></div>
                      <div className="flex justify-between mt-2">
                        <div className="h-4 w-4 rounded-full bg-muted"></div>
                        <div className="h-2 w-8 bg-muted rounded"></div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialSection() {
  return (
    <section id="testimonials" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-12">Trusted by developers</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="bg-card/50 backdrop-blur-sm border-border/50"
            >
              <CardContent className="pt-6 text-left">
                <div className="flex gap-1 text-yellow-500 mb-4">
                  {"★★★★★".split("").map((s, idx) => (
                    <span key={idx}>{s}</span>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  &quot;This tool completely transformed how our team manages
                  sprints. It&apos;s simple yet incredibly powerful.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                  <div>
                    <p className="text-sm font-semibold">Alex Johnson</p>
                    <p className="text-xs text-muted-foreground">
                      Senior Developer
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const router = useRouter();
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -z-10"></div>
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to streamline your workflow?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of teams who have switched to FreeKanban for a better
            project management experience.
          </p>
          <Button
            size="lg"
            className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20"
            onClick={() => router.push("/?login=true")}
          >
            Get Started for Free
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">FreeKanban</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FreeKanban. Built by Maula Ibrahim.
          </p>
          <div className="flex gap-4">
            <FaGithub className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function AuthCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") || "";

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
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await registerUserAction(formData);
    if (result.success) {
      toast.success("Registration Successful");
      await signIn("credentials", {
        redirect: false,
        email: formData.get("email"),
        password: formData.get("password"),
      });
      window.location.reload();
    } else {
      toast.error("Registration Failed");
    }
    setIsLoading(false);
  };

  if (is2FARequired) {
    return (
      <Card className="border-border shadow-2xl bg-card/95 backdrop-blur-sm animate-in zoom-in-95 duration-300">
        <CardHeader>
          <CardTitle className="text-center">2-Factor Authentication</CardTitle>
          <CardDescription className="text-center">
            Enter the code from your app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              placeholder="000 000"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              className="text-center text-lg tracking-widest"
              maxLength={6}
              autoFocus
            />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <CustomLoader size={16} className="mr-2" />
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
              Back
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-2xl text-center">Welcome</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="grid gap-3">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                defaultValue={defaultEmail}
                required
                disabled={isLoading}
              />
              <Label>Password</Label>
              <Input
                name="password"
                type="password"
                required
                disabled={isLoading}
              />
              <Button
                className="w-full mt-2"
                type="submit"
                disabled={isLoading}
              >
                {isLoading && <CustomLoader size={16} className="mr-2" />}
                Sign In
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="grid gap-3">
              <Label>Name</Label>
              <Input name="name" type="text" required disabled={isLoading} />
              <Label>Email</Label>
              <Input name="email" type="email" required disabled={isLoading} />
              <Label>Password</Label>
              <Input
                name="password"
                type="password"
                required
                disabled={isLoading}
              />
              <Button
                className="w-full mt-2"
                type="submit"
                disabled={isLoading}
              >
                {isLoading && <CustomLoader size={16} className="mr-2" />}
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
          className="w-full gap-2"
        >
          {isLoading ? (
            <CustomLoader size={16} className="mr-2" />
          ) : (
            <>
              <FaGoogle className="h-4 w-4" /> Google
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
