import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Check } from "lucide-react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  INDUSTRY_OPTIONS,
  MOTION_VARIANTS,
  PURPOSE_OPTIONS,
  STEPS,
  TEAM_SIZE_OPTIONS,
} from "./onboarding-flow-data";

type FormKey = "teamSize" | "usagePurpose" | "industry";
type FormData = Record<FormKey, string>;

export function OnboardingCard({
  step,
  direction,
  formData,
  onSelect,
  onBack,
  onNext,
  onSubmit,
  isStepValid,
  isLoading,
}: {
  step: number;
  direction: number;
  formData: FormData;
  onSelect: (key: FormKey, value: string) => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isStepValid: boolean;
  isLoading: boolean;
}) {
  return (
    <Card className="w-full max-w-lg shadow-2xl border-border/60 backdrop-blur-sm bg-card/95 overflow-hidden">
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
            Step {step} of {STEPS.length}
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
            variants={MOTION_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 p-6 pt-0"
          >
            {step === 1 && (
              <RadioGroup
                onValueChange={(val) => onSelect("teamSize", val)}
                value={formData.teamSize}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {TEAM_SIZE_OPTIONS.map((size) => (
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
                ))}
              </RadioGroup>
            )}

            {step === 2 && (
              <div className="grid gap-4">
                {PURPOSE_OPTIONS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelect("usagePurpose", item.id)}
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

            {step === 3 && (
              <div className="space-y-6 flex flex-col justify-center h-full">
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Select an industry
                  </Label>
                  <Select
                    onValueChange={(val) => onSelect("industry", val)}
                    value={formData.industry}
                  >
                    <SelectTrigger className="h-14 text-lg px-4 border-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select an industry..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRY_OPTIONS.map((industry) => (
                        <SelectItem
                          key={industry}
                          value={industry}
                          className="cursor-pointer py-3 text-base"
                        >
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Info: We&apos;ll tailor project templates based on your industry
                    selection.
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
          onClick={onBack}
          disabled={step === 1 || isLoading}
          className={cn(
            "text-muted-foreground hover:text-foreground transition-opacity",
            step === 1 ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <IoChevronBack className="w-4 h-4 mr-2" /> Back
        </Button>

        {step < 3 ? (
          <Button
            onClick={onNext}
            disabled={!isStepValid}
            className="rounded-full px-6"
          >
            Next <IoChevronForward className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={!isStepValid || isLoading}
            className="min-w-[140px] rounded-full shadow-lg shadow-primary/25"
            size="lg"
          >
            Get started
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function SignedInFooter({
  email,
  onSwitchAccount,
}: {
  email?: string | null;
  onSwitchAccount: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-8 text-center"
    >
      <p className="text-sm text-muted-foreground mb-2">
        Signed in as{" "}
        <span className="font-semibold text-foreground">{email}</span>
      </p>
      <Button
        variant="link"
        onClick={onSwitchAccount}
        className="text-sm text-muted-foreground hover:text-primary h-auto p-0"
      >
        Not you? Switch account
      </Button>
    </motion.div>
  );
}
