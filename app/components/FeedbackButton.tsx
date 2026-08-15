"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Check, Loader2, MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  FEEDBACK_KINDS,
  FEEDBACK_MAX,
  submitFeedback,
  type FeedbackKind,
} from "@/app/lib/feedback";
import { cx } from "@/app/lib/utils";
import { Modal } from "./ui/Modal";
import { Input, Label, Textarea } from "./ui/Field";
import { Button } from "./ui/Button";

/**
 * The feedback entry point in the navbar.
 *
 * No sign-in gate on purpose — see `app/lib/feedback.ts`. The panel asks for
 * the least it can get away with: what kind of note it is, the note itself, and
 * an email only if the sender wants an answer. The page it was sent from is
 * recorded automatically, since "the menu is wrong" is unactionable without it.
 */
export function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        title="Send feedback"
        className="clay-sm clay-press grid h-10 w-10 place-items-center rounded-full text-ink-600 dark:text-ink-200"
      >
        <MessageSquarePlus size={19} strokeWidth={1.9} />
      </button>

      <FeedbackPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function FeedbackPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [kind, setKind] = useState<FeedbackKind>("idea");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    onClose();
    // Reset after the exit animation, so the panel doesn't visibly empty out
    // while it is still on screen.
    setTimeout(() => {
      setSent(false);
      setMessage("");
      setEmail("");
      setKind("idea");
      setError(null);
    }, 250);
  };

  const send = async () => {
    const text = message.trim();
    if (!text) return;
    setBusy(true);
    setError(null);
    try {
      await submitFeedback({
        kind,
        message: text,
        email: email.trim() || user?.email || undefined,
        page: pathname,
        userId: user?.uid,
        userName: user?.displayName ?? undefined,
      });
      setSent(true);
    } catch {
      setError("That didn't send. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title={sent ? undefined : "Tell us what you think"}>
      {sent ? (
        <div className="py-4 text-center">
          <span className="clay-root mx-auto grid h-14 w-14 place-items-center rounded-2xl">
            <Check size={26} />
          </span>
          <h3 className="mt-4 font-display text-xl font-extrabold text-ink-900 dark:text-white">
            Thank you
          </h3>
          <p className="mt-1.5 text-sm text-ink-500">
            It goes straight to the people who run Rahameeru.
          </p>
          <Button onClick={close} className="mt-5">
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="-mt-2 text-sm text-ink-500">
            No account needed. Tell us what is missing, wrong or good.
          </p>

          <div>
            <Label>What kind of note is this?</Label>
            <div className="flex flex-wrap gap-1.5">
              {FEEDBACK_KINDS.map((k) => (
                <button
                  key={k.key}
                  onClick={() => setKind(k.key)}
                  className={cx(
                    "min-h-[38px] rounded-full px-3.5 text-xs font-semibold transition",
                    kind === k.key
                      ? "clay-root"
                      : "clay-sm clay-press text-ink-600 dark:text-ink-300"
                  )}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Your feedback</Label>
            <Textarea
              value={message}
              maxLength={FEEDBACK_MAX}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="The opening hours for Sea House are out of date…"
              autoFocus
            />
          </div>

          {!user && (
            <div>
              <Label>Email, if you want a reply</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          )}

          {error && <p className="text-sm font-medium text-root-600">{error}</p>}

          <div className="flex items-center gap-3">
            <Button onClick={send} disabled={busy || !message.trim()}>
              {busy && <Loader2 size={15} className="animate-spin" />}
              Send feedback
            </Button>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
