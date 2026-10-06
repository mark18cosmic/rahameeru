"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { saveSiteSettings, type SiteSettings } from "@/app/lib/admin";
import { cx } from "@/app/lib/utils";
import { Input, Label } from "../../ui/Field";

/**
 * The home page sections an admin can turn on and off. Their order is set by
 * the time of day (see HomeContent), so this list only decides what appears.
 */
const RAILS: { key: string; label: string }[] = [
  { key: "featured", label: "Worth the walk" },
  { key: "popularDishes", label: "Dishes worth ordering" },
  { key: "openNow", label: "Open right now" },
  { key: "cheapDishes", label: "Eat well for less" },
  { key: "dateSpots", label: "Date night tab" },
  { key: "cafes", label: "Coffee and breakfast tab" },
  { key: "fastFood", label: "In and out fast tab" },
  { key: "recent", label: "Recently added" },
];

const TOGGLES: { key: keyof SiteSettings; label: string; hint: string }[] = [
  { key: "showCategories", label: "Category strip", hint: "The eight tiles under the hero" },
  { key: "showWheel", label: "Spin the wheel", hint: "The picker on the home page" },
  { key: "showReviewInvite", label: "Review invite", hint: "The prompt to write a review" },
  { key: "showCards", label: "What's on", hint: "Guides and today's specials" },
];

export function SiteSettingsPanel({
  settings,
  onSaved,
}: {
  settings: SiteSettings;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // A change made in another tab (or by the restaurant manager hiding a
  // listing) should not be overwritten by this panel's stale copy.
  useEffect(() => setDraft(settings), [settings]);

  useEffect(() => {
    if (!saved) return;
    const id = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(id);
  }, [saved]);

  const save = async () => {
    setSaving(true);
    try {
      await saveSiteSettings(draft);
      setSaved(true);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const toggleRail = (key: string) =>
    setDraft((d) => ({
      ...d,
      rails: d.rails.includes(key)
        ? d.rails.filter((r) => r !== key)
        : // Re-adding puts the rail back in its canonical position rather than
          // at the end, so toggling twice is a no-op.
          RAILS.filter((r) => r.key === key || d.rails.includes(r.key)).map(
            (r) => r.key
          ),
    }));

  return (
    <div className="space-y-6">
      <div className="surface rounded-3xl p-5">
        <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">
          Announcement
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          Shown across the top of the home page. Leave empty to hide it.
        </p>
        <Input
          value={draft.announcement}
          onChange={(e) => setDraft((d) => ({ ...d, announcement: e.target.value }))}
          placeholder="Ramadan hours are live for 40 places"
          className="mt-3"
        />
      </div>

      <div className="surface rounded-3xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">
              Ramadan mode
            </h3>
            <p className="mt-1 max-w-md text-sm text-ink-500">
              Uses each listing&apos;s Ramadan hours, leads the home page with
              iftar spreads and counts down to iftar. Update the times from the
              official Malé timetable as they shift.
            </p>
          </div>
          <Switch
            on={draft.ramadan.enabled}
            label="Ramadan mode"
            onClick={() =>
              setDraft((d) => ({ ...d, ramadan: { ...d.ramadan, enabled: !d.ramadan.enabled } }))
            }
          />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="ramadan-start">First day</Label>
            <Input
              id="ramadan-start"
              type="date"
              value={draft.ramadan.startDate ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, ramadan: { ...d.ramadan, startDate: e.target.value } }))
              }
            />
          </div>
          <div>
            <Label htmlFor="iftar-time">Iftar</Label>
            <Input
              id="iftar-time"
              type="time"
              value={draft.ramadan.iftar}
              onChange={(e) =>
                setDraft((d) => ({ ...d, ramadan: { ...d.ramadan, iftar: e.target.value } }))
              }
            />
          </div>
          <div>
            <Label htmlFor="suhoor-time">Suhoor ends</Label>
            <Input
              id="suhoor-time"
              type="time"
              value={draft.ramadan.suhoor}
              onChange={(e) =>
                setDraft((d) => ({ ...d, ramadan: { ...d.ramadan, suhoor: e.target.value } }))
              }
            />
          </div>
        </div>
      </div>

      <div className="surface rounded-3xl p-5">
        <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">
          Sections
        </h3>
        <div className="mt-3 space-y-2">
          {TOGGLES.map((t) => {
            const on = Boolean(draft[t.key]);
            return (
              <button
                key={t.key}
                onClick={() => setDraft((d) => ({ ...d, [t.key]: !on }))}
                className="well flex w-full items-center justify-between gap-3 rounded-2xl p-3 text-left"
              >
                <span>
                  <span className="block font-semibold text-ink-800 dark:text-ink-100">
                    {t.label}
                  </span>
                  <span className="block text-xs text-ink-400">{t.hint}</span>
                </span>
                <Knob on={on} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="surface rounded-3xl p-5">
        <Label>Home page sections</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {RAILS.map((r) => {
            const on = draft.rails.includes(r.key);
            return (
              <button
                key={r.key}
                onClick={() => toggleRail(r.key)}
                className={cx(
                  "min-h-[42px] rounded-full px-4 text-sm font-semibold transition",
                  on ? "fill-root" : "surface press text-ink-500"
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="fill-root press inline-flex min-h-[48px] items-center gap-2 rounded-full px-6 font-semibold disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          Save settings
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
            <Check size={16} /> Saved
          </span>
        )}
      </div>
    </div>
  );
}

function Knob({ on }: { on: boolean }) {
  return (
    <span
      className={cx(
        "grid h-7 w-12 shrink-0 items-center rounded-full px-1 transition",
        on ? "fill-root" : "surface"
      )}
    >
      <span
        className={cx(
          "h-5 w-5 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-5" : "translate-x-0"
        )}
      />
    </span>
  );
}

function Switch({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onClick} className="shrink-0">
      <Knob on={on} />
    </button>
  );
}
