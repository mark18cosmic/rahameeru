import { AuthForm } from "@/app/components/auth/AuthForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
