import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";

/**
 * Vendor accounts.
 *
 * A vendor is a restaurant owner or manager with a claim on one or more
 * listings. Anyone can apply; nothing is visible or editable until an admin
 * approves the application, because a claim on a listing is a claim on someone
 * else's reputation. Status therefore starts at "pending" and only an admin
 * moves it.
 */

export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

export type PlanId = "starter" | "growth" | "pro";

export type VendorProfile = {
  uid: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  /** Free text: which places they run, licence number, anything that helps. */
  about: string;
  restaurantIds: string[];
  status: VendorStatus;
  plan: PlanId;
  /** Set by an admin when rejecting, shown back to the applicant. */
  reviewNote?: string;
  createdAt: number;
  decidedAt?: number;
};

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  cadence: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
};

/**
 * Plans are presentational for now: choosing one records the intent on the
 * vendor's profile, it does not charge anything. No payment processor is
 * connected, and the UI says so wherever a plan is picked — an app that implies
 * it has taken a payment it hasn't is worse than one that says "not yet".
 */
export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    cadence: "free",
    tagline: "Claim your listing and keep it right.",
    features: [
      "Claim one restaurant",
      "Edit hours, contact details and description",
      "Reply to reviews",
      "Basic insights: rating, reviews, visits",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 450,
    cadence: "MVR / month",
    tagline: "For places that live or die on the lunch rush.",
    features: [
      "Up to five restaurants",
      "Full menu management with photos",
      "30-day visit and search trends",
      "Promoted in one category rail",
      "Points offers for reviewers",
    ],
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 1200,
    cadence: "MVR / month",
    tagline: "Groups, chains and anyone running several kitchens.",
    features: [
      "Unlimited restaurants",
      "Team access",
      "Full analytics history and exports",
      "Homepage placement slots",
      "Priority support",
    ],
  },
];

export const PLAN_BY_ID: Record<PlanId, Plan> = Object.fromEntries(
  PLANS.map((p) => [p.id, p])
) as Record<PlanId, Plan>;

const COLLECTION = "vendors";

/** Submits an application. The document id is the account's uid. */
export async function applyAsVendor(
  uid: string,
  input: Omit<
    VendorProfile,
    "uid" | "status" | "createdAt" | "restaurantIds" | "decidedAt"
  > & { restaurantIds?: string[] }
): Promise<void> {
  await setDoc(doc(db, COLLECTION, uid), {
    ...input,
    uid,
    restaurantIds: input.restaurantIds ?? [],
    status: "pending" satisfies VendorStatus,
    createdAt: Date.now(),
    submittedAt: serverTimestamp(),
  });
}

export async function getVendor(uid: string): Promise<VendorProfile | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, uid));
    return snap.exists() ? (snap.data() as VendorProfile) : null;
  } catch {
    return null;
  }
}

/** Admin view: every application, newest first. */
export async function listVendors(): Promise<VendorProfile[]> {
  try {
    const snap = await getDocs(
      query(collection(db, COLLECTION), orderBy("createdAt", "desc"))
    );
    return snap.docs.map((d) => d.data() as VendorProfile);
  } catch {
    return [];
  }
}

export async function setVendorStatus(
  uid: string,
  status: VendorStatus,
  reviewNote?: string
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), {
    status,
    reviewNote: reviewNote ?? "",
    decidedAt: Date.now(),
  });
}

export async function setVendorPlan(uid: string, plan: PlanId): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), { plan, planChosenAt: Date.now() });
}

/** Links a listing to a vendor. Both sides are written so either can be read. */
export async function claimRestaurant(
  uid: string,
  restaurantId: string,
  current: string[]
): Promise<void> {
  if (current.includes(restaurantId)) return;
  await updateDoc(doc(db, COLLECTION, uid), {
    restaurantIds: [...current, restaurantId],
  });
  await setDoc(
    doc(db, "restaurants", restaurantId),
    { ownerId: uid, claimedAt: Date.now() },
    { merge: true }
  );
}
