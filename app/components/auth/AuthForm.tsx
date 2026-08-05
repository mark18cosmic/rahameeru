"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  UtensilsCrossed,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Check,
} from "lucide-react";
import {
  logIn,
  signUp,
  signInWithGoogle,
  resetPassword,
  authErrorMessage,
} from "@/app/lib/auth";
import { cx } from "@/app/lib/utils";
import { Button } from "../ui/Button";
import { Input, Label } from "../ui/Field";

/** Flat tint used as the blur placeholder for the side panel photo. */
const BLUR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAAHElEQVQI12N88uQJAxJgYmBg+P//PxMDAwMDAwMAJg0F/2vBHQMAAAAASUVORK5CYII=";

const PERKS = [
  "Save the places you actually go back to",
  "Write reviews other locals will read",
  "Spin the wheel when nobody can decide",
];

/** Only used to tell the user how they're doing — Firebase enforces the rest. */
function strength(pw: string): { score: 0 | 1 | 2 | 3; label: string; tone: string } {
  const long = pw.length >= 10;
  const mixed = /[a-z]/.test(pw) && /[A-Z0-9]/.test(pw);
  const symbol = /[^\w\s]/.test(pw);
  const score = Math.min(3, [pw.length >= 6, long || mixed, symbol && mixed].filter(Boolean).length) as 0 | 1 | 2 | 3;
  return [
    { score: 0 as const, label: "Too short", tone: "bg-ink-200 dark:bg-ink-700" },
    { score: 1 as const, label: "Weak", tone: "bg-root-500" },
    { score: 2 as const, label: "Good", tone: "bg-saffron-500" },
    { score: 3 as const, label: "Strong", tone: "bg-emerald-500" },
  ][score];
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  // Sending people back where they were beats dumping everyone on the home page.
  const next = params.get("next") ?? "/";
  const isLogin = mode === "login";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState<null | "form" | "google" | "reset">(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const pw = useMemo(() => strength(password), [password]);
  const tooShort = !isLogin && password.length > 0 && password.length < 6;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (tooShort) {
      setError("Password should be at least 6 characters.");
      return;
    }
    setPending("form");
    try {
      if (isLogin) await logIn(email, password);
      else await signUp(email, password, username.trim() || email.split("@")[0]);
      router.push(next);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setPending(null);
    }
  };

  const google = async () => {
    setError(null);
    setNotice(null);
    setPending("google");
    try {
      await signInWithGoogle();
      router.push(next);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      // Closing the popup is a decision, not a failure — say nothing.
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setError(authErrorMessage(err));
      }
    } finally {
      setPending(null);
    }
  };

  const forgot = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Enter your email address first, then tap “Forgot password”.");
      return;
    }
    setPending("reset");
    try {
      await resetPassword(email.trim());
      setNotice(`Reset link sent to ${email.trim()}. Check your inbox.`);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setPending(null);
    }
  };

  const busy = pending !== null;

  return (
    <div className="grid lg:min-h-[calc(100vh-68px)] lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt=""
          fill
          sizes="50vw"
          placeholder="blur"
          blurDataURL={BLUR}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink-900/70" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <UtensilsCrossed className="mb-4 text-root-400" size={32} />
          <h2 className="font-display text-3xl font-extrabold leading-tight">
            The Maldives&apos; best tables, all in one place.
          </h2>
          <ul className="mt-6 space-y-2.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-ink-100">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-root-500">
                  <Check size={12} strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-start justify-center px-4 pb-8 pt-2 sm:px-6 lg:items-center lg:py-6">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm text-ink-500 transition hover:text-root-600 lg:mb-8"
          >
            <ArrowLeft size={16} /> Keep browsing
          </Link>

          {/* Phones don't get the photo panel, so the perks ride along here —
              otherwise the page is a form floating in white space. */}
          <div className="mb-6 rounded-3xl bg-root-500 p-5 text-white lg:hidden">
            <UtensilsCrossed size={26} className="mb-2.5" />
            <h2 className="font-display text-xl font-extrabold leading-snug">
              The Maldives&apos; best tables, all in one place.
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-white/90">
              {PERKS.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check size={15} strokeWidth={3} className="mt-0.5 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white sm:text-3xl">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-sm text-ink-500 sm:text-base">
            {isLogin
              ? "Sign in to pick up where you left off."
              : "It takes about twenty seconds."}
          </p>

          {/* Google first: it's the path most people finish. */}
          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="mt-5 flex min-h-[52px] w-full items-center sm:mt-7 justify-center gap-2.5 rounded-full border border-ink-200 font-semibold text-ink-700 transition hover:bg-ink-50 active:scale-[0.99] disabled:opacity-60 dark:border-ink-700 dark:text-ink-100 dark:hover:bg-ink-800"
          >
            {pending === "google" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-sm text-ink-400 sm:my-6">
            <div className="h-px flex-1 bg-ink-100 dark:bg-ink-800" />
            or use email
            <div className="h-px flex-1 bg-ink-100 dark:bg-ink-800" />
          </div>

          <form onSubmit={submit} noValidate>
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <Label>Username</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="foodie_mv"
                    autoComplete="username"
                  />
                  <p className="mt-1.5 text-xs text-ink-400">
                    Shown on your reviews. We&apos;ll pick one from your email if
                    you skip it.
                  </p>
                </div>
              )}

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus={isLogin}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Password</Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={forgot}
                      disabled={busy}
                      className="mb-1.5 text-sm font-medium text-root-600 transition hover:text-root-700 disabled:opacity-60"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? "••••••••" : "At least 6 characters"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className="pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {!isLogin && password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex flex-1 gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className={cx(
                            "h-1 flex-1 rounded-full transition-colors",
                            i < pw.score ? pw.tone : "bg-ink-200 dark:bg-ink-700"
                          )}
                        />
                      ))}
                    </div>
                    <span className="w-14 shrink-0 text-right text-xs text-ink-500">
                      {pw.label}
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-xl bg-root-50 px-3 py-2.5 text-sm text-root-700 dark:bg-root-900/20 dark:text-root-300"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </p>
              )}

              {notice && (
                <p
                  role="status"
                  className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                >
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  {notice}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="min-h-[52px] w-full"
                disabled={busy}
              >
                {pending === "form" && <Loader2 size={18} className="animate-spin" />}
                {isLogin ? "Sign in" : "Create account"}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            {isLogin ? "New here? " : "Already have an account? "}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="font-semibold text-root-600 hover:text-root-700"
            >
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </div>
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
