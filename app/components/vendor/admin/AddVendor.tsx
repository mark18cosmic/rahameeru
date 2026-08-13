"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Plus, Store, X } from "lucide-react";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { createVendorAsAdmin } from "@/app/lib/vendor";
import { cx } from "@/app/lib/utils";
import { Input, Label } from "../../ui/Field";

/**
 * Sets a restaurant up as a vendor directly, without waiting for them to apply.
 *
 * Keyed by email rather than uid, because the person may not have an account
 * yet — `getVendor` adopts the record onto their uid the first time they sign
 * in with that address.
 */
export function AddVendor({ onCreated }: { onCreated: () => void }) {
  const { restaurants } = useRestaurants();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [q, setQ] = useState("");

  const matches = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return restaurants.slice(0, 6);
    return restaurants
      .filter((r) => r.name.toLowerCase().includes(term))
      .slice(0, 8);
  }, [restaurants, q]);

  const reset = () => {
    setBusinessName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setPicked([]);
    setQ("");
  };

  const save = async () => {
    if (!businessName.trim() || !email.trim()) {
      setError("A business name and an email are the minimum.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createVendorAsAdmin({
        businessName: businessName.trim(),
        contactName: contactName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        restaurantIds: picked,
      });
      reset();
      setDone(true);
      setOpen(false);
      onCreated();
      setTimeout(() => setDone(false), 3000);
    } catch {
      setError("Couldn't save that. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="clay-root clay-press inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-5 font-semibold sm:w-auto"
      >
        {open ? <X size={17} /> : <Plus size={17} />}
        {open ? "Cancel" : "Add a vendor"}
      </button>

      {done && (
        <p className="clay-inset mt-3 flex items-center gap-2 rounded-2xl p-3 text-sm font-semibold text-emerald-600">
          <Check size={16} /> Vendor added and approved.
        </p>
      )}

      {open && (
        <div className="clay mt-3 space-y-4 rounded-[2rem] p-5">
          <div>
            <Label>Business name</Label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Sea House"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Contact name</Label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Who you spoke to"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={phone}
                inputMode="tel"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="777 1234"
              />
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="them@restaurant.mv"
            />
            <p className="mt-1.5 text-xs text-ink-400">
              They get vendor access the first time they sign in with this
              address — no invite to send.
            </p>
          </div>

          <div>
            <Label>Which listings do they run?</Label>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search listings…"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {matches.map((r) => {
                const on = picked.includes(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() =>
                      setPicked((p) =>
                        on ? p.filter((x) => x !== r.id) : [...p, r.id]
                      )
                    }
                    className={cx(
                      "inline-flex min-h-[42px] items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition",
                      on ? "clay-root" : "clay-sm clay-press text-ink-600 dark:text-ink-300"
                    )}
                  >
                    <Store size={14} />
                    {r.name}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm font-semibold text-root-600">
              {error}
            </p>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="clay-root clay-press inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-6 font-semibold disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Add and approve
          </button>
        </div>
      )}
    </div>
  );
}
