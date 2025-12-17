"use client";

import { useState } from "react";
import { submitOnboardingAction } from "@/app/actions/onboarding-actions";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import CustomLoader from "@/components/custom-loader";
import { STEPS } from "./onboarding-flow-data";
import { OnboardingCard, SignedInFooter } from "./onboarding-flow-components";

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

  // TAMPILKAN LOADER FULLSCREEN JIKA SEDANG SUBMIT
  if (isLoading) {
    return (
      <CustomLoader variant="fullscreen" label="Menyiapkan Workspace..." />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4 font-poppins">
      <OnboardingCard
        step={step}
        direction={direction}
        formData={formData}
        onSelect={handleSelection}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isStepValid={isStepValid()}
        isLoading={isLoading}
      />

      <SignedInFooter
        email={session?.user?.email}
        onSwitchAccount={() => signOut({ callbackUrl: "/" })}
      />
    </div>
  );
}
