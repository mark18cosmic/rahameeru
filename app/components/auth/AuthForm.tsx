"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { logIn, signUp, signInWithGoogle, authErrorMessage } from "@/app/lib/auth";
import { Button } from "../ui/Button";
import { Input, Label } from "../ui/Field";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) await logIn(email, password);
      else await signUp(email, password, username || email.split("@")[0]);
      router.push("/");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (err) {
      setError(authErrorMessage(err));
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <UtensilsCrossed className="mb-4 text-root-400" size={32} />
          <h2 className="font-display text-3xl font-extrabold leading-tight">
            The Maldives&apos; best tables, all in one place.
          </h2>
          <p className="mt-3 text-ink-200">
            Save favourites, write reviews, and never argue about where to eat
            again.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-md">
          <h1 className="font-display text-3xl font-extrabold text-ink-900 dark:text-white">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-ink-500">
            {isLogin
              ? "Sign in to pick up where you left off."
              : "Join to review and save your favourite spots."}
          </p>

          <div className="mt-8 space-y-4">
            {!isLogin && (
              <div>
                <Label>Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="foodie_mv"
                  autoComplete="username"
                />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
              />
            </div>

            {error && (
              <p className="rounded-xl bg-root-50 px-3 py-2 text-sm text-root-700 dark:bg-root-900/20 dark:text-root-300">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 size={18} className="animate-spin" />}
              {isLogin ? "Sign in" : "Create account"}
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-sm text-ink-400">
            <div className="h-px flex-1 bg-ink-100 dark:bg-ink-800" />
            or
            <div className="h-px flex-1 bg-ink-100 dark:bg-ink-800" />
          </div>

          <button
            type="button"
            onClick={google}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-ink-200 py-3 font-semibold text-ink-700 transition hover:bg-ink-50 dark:border-ink-700 dark:text-ink-100 dark:hover:bg-ink-800"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-ink-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="font-semibold text-root-600"
            >
              {isLogin ? "Sign up" : "Log in"}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
