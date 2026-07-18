import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
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
