"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Share, Plus, Download } from "lucide-react";
import icon from "@/public/android-chrome-192x192.png";

const DISMISS_KEY = "install-prompt-dismissed-until";
/** Snoozing hides the prompt for this long rather than forever. */
const SNOOZE_DAYS = 14;
/** Give people a moment to look around before interrupting them. */
const DELAY_MS = 8000;

/** Chrome's install event — not in the DOM lib, so declared here. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari reports installed state on navigator, not via matchMedia.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS 13+ reports as a Mac; the touch points give it away.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function snoozed(): boolean {
  try {
    const until = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    return Date.now() < until;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (isStandalone() || snoozed()) return;

    const onBeforeInstall = (e: Event) => {
      // Suppress Chrome's own mini-infobar so ours is the only prompt shown.
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => setVisible(false);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari never fires beforeinstallprompt, so show the manual
    // Share-sheet instructions there instead — on a delay, so it doesn't
    // interrupt the first paint.
    let timer: number | undefined;
    if (isIos()) {
      timer = window.setTimeout(() => {
        setIos(true);
        setVisible(true);
      }, DELAY_MS);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(
        DISMISS_KEY,
        String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000)
      );
    } catch {
      /* storage blocked — the prompt simply returns next visit */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    // The event can only be used once, whatever the outcome.
    setDeferred(null);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Install Rahameeru"
          initial={reduceMotion ? { opacity: 0 } : { y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 z-[60] px-3 pb-[env(safe-area-inset-bottom)] bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-4 md:left-auto md:right-4 md:w-[380px] md:px-0"
        >
          <div className="relative overflow-hidden rounded-3xl border border-ink-100 bg-white p-4 shadow-card dark:border-ink-800 dark:bg-ink-900">
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3 pr-8">
              <Image
                src={icon}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-xl"
              />
              <div className="min-w-0">
                <p className="font-display font-bold text-ink-900 dark:text-white">
                  Add Rahameeru to your home screen
                </p>
                <p className="mt-0.5 text-sm text-ink-500">
                  Opens full screen and works offline for the places you&apos;ve
                  already looked at.
                </p>
              </div>
            </div>

            {ios ? (
              <ol className="mt-4 space-y-2 rounded-2xl bg-ink-50 p-3 text-sm text-ink-700 dark:bg-ink-800 dark:text-ink-200">
                <li className="flex items-center gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-ink-700 dark:bg-ink-900 dark:text-ink-200">
                    1
                  </span>
                  Tap
                  <Share size={16} className="text-root-500" />
                  in the Safari toolbar
                </li>
                <li className="flex items-center gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-ink-700 dark:bg-ink-900 dark:text-ink-200">
                    2
                  </span>
                  Choose
                  <Plus size={16} className="text-root-500" />
                  Add to Home Screen
                </li>
              </ol>
            ) : (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={install}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-root-500 px-5 text-sm font-semibold text-white shadow-glow transition hover:bg-root-600 active:scale-[0.97]"
                >
                  <Download size={16} /> Install
                </button>
                <button
                  onClick={dismiss}
                  className="min-h-[44px] rounded-full px-4 text-sm font-medium text-ink-500 transition hover:bg-ink-100 dark:hover:bg-ink-800"
                >
                  Not now
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
