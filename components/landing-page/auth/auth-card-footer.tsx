import { CardFooter } from "@/components/ui/card";

export function AuthCardFooter() {
  return (
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
  );
}

