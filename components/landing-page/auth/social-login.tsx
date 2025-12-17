"use client";

import { FaGoogle } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import CustomLoader from "@/components/custom-loader";

type SocialLoginProps = {
  isLoading: boolean;
  onGoogleSignIn: () => void;
};

export function SocialLogin({ isLoading, onGoogleSignIn }: SocialLoginProps) {
  return (
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
          onClick={onGoogleSignIn}
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
  );
}

