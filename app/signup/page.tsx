import { Suspense } from "react";
import { AuthForm } from "@/app/components/auth/AuthForm";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
