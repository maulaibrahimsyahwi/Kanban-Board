"use client";

import { useSearchParams } from "next/navigation";

import { LandingAuthView } from "./landing-page/landing-auth-view";
import { LandingMarketingView } from "./landing-page/landing-marketing-view";

export default function LandingPage() {
  const searchParams = useSearchParams();
  const isLoginMode = searchParams.get("login") === "true";

  return isLoginMode ? <LandingAuthView /> : <LandingMarketingView />;
}
