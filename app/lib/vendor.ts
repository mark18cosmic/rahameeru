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
  where,
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
  /** Signs the daily table code. Generated on first use, never shown raw. */
  scanSecret?: string;
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
  /**
   * What the tier deliberately does not include. Shown as struck-through lines
   * on the free plan: someone choosing a plan deserves to see the ceiling
   * before they pick, not after.
   */
  limits?: string[];
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
    name: "Basic",
    price: 0,
    cadence: "free",
    tagline: "Enough to stop the wrong details spreading.",
    features: [
      "One restaurant",
      "Correct your hours, phone and address",
      "Read your reviews",
      "Visit count for the last 7 days",
    ],
    limits: [
      "No replying to reviews",
      "No menu management",
      "No photo uploads",
      "Not eligible for category or homepage placement",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 450,
    cadence: "MVR / month",
    tagline: "For a place that lives or dies on the lunch rush.",
    features: [
      "Up to five restaurants",
      "Reply publicly to every review",
      "Full menu management with dish photos",
      "Upload your own gallery, no more search results",
      "90 days of visit, search and rating trends",
      "See which dishes people open most",
      "Promoted in one category rail",
      "Issue bonus points to reviewers",
      "Post an offer of the week",
      "Email alert whenever a review lands",
    ],
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 1200,
    cadence: "MVR / month",
    tagline: "Groups, chains, and anyone running several kitchens.",
    features: [
      "Everything in Growth",
      "Unlimited restaurants",
      "Team accounts with roles",
      "Homepage placement slots",
      "Full analytics history, CSV export",
      "Compare your listings side by side",
      "Benchmarks against your cuisine and island",
      "Menu scheduling for seasons and Ramadan hours",
      "Priority support with a named contact",
      "Early access to new vendor features",
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

/**
 * The vendor record for an account.
 *
 * Falls back to an email match because an admin can create a vendor before
 * that person has ever signed in — there is no uid to key it by at that point.
 * Once they do sign in, the email lookup finds the record and adopts it onto
 * their uid, so the next read is the fast path again.
 */
export async function getVendor(
  uid: string,
  email?: string | null
): Promise<VendorProfile | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, uid));
    if (snap.exists()) return snap.data() as VendorProfile;

    if (!email) return null;
    const matches = await getDocs(
      query(collection(db, COLLECTION), where("email", "==", email.toLowerCase()))
    );
    const found = matches.docs[0];
    if (!found) return null;

    const profile = { ...(found.data() as VendorProfile), uid };
    // Re-key onto the uid so this costs one read next time, not two.
    await setDoc(doc(db, COLLECTION, uid), profile);
    return profile;
  } catch {
    return null;
  }
}

/**
 * Creates a vendor directly, already approved.
 *
 * For the case where an admin has spoken to a restaurant and is setting them
 * up, rather than waiting for an application to review. Keyed by email until
 * the person signs in — see getVendor.
 */
export async function createVendorAsAdmin(input: {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  about?: string;
  restaurantIds?: string[];
}): Promise<string> {
  const email = input.email.trim().toLowerCase();
  const id = `email_${email.replace(/[^a-z0-9]+/g, "_")}`;
  await setDoc(
    doc(db, COLLECTION, id),
    {
      ...input,
      email,
      about: input.about ?? "",
      uid: id,
      restaurantIds: input.restaurantIds ?? [],
      status: "approved" satisfies VendorStatus,
      plan: "starter" satisfies PlanId,
      createdAt: Date.now(),
      decidedAt: Date.now(),
      createdByAdmin: true,
    },
    { merge: true }
  );
  return id;
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
