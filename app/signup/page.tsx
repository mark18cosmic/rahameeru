import { AuthForm } from "@/app/components/auth/AuthForm";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
