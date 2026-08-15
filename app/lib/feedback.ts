import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";

/**
 * Feedback from anyone using the site.
 *
 * Deliberately writable without an account: the people most worth hearing from
 * are the ones who hit something broken before they ever signed up, and a login
 * wall in front of a complaint box collects nothing. When a signed-in person
 * sends it we record who they are, so a reply is possible; otherwise the email
 * field is optional and the note stands on its own.
 */
export type FeedbackKind = "idea" | "problem" | "praise" | "listing";

export const FEEDBACK_KINDS: { key: FeedbackKind; label: string }[] = [
  { key: "idea", label: "Idea" },
  { key: "problem", label: "Something broke" },
  { key: "listing", label: "Wrong listing" },
  { key: "praise", label: "Praise" },
];

export type Feedback = {
  id: string;
  kind: FeedbackKind;
  message: string;
  /** Optional, so someone can be written back to. */
  email?: string;
  /** Path the note was sent from — where the problem actually was. */
  page?: string;
  userId?: string;
  userName?: string;
  createdAt: number;
  /** Ticked off in the admin console once it has been dealt with. */
  handled?: boolean;
};

export type FeedbackDraft = Omit<Feedback, "id" | "createdAt" | "handled">;

/** The longest note accepted, matched by the Firestore rules. */
export const FEEDBACK_MAX = 2000;

export async function submitFeedback(draft: FeedbackDraft): Promise<void> {
  // Firestore rejects undefined, and most of these fields are optional — an
  // anonymous note carries nothing but a kind and a message.
  const clean = Object.fromEntries(
    Object.entries(draft).filter(([, v]) => v !== undefined && v !== "")
  );
  await addDoc(collection(db, "feedback"), {
    ...clean,
    message: draft.message.slice(0, FEEDBACK_MAX),
    handled: false,
    createdAt: Date.now(),
  });
}

/** Live feedback, newest first. Returns an unsubscribe function. */
export function watchFeedback(
  onChange: (items: Feedback[]) => void,
  onError?: (e: unknown) => void
): () => void {
  try {
    return onSnapshot(
      query(collection(db, "feedback"), orderBy("createdAt", "desc"), limit(300)),
      (snap) =>
        onChange(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Feedback, "id">) }))
        ),
      (e) => onError?.(e)
    );
  } catch (e) {
    onError?.(e);
    return () => {};
  }
}

export async function setFeedbackHandled(
  id: string,
  handled: boolean
): Promise<void> {
  await updateDoc(doc(db, "feedback", id), { handled });
}

export async function deleteFeedback(id: string): Promise<void> {
  await deleteDoc(doc(db, "feedback", id));
}
