import { Suspense } from "react";
import { AuthForm } from "@/app/components/auth/AuthForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  // AuthForm reads ?next= to return people to the page they came from, which
  // opts it out of prerendering unless it sits behind a boundary.
  return (
    <Suspense fallback={null}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
