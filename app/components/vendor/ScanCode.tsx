"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { doc, updateDoc } from "firebase/firestore";
import { QrCode, Printer, RefreshCw, Loader2, Info } from "lucide-react";
import { db } from "@/app/firebase/firebaseConfig";
import type { Restaurant } from "@/app/lib/types";
import {
  dayCode,
  dayKey,
  newScanSecret,
  SCAN_POINTS,
  FIRST_SCAN_BONUS,
} from "@/app/lib/scan";

/**
 * The vendor's table code.
 *
 * The QR encodes an ordinary URL, so it is scanned with the phone's own camera
 * app — no app install, no in-app scanner, and it works for someone who has
 * never heard of Rahameeru. The code changes daily, which is what stops a photo
 * of the table tent circulating in a group chat.
 */
export function ScanCode({
  vendorUid,
  scanSecret,
  restaurants,
  onSecret,
}: {
  vendorUid: string;
  scanSecret?: string;
  restaurants: Restaurant[];
  onSecret: () => void;
}) {
  const [selected, setSelected] = useState(restaurants[0]?.id ?? "");
  const [qr, setQr] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const restaurant = restaurants.find((r) => r.id === selected);

  /** Vendors created before scanning existed have no secret yet. */
  const ensureSecret = useCallback(async () => {
    setBusy(true);
    try {
      await updateDoc(doc(db, "vendors", vendorUid), { scanSecret: newScanSecret() });
      onSecret();
    } finally {
      setBusy(false);
    }
  }, [vendorUid, onSecret]);

  useEffect(() => {
    if (!scanSecret || !selected) return;
    let alive = true;

    (async () => {
      const value = await dayCode(scanSecret, selected);
      if (!alive) return;
      setCode(value);

      const url = `${window.location.origin}/scan/${selected}?k=${value}`;
      // Loaded on demand: the encoder is only needed on this one panel.
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 640,
        margin: 1,
        color: { dark: "#171512", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
      if (alive) setQr(dataUrl);
    })();

    return () => {
      alive = false;
    };
  }, [scanSecret, selected]);

  const print = () => {
    if (!qr || !restaurant) return;
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><title>${restaurant.name} — scan code</title>
      <style>
        body{font-family:system-ui,sans-serif;text-align:center;padding:56px 32px;color:#171512}
        h1{font-size:30px;margin:0 0 6px}
        p{color:#6b6459;margin:0 0 28px;font-size:16px}
        img{width:340px;height:340px}
        .code{font-family:ui-monospace,monospace;letter-spacing:.18em;color:#8e877b;margin-top:20px;font-size:13px}
        .note{margin-top:36px;font-size:13px;color:#8e877b}
      </style>
      <h1>Scan for points at ${restaurant.name}</h1>
      <p>Open your camera, point it here. Today only — ${dayKey()}.</p>
      <img src="${qr}" alt="" />
      <div class="code">${code}</div>
      <div class="note">Rahameeru · rahameeru.com</div>`);
    w.document.close();
    w.focus();
    w.print();
  };

  if (restaurants.length === 0) return null;

  return (
    <section className="rounded-3xl border border-ink-100 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ink-900 text-white dark:bg-white dark:text-ink-900">
          <QrCode size={19} />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
            Table code
          </h2>
          <p className="text-sm text-ink-500">
            Diners scan it on arrival. They earn {SCAN_POINTS} points, or{" "}
            {SCAN_POINTS + FIRST_SCAN_BONUS} their first time with you, and their
            review is marked as a verified visit.
          </p>
        </div>
      </div>

      {!scanSecret ? (
        <button
          onClick={ensureSecret}
          disabled={busy}
          className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-root-500 font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          Turn on scanning
        </button>
      ) : (
        <>
          {restaurants.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {restaurants.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r.id)}
                  className={`min-h-[38px] rounded-full border px-3.5 text-[13px] font-medium transition ${
                    selected === r.id
                      ? "border-root-500 bg-root-50 text-root-700 dark:bg-root-900/20 dark:text-root-300"
                      : "border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-300"
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-ink-50 p-5 dark:bg-ink-800/50">
            {qr ? (
              <Image
                src={qr}
                alt="Scan code"
                width={200}
                height={200}
                unoptimized
                className="rounded-xl bg-white p-2"
              />
            ) : (
              <div className="grid h-[200px] w-[200px] place-items-center text-ink-400">
                <Loader2 size={22} className="animate-spin" />
              </div>
            )}
            <p className="font-mono text-xs tracking-[0.18em] text-ink-400">{code}</p>
            <p className="flex items-center gap-1.5 text-xs text-ink-500">
              <RefreshCw size={12} /> Changes daily · {dayKey()}
            </p>
          </div>

          <button
            onClick={print}
            disabled={!qr}
            className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-ink-200 font-semibold transition active:scale-[0.98] disabled:opacity-50 dark:border-ink-700"
          >
            <Printer size={17} /> Print for the table
          </button>

          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-400">
            <Info size={13} className="mt-0.5 shrink-0" />
            Print it fresh each day, or leave the app open at the counter. A
            scan also checks the phone is near you, and only counts once per
            person per day.
          </p>
        </>
      )}
    </section>
  );
}
