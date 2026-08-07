"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { doc, updateDoc } from "firebase/firestore";
import {
  QrCode,
  Printer,
  RefreshCw,
  Loader2,
  Info,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { db } from "@/app/firebase/firebaseConfig";
import type { Restaurant } from "@/app/lib/types";
import {
  weekCode,
  weekKey,
  weekExpiry,
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
 * never heard of Rahameeru. The code changes every Monday, and each person can
 * only claim a given week's code once, so a photo passed around a group chat
 * earns nobody anything they couldn't get by turning up.
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
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

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
      const value = await weekCode(scanSecret, selected);
      if (!alive) return;
      setCode(value);

      const url = `${window.location.origin}/scan/${selected}?k=${value}`;
      setLink(url);
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

  const download = () => {
    if (!qr || !restaurant) return;
    const a = document.createElement("a");
    a.href = qr;
    // Dated filename: these expire, and a folder of "qr.png" helps nobody.
    a.download = `${restaurant.slug}-scan-${weekKey()}.png`;
    a.click();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard denied */
    }
  };

  /** Burns every printed code immediately. For a leak, not for routine use. */
  const rotateNow = useCallback(async () => {
    if (
      !window.confirm(
        "Every printed code stops working straight away and you'll need to reprint. Continue?"
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await updateDoc(doc(db, "vendors", vendorUid), { scanSecret: newScanSecret() });
      onSecret();
    } finally {
      setBusy(false);
    }
  }, [vendorUid, onSecret]);

  const expiry = weekExpiry();
  const expiryLabel = expiry.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const daysLeft = Math.max(
    0,
    Math.ceil((expiry.getTime() - Date.now()) / 86400000)
  );

  const print = () => {
    if (!qr || !restaurant) return;
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><title>${restaurant.name} — scan code</title>
      <style>
        @page{margin:16mm}
        body{font-family:system-ui,sans-serif;text-align:center;padding:40px 32px;color:#171512}
        h1{font-size:32px;margin:0 0 8px;letter-spacing:-.02em}
        .sub{color:#6b6459;margin:0 0 26px;font-size:17px}
        img{width:330px;height:330px}
        ol{list-style:none;padding:0;margin:26px auto 0;max-width:340px;text-align:left;font-size:15px;color:#3a352e}
        li{display:flex;gap:10px;margin-bottom:8px}
        b{background:#F84B3B;color:#fff;width:22px;height:22px;border-radius:99px;display:grid;place-items:center;font-size:12px;flex:none}
        .code{font-family:ui-monospace,monospace;letter-spacing:.2em;color:#8e877b;margin-top:18px;font-size:13px}
        .note{margin-top:30px;font-size:12px;color:#8e877b}
      </style>
      <h1>Points for eating here</h1>
      <p class="sub">${restaurant.name}</p>
      <img src="${qr}" alt="" />
      <div class="code">${code}</div>
      <ol>
        <li><b>1</b><span>Open your camera and point it at the code.</span></li>
        <li><b>2</b><span>Tap the link that pops up.</span></li>
        <li><b>3</b><span>Your points land straight away — and your review will show as a verified visit.</span></li>
      </ol>
      <div class="note">Rahameeru · this code expires ${expiryLabel}</div>`);
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
            <p className="flex items-center gap-1.5 text-center text-xs text-ink-500">
              <RefreshCw size={12} />
              Expires {expiryLabel} · {daysLeft} {daysLeft === 1 ? "day" : "days"} left
            </p>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              onClick={print}
              disabled={!qr}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-root-500 font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
            >
              <Printer size={17} /> Print a poster
            </button>
            <button
              onClick={download}
              disabled={!qr}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-ink-200 font-semibold transition active:scale-[0.98] disabled:opacity-50 dark:border-ink-700"
            >
              <Download size={17} /> Download PNG
            </button>
          </div>

          <button
            onClick={copyLink}
            disabled={!link}
            className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-ink-500 transition disabled:opacity-50"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Link copied" : "Copy the scan link"}
          </button>

          <button
            onClick={rotateNow}
            disabled={busy}
            className="mt-1 flex min-h-[40px] w-full items-center justify-center gap-2 text-xs font-semibold text-ink-400 transition hover:text-root-600 disabled:opacity-50"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Replace the code now (if one has leaked)
          </button>

          <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-ink-400">
            <Info size={13} className="mt-0.5 shrink-0" />
            Reprint every Monday — the code changes with the week. Each person
            can claim one code once, and a scan also checks their phone is near
            you, so sharing a photo of it earns nobody anything.
          </p>
        </>
      )}
    </section>
  );
}
