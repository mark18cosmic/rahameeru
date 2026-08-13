"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Info, Loader2, ShieldCheck, Trophy, UserCheck } from "lucide-react";
import {
  listAllAuthUsers,
  listUsers,
  setUserPoints,
  updateUser,
  type ManagedUser,
} from "@/app/lib/admin";
import { useAuth } from "@/app/providers/AuthProvider";
import { cx } from "@/app/lib/utils";
import { Input } from "../../ui/Field";

const ROLES = ["user", "vendor", "admin"] as const;

export function UserManager() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [grant, setGrant] = useState<Record<string, string>>({});
  const [complete, setComplete] = useState(false);
  const { user } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    // The Firestore documents carry points, roles and suspensions; the Admin
    // SDK route carries everyone. Merge so the table is complete without
    // losing the app state, and fall back to Firestore alone when the route
    // has no service account configured.
    const stored = await listUsers();
    const all = user ? await listAllAuthUsers(await user.getIdToken()) : null;
    if (!all) {
      setUsers(stored);
      setComplete(false);
    } else {
      const byUid = new Map(stored.map((u) => [u.uid, u]));
      setUsers(
        all.map((u) => ({ ...u, ...byUid.get(u.uid), suspended: u.suspended }))
      );
      setComplete(true);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) =>
      `${u.email ?? ""} ${u.name ?? ""} ${u.uid}`.toLowerCase().includes(term)
    );
  }, [users, q]);

  const patch = async (u: ManagedUser, p: Partial<ManagedUser>) => {
    setBusy(u.uid);
    try {
      await updateUser(u.uid, p);
      await load();
    } finally {
      setBusy(null);
    }
  };

  const applyPoints = async (u: ManagedUser) => {
    const value = Number(grant[u.uid]);
    if (!Number.isFinite(value)) return;
    setBusy(u.uid);
    try {
      await setUserPoints(u.uid, value);
      setGrant((g) => ({ ...g, [u.uid]: "" }));
      await load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      {/* Said plainly rather than letting the admin assume the list is
          everyone — the client SDK cannot enumerate Firebase Auth. */}
      {!complete && (
        <p className="clay-inset flex items-start gap-2 rounded-2xl p-3 text-sm text-ink-500 dark:text-ink-300">
          <Info size={16} className="mt-0.5 shrink-0" />
          Showing accounts that have signed in since this build, or that have
          app state. To list <strong>every</strong> account, set{" "}
          <code className="font-mono text-xs">FIREBASE_SERVICE_ACCOUNT</code> in
          the environment — the admin route needs it to read Firebase Auth.
        </p>
      )}

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Find by email, name or uid…"
        className="mt-4 max-w-xs"
      />

      <p className="mt-4 text-sm text-ink-500">
        {loading ? "Loading…" : `${shown.length} accounts`}
      </p>

      <div className="mt-3 space-y-3">
        {shown.map((u) => (
          <div key={u.uid} className="clay rounded-[1.75rem] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-bold text-ink-900 dark:text-white">
                  {u.name ?? u.email ?? "Unnamed account"}
                </p>
                <p className="truncate text-sm text-ink-500">
                  {u.email ?? u.uid}
                </p>
              </div>
              <span className="clay-saffron inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold">
                <Trophy size={14} /> {u.points.toLocaleString()}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => patch(u, { role })}
                  disabled={busy === u.uid}
                  className={cx(
                    "min-h-[38px] rounded-full px-3.5 text-xs font-semibold capitalize transition disabled:opacity-60",
                    (u.role ?? "user") === role
                      ? "clay-root"
                      : "clay-sm clay-press text-ink-600 dark:text-ink-300"
                  )}
                >
                  {role === "admin" && <ShieldCheck size={12} className="mr-1 inline" />}
                  {role}
                </button>
              ))}

              <button
                onClick={() => patch(u, { suspended: !u.suspended })}
                disabled={busy === u.uid}
                className={cx(
                  "inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition disabled:opacity-60",
                  u.suspended ? "clay-root" : "clay-sm clay-press text-ink-600 dark:text-ink-300"
                )}
              >
                {u.suspended ? <UserCheck size={13} /> : <Ban size={13} />}
                {u.suspended ? "Restore" : "Suspend"}
              </button>

              <span className="ml-auto inline-flex items-center gap-1.5">
                <Input
                  type="number"
                  inputMode="numeric"
                  value={grant[u.uid] ?? ""}
                  onChange={(e) =>
                    setGrant((g) => ({ ...g, [u.uid]: e.target.value }))
                  }
                  placeholder="Set points"
                  className="w-32 py-2"
                />
                <button
                  onClick={() => applyPoints(u)}
                  disabled={busy === u.uid || !grant[u.uid]}
                  className="clay-sm clay-press inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold disabled:opacity-50"
                >
                  {busy === u.uid && <Loader2 size={13} className="animate-spin" />}
                  Apply
                </button>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
