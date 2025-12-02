"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Briefcase, User, GraduationCap } from "lucide-react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { submitOnboardingAction } from "@/app/actions/onboarding-actions";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import CustomLoader from "@/components/custom-loader";

const STEPS = [
  {
    id: 1,
    title: "Ukuran Tim",
    desc: "Berapa banyak anggota tim yang akan menggunakan GanttPRO?",
  },
  {
    id: 2,
    title: "Tujuan",
    desc: "Untuk apa Anda berencana menggunakan GanttPRO?",
  },
  { id: 3, title: "Industri", desc: "Di industri apa Anda bekerja?" },
];

export default function OnboardingFlow() {
  const { data: session, update } = useSession();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState({
    teamSize: "",
    usagePurpose: "",
    industry: "",
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await submitOnboardingAction(formData);

      if (result.success) {
        toast.success("Semua siap! Selamat datang.");
        await update({ onboardingCompleted: true });
        // Loader tetap tampil sampai komponen di-unmount oleh parent
      } else {
        toast.error(result.message);
        setIsLoading(false);
      }
    } catch {
      toast.error("Terjadi kesalahan.");
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (step < STEPS.length) {
      setDirection(1);
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  const handleSelection = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (step < 3) {
      setTimeout(() => {
        handleNext();
      }, 400);
    }
  };

  const isStepValid = () => {
    if (step === 1) return !!formData.teamSize;
    if (step === 2) return !!formData.usagePurpose;
    if (step === 3) return !!formData.industry;
    return false;
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  // TAMPILKAN LOADER FULLSCREEN JIKA SEDANG SUBMIT
  if (isLoading) {
    return (
      <CustomLoader variant="fullscreen" label="Menyiapkan Workspace..." />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4 font-poppins">
      <Card className="w-full max-w-lg shadow-2xl border-border/60 backdrop-blur-sm bg-card/95 overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full bg-muted/50 h-2 flex">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                "h-full flex-1 transition-all duration-500 ease-in-out",
                step >= s.id ? "bg-primary" : "bg-transparent"
              )}
            />
          ))}
        </div>

        <CardHeader className="text-center pb-2 pt-8">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs font-bold text-primary tracking-widest uppercase mb-2">
              Langkah {step} dari {STEPS.length}
            </div>
            <CardTitle className="text-3xl font-bold mb-2">
              {STEPS[step - 1].title}
            </CardTitle>
            <CardDescription className="text-lg">
              {STEPS[step - 1].desc}
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="py-6 min-h-[320px] relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 p-6 pt-0"
            >
              {/* STEP 1: TEAM SIZE */}
              {step === 1 && (
                <RadioGroup
                  onValueChange={(val) => handleSelection("teamSize", val)}
                  value={formData.teamSize}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {["Hanya saya", "2-5", "6-10", "11-20", "21-50", "50+"].map(
                    (size) => (
                      <Label
                        key={size}
                        className={cn(
                          "flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                          formData.teamSize === size
                            ? "border-primary bg-primary/10 text-primary scale-[1.02] shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <RadioGroupItem value={size} className="sr-only" />
                        <span className="font-semibold text-base">{size}</span>
                      </Label>
                    )
                  )}
                </RadioGroup>
              )}

              {/* STEP 2: PURPOSE */}
              {step === 2 && (
                <div className="grid gap-4">
                  {[
                    { id: "Work", label: "Pekerjaan", icon: Briefcase },
                    {
                      id: "Personal projects",
                      label: "Proyek Pribadi",
                      icon: User,
                    },
                    {
                      id: "Studying",
                      label: "Belajar / Studi",
                      icon: GraduationCap,
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelection("usagePurpose", item.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group",
                        formData.usagePurpose === item.id
                          ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "p-3 rounded-full transition-colors",
                          formData.usagePurpose === item.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                        )}
                      >
                        <item.icon className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-lg">{item.label}</span>
                      {formData.usagePurpose === item.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto"
                        >
                          <Check className="w-6 h-6 text-primary" />
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3: INDUSTRY */}
              {step === 3 && (
                <div className="space-y-6 flex flex-col justify-center h-full">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      Pilih Industri
                    </Label>
                    <Select
                      onValueChange={(val) =>
                        setFormData({ ...formData, industry: val })
                      }
                      value={formData.industry}
                    >
                      <SelectTrigger className="h-14 text-lg px-4 border-2 focus:ring-primary/20">
                        <SelectValue placeholder="Pilih industri..." />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Konstruksi",
                          "Manufaktur",
                          "Teknologi & Engineering",
                          "Konsultan",
                          "Pemasaran & Digital",
                          "IT / Software",
                          "Kesehatan",
                          "Keuangan",
                          "Lainnya...",
                        ].map((ind) => (
                          <SelectItem
                            key={ind}
                            value={ind}
                            className="cursor-pointer py-3 text-base"
                          >
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Info: Kami akan menyesuaikan template proyek berdasarkan
                      pilihan industri Anda.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between pt-4 pb-8 px-8 bg-background/50 backdrop-blur-sm z-10 relative">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || isLoading}
            className={cn(
              "text-muted-foreground hover:text-foreground transition-opacity",
              step === 1 ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <IoChevronBack className="w-4 h-4 mr-2" /> Kembali
          </Button>

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="rounded-full px-6"
            >
              Lanjut <IoChevronForward className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || isLoading}
              className="min-w-[140px] rounded-full shadow-lg shadow-primary/25"
              size="lg"
            >
              Mulai Sekarang
            </Button>
          )}
        </CardFooter>
      </Card>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-muted-foreground mb-2">
          Masuk sebagai{" "}
          <span className="font-semibold text-foreground">
            {session?.user?.email}
          </span>
        </p>
        <Button
          variant="link"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-muted-foreground hover:text-primary h-auto p-0"
        >
          Bukan Anda? Ganti akun
        </Button>
      </motion.div>
    </div>
  );
}
