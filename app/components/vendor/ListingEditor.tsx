"use client";

import { useEffect, useState } from "react";
import { deleteField, doc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { db } from "@/app/firebase/firebaseConfig";
import type { OpeningHours, Restaurant } from "@/app/lib/types";
import { refreshRestaurants } from "@/app/lib/restaurants";
import { cx } from "@/app/lib/utils";
import { Input, Label, Textarea } from "../ui/Field";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function defaultHours(open = "10:00", close = "22:00"): OpeningHours[] {
  return Array.from({ length: 7 }, (_, day) => ({ day, open, close }));
}

/** Days missing from a schedule are the days it is closed. */
const closedIn = (hours: OpeningHours[] | undefined) =>
  DAYS.map((_, d) => d).filter((d) => !(hours ?? []).some((h) => h.day === d));

/**
 * Lets an approved vendor correct the details on their own listing.
 *
 * Writes straight to the restaurant document, which the app already prefers
 * over its local seed data, so a change shows up everywhere on the next load.
 * Deliberately limited to the facts a restaurant owns: hours, contact, blurb,
 * and its Ramadan hours and iftar spread.
 * Ratings and reviews are not editable by the business they describe.
 */
export function ListingEditor({
  restaurant,
  bare = false,
}: {
  restaurant: Restaurant;
  /** Inside another panel (the admin console): just the form, already open. */
  bare?: boolean;
}) {
  const [editing, setEditing] = useState(bare);
  // During Ramadan `hours` holds the Ramadan schedule; edit the real one.
  const regular = restaurant.regularHours ?? restaurant.hours;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [description, setDescription] = useState(restaurant.description ?? "");
  const [phone, setPhone] = useState(restaurant.phone ?? "");
  const [email, setEmail] = useState(restaurant.email ?? "");
  const [address, setAddress] = useState(restaurant.address ?? "");
  const [hours, setHours] = useState<OpeningHours[]>(regular ?? defaultHours());
  const [closedDays, setClosedDays] = useState<number[]>(() => closedIn(regular));

  // Ramadan: separate hours (most kitchens shift to evenings) and an optional
  // iftar spread. Both only show on the site while the admin has Ramadan on.
  const [ramadanOn, setRamadanOn] = useState(Boolean(restaurant.ramadanHours?.length));
  const [ramadanHours, setRamadanHours] = useState<OpeningHours[]>(
    restaurant.ramadanHours ?? defaultHours("18:00", "02:00")
  );
  const [ramadanClosed, setRamadanClosed] = useState<number[]>(() =>
    restaurant.ramadanHours ? closedIn(restaurant.ramadanHours) : []
  );
  const [iftarOn, setIftarOn] = useState(Boolean(restaurant.iftar));
  const [iftarPrice, setIftarPrice] = useState(
    restaurant.iftar?.price ? String(restaurant.iftar.price) : ""
  );
  const [iftarNote, setIftarNote] = useState(restaurant.iftar?.note ?? "");

  useEffect(() => {
    if (!saved) return;
    const id = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(id);
  }, [saved]);

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, "restaurants", restaurant.id),
        {
          description: description.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          hours: hours.filter((h) => !closedDays.includes(h.day)),
          // deleteField rather than an empty value, so switching Ramadan
          // hours off falls back to the regular ones instead of "closed".
          ramadanHours: ramadanOn
            ? ramadanHours.filter((h) => !ramadanClosed.includes(h.day))
            : deleteField(),
          iftar: iftarOn
            ? {
                ...(Number(iftarPrice) > 0 ? { price: Math.round(Number(iftarPrice)) } : {}),
                ...(iftarNote.trim() ? { note: iftarNote.trim().slice(0, 140) } : {}),
              }
            : deleteField(),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      refreshRestaurants();
      setSaved(true);
      if (!bare) setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={bare ? "mt-4" : "surface rounded-3xl p-5"}>
      <div className={cx("flex items-start justify-between gap-3", bare && "hidden")}>
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-bold text-ink-900 dark:text-white">
            {restaurant.name}
          </h3>
          <p className="text-sm text-ink-500">
            {restaurant.location} · {restaurant.rating.toFixed(1)} from{" "}
            {restaurant.reviewCount.toLocaleString()} reviews
          </p>
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className="flex min-h-[40px] shrink-0 items-center gap-1.5 surface press rounded-full px-3.5 text-sm font-semibold transition active:scale-95 "
        >
          {editing ? <X size={15} /> : <Pencil size={15} />}
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      <AnimatePresence>
        {saved && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            <Check size={15} /> Saved. Diners see it on their next load.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-4">
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What should someone know before walking in?"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div>
                <Label>Opening hours</Label>
                <HoursEditor
                  hours={hours}
                  setHours={setHours}
                  closedDays={closedDays}
                  setClosedDays={setClosedDays}
                />
              </div>

              <div className="well space-y-4 rounded-2xl p-4">
                <Toggle on={ramadanOn} onChange={setRamadanOn}>
                  Different hours during Ramadan
                </Toggle>
                {ramadanOn && (
                  <HoursEditor
                    hours={ramadanHours}
                    setHours={setRamadanHours}
                    closedDays={ramadanClosed}
                    setClosedDays={setRamadanClosed}
                  />
                )}
                <Toggle on={iftarOn} onChange={setIftarOn}>
                  We serve an iftar spread
                </Toggle>
                {iftarOn && (
                  <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                    <div>
                      <Label htmlFor={`iftar-price-${restaurant.id}`}>Price per person (MVR)</Label>
                      <Input
                        id={`iftar-price-${restaurant.id}`}
                        inputMode="numeric"
                        value={iftarPrice}
                        onChange={(e) => setIftarPrice(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`iftar-note-${restaurant.id}`}>What it includes</Label>
                      <Input
                        id={`iftar-note-${restaurant.id}`}
                        value={iftarNote}
                        maxLength={140}
                        onChange={(e) => setIftarNote(e.target.value)}
                        placeholder="Dates, soup, grilled reef fish, juices"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={save}
                disabled={saving}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-root-500 font-semibold text-white transition hover:bg-root-600 active:scale-[0.98] disabled:opacity-60"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Save changes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({
  on,
  onChange,
  children,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-ink-800 dark:text-ink-100">
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 accent-root-500"
      />
      {children}
    </label>
  );
}

/** One row per day: open or closed, and the times when open. */
function HoursEditor({
  hours,
  setHours,
  closedDays,
  setClosedDays,
}: {
  hours: OpeningHours[];
  setHours: React.Dispatch<React.SetStateAction<OpeningHours[]>>;
  closedDays: number[];
  setClosedDays: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  const setDay = (day: number, key: "open" | "close", value: string) =>
    setHours((hs) =>
      hs.some((h) => h.day === day)
        ? hs.map((h) => (h.day === day ? { ...h, [key]: value } : h))
        : [...hs, { day, open: "10:00", close: "22:00", [key]: value }]
    );

  return (
    <div className="space-y-1.5">
      {DAYS.map((name, day) => {
        const h = hours.find((x) => x.day === day);
        const closed = closedDays.includes(day);
        return (
          <div key={name} className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-sm text-ink-600 dark:text-ink-300">{name}</span>
            <button
              onClick={() =>
                setClosedDays((c) => (closed ? c.filter((d) => d !== day) : [...c, day]))
              }
              className={cx(
                "min-h-[36px] shrink-0 rounded-full border px-3 text-xs font-medium transition",
                closed
                  ? "border-root-500 bg-root-50 text-root-700 dark:bg-root-900/20 dark:text-root-300"
                  : "border-ink-200 text-ink-500 dark:border-ink-700"
              )}
            >
              {closed ? "Closed" : "Open"}
            </button>
            {!closed && (
              <>
                <input
                  type="time"
                  aria-label={`${name} opens`}
                  value={h?.open ?? "10:00"}
                  onChange={(e) => setDay(day, "open", e.target.value)}
                  className="well min-h-[36px] rounded-xl px-2 text-sm"
                />
                <span className="text-ink-400">-</span>
                <input
                  type="time"
                  aria-label={`${name} closes`}
                  value={h?.close ?? "22:00"}
                  onChange={(e) => setDay(day, "close", e.target.value)}
                  className="well min-h-[36px] rounded-xl px-2 text-sm"
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
