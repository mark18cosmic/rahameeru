import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import type { MenuSection, Restaurant } from "./types";
import { refreshRestaurants } from "./restaurants";
import { slugify } from "./utils";

/**
 * The owner account.
 *
 * Named here rather than only in the environment so the console still works on
 * a deploy where the env var was never set — an admin locked out of their own
 * app has no way back in. `NEXT_PUBLIC_ADMIN_EMAILS` still adds further admins
 * on top of this one.
 *
 * This is an identity, not a credential: knowing the address grants nothing.
 * The account is created by `scripts/create-admin.ts`, which asks for the
 * password interactively and never stores it. Firestore rules are the real
 * enforcement — everything in this module only decides what the UI offers.
 */
export const OWNER_EMAIL = "kaish018@gmail.com";

/** Everything an admin is allowed to do that a vendor is not. */
export type AdminCapability =
  | "restaurants:write"
  | "restaurants:delete"
  | "menus:write"
  | "photos:write"
  | "users:write"
  | "vendors:decide"
  | "settings:write"
  | "rewards:unlimited";

export const ADMIN_CAPABILITIES: AdminCapability[] = [
  "restaurants:write",
  "restaurants:delete",
  "menus:write",
  "photos:write",
  "users:write",
  "vendors:decide",
  "settings:write",
  "rewards:unlimited",
];

/* -------------------------------------------------------------------------- */
/* Site settings                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Controls what the home page shows. Stored in one document so a change is a
 * single write and every client can subscribe to it.
 */
export type SiteSettings = {
  /** Rails rendered on the home page, in order. Keys match HomeContent. */
  rails: string[];
  /** Restaurant ids pinned to the top of the first rail. */
  pinned: string[];
  /** Hidden from every listing without deleting the record. */
  hidden: string[];
  showWheel: boolean;
  showCategories: boolean;
  showReviewInvite: boolean;
  /** Banner across the top of the home page. Empty string hides it. */
  announcement: string;
  updatedAt?: number;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  rails: ["featured", "openNow", "dateSpots", "cafes", "fastFood", "recent"],
  pinned: [],
  hidden: [],
  showWheel: true,
  showCategories: true,
  showReviewInvite: true,
  announcement: "",
};

const SETTINGS_DOC = ["config", "site"] as const;

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, ...SETTINGS_DOC));
    if (!snap.exists()) return DEFAULT_SETTINGS;
    // Spread over the defaults so a document written before a new field was
    // added doesn't leave that field undefined.
    return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<SiteSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Live settings. Returns an unsubscribe function. */
export function watchSiteSettings(
  onChange: (s: SiteSettings) => void
): () => void {
  try {
    return onSnapshot(
      doc(db, ...SETTINGS_DOC),
      (snap) =>
        onChange(
          snap.exists()
            ? { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<SiteSettings>) }
            : DEFAULT_SETTINGS
        ),
      () => onChange(DEFAULT_SETTINGS)
    );
  } catch {
    onChange(DEFAULT_SETTINGS);
    return () => {};
  }
}

export async function saveSiteSettings(
  patch: Partial<SiteSettings>
): Promise<void> {
  await setDoc(
    doc(db, ...SETTINGS_DOC),
    { ...patch, updatedAt: Date.now() },
    { merge: true }
  );
}

/* -------------------------------------------------------------------------- */
/* Restaurants                                                                */
/* -------------------------------------------------------------------------- */

/** The fields an admin may write. Ratings are excluded on purpose: they are
    earned by reviews, not set by whoever runs the site. */
export type RestaurantDraft = {
  name: string;
  slug?: string;
  description: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  cuisine: string[];
  tags: string[];
  priceLevel: number;
  image?: string;
  gallery?: string[];
  menu?: MenuSection[];
  featured?: boolean;
};

/**
 * Creates or updates a listing. An explicit id updates in place; without one a
 * slug-derived id is used, which keeps the document readable in the console and
 * makes an accidental double-create idempotent rather than a duplicate.
 */
export async function saveRestaurant(
  draft: RestaurantDraft,
  id?: string
): Promise<string> {
  const slug = draft.slug?.trim() || slugify(draft.name);
  const docId = id ?? slug;
  await setDoc(
    doc(db, "restaurants", docId),
    {
      ...draft,
      slug,
      updatedAt: Date.now(),
      ...(id ? {} : { createdAt: Date.now() }),
    },
    { merge: true }
  );
  refreshRestaurants();
  return docId;
}

export async function deleteRestaurant(id: string): Promise<void> {
  await deleteDoc(doc(db, "restaurants", id));
  refreshRestaurants();
}

/** Replaces the whole menu for a listing. */
export async function saveMenu(id: string, menu: MenuSection[]): Promise<void> {
  await setDoc(
    doc(db, "restaurants", id),
    { menu, updatedAt: Date.now() },
    { merge: true }
  );
  refreshRestaurants();
}

/**
 * Sets the photos for a listing. `image` is the card and hero shot; `gallery`
 * is everything else. Passing an empty gallery clears it, which is how a
 * listing is handed back to the automatic photo lookup.
 */
export async function savePhotos(
  id: string,
  image: string | undefined,
  gallery: string[]
): Promise<void> {
  await setDoc(
    doc(db, "restaurants", id),
    { image: image ?? "", gallery, updatedAt: Date.now() },
    { merge: true }
  );
  refreshRestaurants();
}

export async function setHidden(
  settings: SiteSettings,
  id: string,
  hidden: boolean
): Promise<void> {
  const next = hidden
    ? Array.from(new Set([...settings.hidden, id]))
    : settings.hidden.filter((x) => x !== id);
  await saveSiteSettings({ hidden: next });
}

export async function setFeatured(id: string, featured: boolean): Promise<void> {
  await setDoc(
    doc(db, "restaurants", id),
    { featured, updatedAt: Date.now() },
    { merge: true }
  );
  refreshRestaurants();
}

/* -------------------------------------------------------------------------- */
/* User accounts                                                              */
/* -------------------------------------------------------------------------- */

/**
 * A row in the admin's user table.
 *
 * Assembled from the `users/{uid}` documents the app already writes for
 * favourites, diet flags and points. The client SDK cannot enumerate Firebase
 * Auth — that needs the Admin SDK on a server — so anyone who has signed in but
 * never generated app state will not appear here. That is a real limitation of
 * doing this from the browser, and the console says so rather than implying the
 * list is every account.
 */
export type ManagedUser = {
  uid: string;
  email?: string;
  name?: string;
  points: number;
  suspended?: boolean;
  role?: "user" | "vendor" | "admin";
  note?: string;
};

export async function listUsers(): Promise<ManagedUser[]> {
  try {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => {
      const data = d.data() as Record<string, any>;
      return {
        uid: d.id,
        email: data.email,
        name: data.name ?? data.displayName,
        points: Number(data.points?.total ?? 0) || 0,
        suspended: Boolean(data.suspended),
        role: data.role ?? "user",
        note: data.note,
      };
    });
  } catch {
    return [];
  }
}

export async function updateUser(
  uid: string,
  patch: Partial<Omit<ManagedUser, "uid">>
): Promise<void> {
  await setDoc(doc(db, "users", uid), patch, { merge: true });
}

/** Sets a user's points balance outright, for corrections and grants. */
export async function setUserPoints(uid: string, total: number): Promise<void> {
  const snap = await getDoc(doc(db, "users", uid));
  const existing = (snap.data()?.points ?? {}) as Record<string, unknown>;
  await setDoc(
    doc(db, "users", uid),
    { points: { ...existing, total: Math.max(0, Math.round(total)) } },
    { merge: true }
  );
}
