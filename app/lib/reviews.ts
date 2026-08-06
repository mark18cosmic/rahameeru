import {
  collection,
  addDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import type { Review } from "./types";

export async function addReview(
  input: Omit<Review, "id" | "createdAt">
): Promise<void> {
  await addDoc(collection(db, "reviews"), {
    ...input,
    createdAt: Date.now(),
  });
}

/**
 * The venue's answer to a review. Written by the vendor dashboard; the public
 * page only renders it. Passing an empty string removes the reply.
 */
export async function replyToReview(
  reviewId: string,
  text: string,
  by: string
): Promise<void> {
  await updateDoc(doc(db, "reviews", reviewId), {
    reply: text.trim() ? { text: text.trim(), by, at: Date.now() } : null,
  });
}

export async function getReviews(restaurantId: string): Promise<Review[]> {
  try {
    const q = query(
      collection(db, "reviews"),
      where("restaurantId", "==", restaurantId)
    );
    const snap = await getDocs(q);
    const reviews = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Review, "id">),
    })) as Review[];
    return reviews.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  } catch {
    return [];
  }
}
