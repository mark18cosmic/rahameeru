"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, QrCode, Camera, Keyboard, Trophy, Info } from "lucide-react";
import { SCAN_POINTS, FIRST_SCAN_BONUS } from "@/app/lib/scan";
import { cx } from "@/app/lib/utils";

/** Chrome and Safari 17+ ship this; older browsers fall back to typing the code. */
type DetectedBarcode = { rawValue: string };
declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: string[] }): {
        detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
      };
    };
  }
}

/**
 * Scanning from inside the app.
 *
 * The QR is an ordinary URL, so the phone's own camera app already works and is
 * what most people will use. This exists for the person who opened the
 * restaurant's page first and is now looking at the code on the table — and for
 * anyone whose browser won't open a camera, who can type the ten characters
 * printed underneath it instead.
 */
export function ScanSheet({
  restaurantId,
  restaurantName,
  open,
  onClose,
}: {
  /** Omitted when opened from the profile: the code carries the venue. */
  restaurantId?: string;
  restaurantName?: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const stop = useRef(false);

  const [mode, setMode] = useState<"camera" | "code">("camera");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  /**
   * A scanned QR carries the venue as well as the code, so it can be followed
   * wherever the sheet was opened from. A typed code only makes sense on a
   * restaurant's own page, where we know which venue it belongs to.
   */
  const follow = useCallback(
    (raw: string): boolean => {
      const trimmed = raw.trim();
      try {
        const url = new URL(trimmed);
        const match = url.pathname.match(/\/scan\/([^/?#]+)/);
        const k = url.searchParams.get("k");
        if (match && k) {
          router.push(`/scan/${match[1]}?k=${k}`);
          return true;
        }
      } catch {
        // Not a URL — treat it as a printed code for the page we're on.
      }
      if (restaurantId && /^[a-f0-9]{6,20}$/i.test(trimmed)) {
        router.push(`/scan/${restaurantId}?k=${trimmed.toLowerCase()}`);
        return true;
      }
      return false;
    },
    [router, restaurantId]
  );

  useEffect(() => {
    if (!open || mode !== "camera") return;
    stop.current = false;

    (async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        stream.current = media;
        if (video.current) {
          video.current.srcObject = media;
          video.current.setAttribute("playsinline", "true");
          await video.current.play();
        }

        const hit = (value: string) => {
          if (!follow(value)) return false;
          stop.current = true;
          if (navigator.vibrate) navigator.vibrate(20);
          return true;
        };

        if (window.BarcodeDetector) {
          // Native decoding where the browser has it: no download, no canvas.
          const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
          const tick = async () => {
            if (stop.current || !video.current) return;
            try {
              const found = await detector.detect(video.current);
              for (const f of found) if (hit(f.rawValue)) return;
            } catch {
              // Unreadable frame — try the next one.
            }
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          return;
        }

        // iOS Safari has no BarcodeDetector, so decode in JS. Pulled in only
        // when it's actually needed, and only ~15 fps — a phone camera gives
        // plenty of chances and this keeps the device cool.
        const jsQR = (await import("jsqr")).default;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        const scan = () => {
          if (stop.current || !video.current || !ctx) return;
          const v = video.current;
          if (v.videoWidth) {
            // Quarter resolution is ample for a code held up to the lens, and
            // it keeps each frame's decode under a few milliseconds.
            const w = (canvas.width = Math.min(480, v.videoWidth));
            const h = (canvas.height = Math.round((v.videoHeight / v.videoWidth) * w));
            ctx.drawImage(v, 0, 0, w, h);
            const found = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, {
              inversionAttempts: "dontInvert",
            });
            if (found && hit(found.data)) return;
          }
          window.setTimeout(scan, 66);
        };
        scan();
      } catch {
        setError("Couldn't open the camera. Type the code underneath it instead.");
        setMode("code");
      }
    })();

    return () => {
      stop.current = true;
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
    };
  }, [open, mode, follow]);

  useEffect(() => {
    if (!open) {
      setError(null);
      setCode("");
      setMode("camera");
    }
  }, [open]);

  const submitCode = () => {
    if (!follow(code)) {
      setError("That doesn't look like a code. It's ten characters.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink-900/70" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-label={restaurantName ? `Scan at ${restaurantName}` : "Scan a code"}
            initial={reduceMotion ? false : { y: "6%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: "5%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 330, damping: 32 }}
            className="relative w-full overflow-hidden rounded-t-3xl bg-white dark:bg-ink-900 sm:max-w-md sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3 p-5 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-ink-900 text-white dark:bg-white dark:text-ink-900">
                  <QrCode size={18} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
                    Scan for points
                  </h3>
                  <p className="text-xs text-ink-500">
                    +{SCAN_POINTS}, or {SCAN_POINTS + FIRST_SCAN_BONUS} your first
                    time here
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-600 active:scale-90 dark:bg-ink-800 dark:text-ink-200"
              >
                <X size={18} />
              </button>
            </div>

            {mode === "camera" ? (
              <div className="px-5 pb-4">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-ink-900">
                  <video
                    ref={video}
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                  {/* Framing guide */}
                  <span className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/70" />
                </div>
                <p className="mt-3 text-center text-sm text-ink-500">
                  Point it at the code on your table.
                </p>
                {restaurantId && (
                  <button
                    onClick={() => setMode("code")}
                    className="mt-3 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full border border-ink-200 text-sm font-semibold dark:border-ink-700"
                  >
                    <Keyboard size={16} /> Type the code instead
                  </button>
                )}
              </div>
            ) : (
              <div className="px-5 pb-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
                    Code printed under the QR
                  </span>
                  <input
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && submitCode()}
                    placeholder="a1b2c3d4e5"
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full rounded-2xl border border-ink-200 bg-transparent px-4 py-3 font-mono tracking-[0.2em] outline-none focus:border-root-400 dark:border-ink-700"
                  />
                </label>

                {error && (
                  <p className="mt-2 text-sm text-root-600 dark:text-root-300">{error}</p>
                )}

                <button
                  onClick={submitCode}
                  disabled={!code.trim()}
                  className="mt-3 min-h-[48px] w-full rounded-full bg-root-500 font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
                >
                  Check in
                </button>

                {(
                  <button
                    onClick={() => {
                      setError(null);
                      setMode("camera");
                    }}
                    className={cx(
                      "mt-3 flex min-h-[46px] w-full items-center justify-center gap-2",
                      "rounded-full border border-ink-200 text-sm font-semibold dark:border-ink-700"
                    )}
                  >
                    <Camera size={16} /> Use the camera
                  </button>
                )}

                <p className="mt-3 flex items-start gap-2 text-xs text-ink-400">
                  <Info size={13} className="mt-0.5 shrink-0" />
                  Your phone&apos;s own camera app works too — it opens the same
                  link.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 border-t border-ink-100 px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 text-xs text-ink-500 dark:border-ink-800 sm:pb-3">
              <Trophy size={14} className="shrink-0 text-saffron-500" />
              {restaurantName
                ? `Points are held in ${restaurantName}'s name, once a day.`
                : "Points are held in each restaurant's name, once a day."}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
