import { Suspense } from "react";
import { Onboarding } from "@/components/platform/onboarding";

export default function OnboardingPage() {
  return (
    <Suspense>
      <Onboarding />
    </Suspense>
  );
}
