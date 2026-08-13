"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { getVendor, type VendorProfile } from "./vendor";
import { OWNER_EMAIL } from "./admin";

/**
 * Admins are named by email in code and in the environment rather than by a
 * flag in the database, so a compromised account can't promote itself.
 * Firestore rules are the real enforcement — this only decides what the UI
 * offers. The owner address is always included so a deploy that never set
 * `NEXT_PUBLIC_ADMIN_EMAILS` still has a way in.
 */
export function adminEmails(): string[] {
  const fromEnv = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([OWNER_EMAIL.toLowerCase(), ...fromEnv]));
}

export function useVendor() {
  const { user, loading: authLoading } = useAuth();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setVendor(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setVendor(await getVendor(user.uid, user.email));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  const email = user?.email?.toLowerCase() ?? "";
  const isAdmin = Boolean(email) && adminEmails().includes(email);

  return {
    vendor,
    loading: loading || authLoading,
    refresh,
    isAdmin,
    isApproved: vendor?.status === "approved",
  };
}
