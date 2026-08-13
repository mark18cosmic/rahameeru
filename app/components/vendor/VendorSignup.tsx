"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  Check,
  Store,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { signUp, logIn, authErrorMessage } from "@/app/lib/auth";
import { applyAsVendor, PLANS, type PlanId } from "@/app/lib/vendor";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { cx } from "@/app/lib/utils";
import { Input, Label, Textarea } from "../ui/Field";

type Step = 0 | 1 | 2;

const STEPS = ["Your restaurant", "Your account", "Plan"];

/**
 * Vendor application.
 *
 * Separate from the consumer sign-up on purpose: this collects business
 * details, ends in an application rather than an account that can do anything,
 * and never mentions favourites or reviews. Someone who already has a diner
 * account can apply with it — the vendor record hangs off the same uid.
 */
export function VendorSignup() {
  const router = useRouter();
  const { user } = useAuth();
  const { restaurants } = useRestaurants();

  const [step, setStep] = useState<Step>(0);
  const [businessName, setBusinessName] = useState("");
  const [listingId, setListingId] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [plan, setPlan] = useState<PlanId>("starter");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Match what they type against the listings already in the app, so most
  // applications arrive attached to the right page.
  const matches = useMemo(() => {
    const q = businessName.trim().toLowerCase();
    if (q.length < 2) return [];
    return restaurants
      .filter((r) => r.name.toLowerCase().includes(q))
      .slice(0, 4);
  }, [businessName, restaurants]);

  const stepValid =
    step === 0
      ? businessName.trim().length > 1 && contactName.trim().length > 1 && phone.trim().length > 5
      : step === 1
        ? Boolean(user) || (email.includes("@") && password.length >= 6)
        : true;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      let uid = user?.uid;
      if (!uid) {
        const account =
          mode === "new"
            ? await signUp(email.trim(), password, contactName.trim() || businessName.trim())
            : await logIn(email.trim(), password);
        uid = account.uid;
      }

      await applyAsVendor(uid, {
        businessName: businessName.trim(),
        contactName: contactName.trim(),
        email: (user?.email ?? email).trim(),
        phone: phone.trim(),
        about: about.trim(),
        plan,
        restaurantIds: listingId ? [listingId] : [],
      });

      router.push("/vendor/dashboard");
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-6 md:py-12">
      <Link
        href="/vendor"
        className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-ink-500 transition hover:text-root-600"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="mt-2 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-root-500 text-white">
          <Store size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white sm:text-3xl">
            Claim your restaurant
          </h1>
          <p className="text-sm text-ink-500">Takes two minutes. Reviewed by hand.</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-7 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                <motion.div
                  initial={false}
                  animate={{ width: i <= step ? "100%" : "0%" }}
                  transition={{ duration: 0.35 }}
                  className="h-full rounded-full bg-root-500"
                />
              </div>
              <p
                className={cx(
                  "mt-1.5 truncate text-[11px] font-medium",
                  i <= step ? "text-ink-700 dark:text-ink-200" : "text-ink-400"
                )}
              >
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 clay rounded-[2rem] p-5 md:p-6">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label>Restaurant name</Label>
              <Input
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  setListingId("");
                }}
                placeholder="Sala Thai"
                autoFocus
              />
              {matches.length > 0 && !listingId && (
                <div className="mt-2 rounded-2xl border border-ink-100 p-1.5 dark:border-ink-800">
                  <p className="px-2 py-1 text-xs text-ink-400">
                    Is this your listing?
                  </p>
                  {matches.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setListingId(r.id);
                        setBusinessName(r.name);
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left text-sm transition hover:bg-ink-50 dark:hover:bg-ink-800"
                    >
                      <span className="truncate text-ink-800 dark:text-ink-100">
                        {r.name}
                      </span>
                      <span className="shrink-0 text-xs text-ink-400">{r.location}</span>
                    </button>
                  ))}
                </div>
              )}
              {listingId && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                  <Check size={15} /> Linked to an existing listing
                </p>
              )}
            </div>

            <div>
              <Label>Your name</Label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Who we'll be speaking to"
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="+960 …"
              />
            </div>

            <div>
              <Label>Anything that helps us verify you</Label>
              <Textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Business registration number, your role, a website or Instagram we can check."
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {user ? (
              <div className="rounded-2xl bg-ink-50 p-4 dark:bg-ink-800/60">
                <p className="text-sm text-ink-600 dark:text-ink-300">
                  Applying as{" "}
                  <b className="text-ink-900 dark:text-white">{user.email}</b>.
                  Your dashboard will live on this account.
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  {(["new", "existing"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={cx(
                        "min-h-[44px] flex-1 rounded-full border text-sm font-medium transition active:scale-95",
                        mode === m
                          ? "border-root-500 bg-root-50 text-root-700 dark:bg-root-900/20 dark:text-root-300"
                          : "border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-300"
                      )}
                    >
                      {m === "new" ? "New account" : "I have an account"}
                    </button>
                  ))}
                </div>
                <div>
                  <Label>Work email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@restaurant.mv"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "new" ? "At least 6 characters" : "••••••••"}
                    autoComplete={mode === "new" ? "new-password" : "current-password"}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-ink-500">
              Pick where you want to start. Nothing is charged now — billing
              isn&apos;t connected yet, and we&apos;ll talk to you before it is.
            </p>
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlan(p.id)}
                className={cx(
                  "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition active:scale-[0.99]",
                  plan === p.id
                    ? "border-root-500 bg-root-50 dark:bg-root-900/20"
                    : "border-ink-200 dark:border-ink-700"
                )}
              >
                <span
                  className={cx(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                    plan === p.id ? "border-root-500 bg-root-500 text-white" : "border-ink-300"
                  )}
                >
                  {plan === p.id && <Check size={12} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink-900 dark:text-white">
                    {p.name}
                  </span>
                  <span className="block text-sm text-ink-500">{p.tagline}</span>
                </span>
                <span className="shrink-0 text-sm font-bold text-ink-900 dark:text-white">
                  {p.price === 0 ? "Free" : `${p.price.toLocaleString()} MVR`}
                </span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-root-50 px-3 py-2.5 text-sm text-root-700 dark:bg-root-900/20 dark:text-root-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="min-h-[48px] clay-sm clay-press rounded-full px-5 font-semibold text-ink-700 transition active:scale-95 dark:text-ink-100"
            >
              Back
            </button>
          )}
          <button
            onClick={() => (step === 2 ? submit() : setStep((s) => (s + 1) as Step))}
            disabled={!stepValid || busy}
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-root-500 font-semibold text-white transition hover:bg-root-600 active:scale-[0.98] disabled:opacity-50"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {step === 2 ? "Submit application" : "Continue"}
            {step < 2 && <ArrowRight size={16} />}
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-ink-400">
        Applications are checked by a person before a listing changes hands.
      </p>
    </div>
  );
}
