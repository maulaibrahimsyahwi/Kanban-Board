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
import {
  Check,
  Briefcase,
  User,
  GraduationCap,
  ArrowRight,
  Loader2,
  LogOut,
} from "lucide-react";
import { submitOnboardingAction } from "@/app/actions/onboarding-actions";
import { useSession, signOut } from "next-auth/react"; // Import signOut
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: 1,
    title: "Team Size",
    desc: "How many team members will use GanttPRO?",
  },
  {
    id: 2,
    title: "Purpose",
    desc: "What are you planning to use GanttPRO for?",
  },
  { id: 3, title: "Industry", desc: "What industry do you work in?" },
];

export default function OnboardingFlow() {
  const { data: session, update } = useSession(); // Ambil data session untuk menampilkan email
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    teamSize: "",
    usagePurpose: "",
    industry: "",
  });

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await submitOnboardingAction(formData);
      if (result.success) {
        toast.success("All set! Welcome aboard.");
        await update({ onboardingCompleted: true });
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return !!formData.teamSize;
    if (step === 2) return !!formData.usagePurpose;
    if (step === 3) return !!formData.industry;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-lg shadow-xl border-border">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            {STEPS.map((s) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                    step >= s.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-transparent border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                {s.id !== STEPS.length && (
                  <div
                    className={cn(
                      "w-8 sm:w-16 h-0.5 mx-1 transition-colors",
                      step > s.id ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <CardTitle className="text-2xl">{STEPS[step - 1].title}</CardTitle>
          <CardDescription className="text-base">
            {STEPS[step - 1].desc}
          </CardDescription>
        </CardHeader>

        <CardContent className="py-6">
          {/* STEP 1: TEAM SIZE */}
          {step === 1 && (
            <RadioGroup
              onValueChange={(val: string) =>
                setFormData({ ...formData, teamSize: val })
              }
              value={formData.teamSize}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {["Only me", "2-5", "6-10", "11-20", "21-50", "50+"].map(
                (size) => (
                  <Label
                    key={size}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer hover:border-primary/50 transition-all",
                      formData.teamSize === size
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <RadioGroupItem value={size} className="sr-only" />
                    <span className="font-medium">{size}</span>
                  </Label>
                )
              )}
            </RadioGroup>
          )}

          {/* STEP 2: PURPOSE */}
          {step === 2 && (
            <div className="grid gap-3">
              {[
                { id: "Work", icon: Briefcase },
                { id: "Personal projects", icon: User },
                { id: "Studying", icon: GraduationCap },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setFormData({ ...formData, usagePurpose: item.id })
                  }
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-muted/50",
                    formData.usagePurpose === item.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border"
                  )}
                >
                  <div className="bg-primary/10 p-2.5 rounded-full text-primary">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-lg">{item.id}</span>
                  {formData.usagePurpose === item.id && (
                    <Check className="w-5 h-5 text-primary ml-auto" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: INDUSTRY */}
          {step === 3 && (
            <div className="space-y-4">
              <Select
                onValueChange={(val: string) =>
                  setFormData({ ...formData, industry: val })
                }
                value={formData.industry}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select an industry..." />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Construction",
                    "Manufacturing",
                    "Tech & Engineering",
                    "Consulting",
                    "Marketing & Digital",
                    "Public & Non-Profit",
                    "IT / Software",
                    "Healthcare",
                    "Finance",
                    "Other industry...",
                  ].map((ind) => (
                    <SelectItem
                      key={ind}
                      value={ind}
                      className="cursor-pointer py-3"
                    >
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-2">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || isLoading}
            className="text-muted-foreground"
          >
            Back
          </Button>

          {step < 3 ? (
            <Button onClick={handleNext} disabled={!isStepValid()}>
              Next Step <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Get Started"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* --- TOMBOL GANTI AKUN / LOGOUT --- */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Signed in as{" "}
          <span className="font-medium text-foreground">
            {session?.user?.email}
          </span>
        </p>
        <Button
          variant="link"
          onClick={() => signOut({ callbackUrl: "/" })} // Redirect ke home setelah logout
          className="text-sm text-muted-foreground hover:text-foreground h-auto p-0"
        >
          Not you? Switch account
        </Button>
      </div>
    </div>
  );
}
