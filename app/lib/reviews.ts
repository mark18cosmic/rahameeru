import {
  collection,
  addDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/app/firebase/firebaseConfig";
import type { Review } from "./types";

export async function addReview(
  input: Omit<Review, "id" | "createdAt">
): Promise<void> {
  // Firestore rejects undefined, and an optional field left blank is common
  // here — most people won't fill in wait time or spend.
  const clean = Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined && v !== "")
  );
  await addDoc(collection(db, "reviews"), {
    ...clean,
    createdAt: Date.now(),
  });
}

/**
 * Shrinks a photo in the browser before it goes anywhere.
 *
 * Phone cameras produce 4 MB files; a review photo is displayed at most a few
 * hundred pixels wide. Resizing here keeps uploads quick on a mobile
 * connection and storage costs sane, and strips EXIF — including the GPS tag —
 * as a side effect, which is the right default for a photo taken at a table.
 */
export async function shrinkImage(file: File, maxEdge = 1400): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not read that image."))),
      "image/jpeg",
      0.82
    );
  });
}

/** Uploads one review photo and returns its public URL. */
export async function uploadReviewPhoto(
  restaurantId: string,
  userId: string,
  file: File
): Promise<string> {
  const blob = await shrinkImage(file);
  const path = `reviews/${restaurantId}/${userId}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.jpg`;
  const handle = ref(storage, path);
  await uploadBytes(handle, blob, { contentType: "image/jpeg" });
  return getDownloadURL(handle);
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

export type DishStat = { name: string; average: number; count: number };

/**
 * Ratings per dish, gathered from every review that named what it ordered.
 *
 * Dish names are matched case-insensitively but reported with the spelling the
 * menu uses, since that is what a diner is looking at.
 */
export function dishStats(reviews: Review[]): Map<string, DishStat> {
  const acc = new Map<string, { name: string; sum: number; count: number }>();

  for (const review of reviews) {
    for (const dish of review.dishes ?? []) {
      if (typeof dish.rating !== "number") continue;
      const key = dish.name.trim().toLowerCase();
      if (!key) continue;
      const entry = acc.get(key) ?? { name: dish.name.trim(), sum: 0, count: 0 };
      entry.sum += dish.rating;
      entry.count += 1;
      acc.set(key, entry);
    }
  }

  return new Map(
    [...acc.entries()].map(([key, v]) => [
      key,
      { name: v.name, average: Math.round((v.sum / v.count) * 10) / 10, count: v.count },
    ])
  );
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
