import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
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

/**
 * Typed into the username field on the signup page to reach admin setup.
 *
 * This is a first-run bootstrap, not a secret. It is in the client bundle and
 * anyone can read it — what makes it safe is that it can only ever create the
 * owner account *once*: the moment that account exists, Firebase answers
 * `auth/email-already-in-use` and this path can do nothing at all. Claim the
 * account as soon as the app is deployed and the code is inert thereafter.
 */
export const ADMIN_SETUP_CODE = "admin12309";

/**
 * Creates the owner account from the browser and marks it as an admin.
 *
 * Refuses rather than overwrites when the account already exists — an existing
 * admin's password is not something a signup form should be able to change.
 * Mirrors `scripts/create-admin.ts`, which does the same job from a terminal.
 */
export async function createAdminAccount(password: string): Promise<void> {
  const cred = await createUserWithEmailAndPassword(
    auth,
    OWNER_EMAIL,
    password
  );
  await updateProfile(cred.user, { displayName: "Rahameeru Admin" });
  await setDoc(
    doc(db, "users", cred.user.uid),
    {
      email: OWNER_EMAIL,
      role: "admin",
      capabilities: ADMIN_CAPABILITIES,
      unlimitedRewards: true,
      createdAt: Date.now(),
    },
    { merge: true }
  );
}

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
  /** Slugs of deleted listings. Tombstones — see deleteRestaurant. */
  deleted: string[];
  showWheel: boolean;
  showCategories: boolean;
  showReviewInvite: boolean;
  /** Banner across the top of the home page. Empty string hides it. */
  announcement: string;
  updatedAt?: number;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  rails: [
    "featured",
    "popularDishes",
    "openNow",
    "cheapDishes",
    "dateSpots",
    "cafes",
    "fastFood",
    "recent",
  ],
  pinned: [],
  hidden: [],
  deleted: [],
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

/**
 * Deletes a listing for good.
 *
 * Removing the Firestore document is only half of it — the seed set ships in
 * the bundle, so a seeded restaurant reappears on the next read. The slug is
 * therefore tombstoned in `config/site.deleted`, which `getRestaurants` honours
 * regardless of where the listing came from. `restoreRestaurant` is the undo.
 */
export async function deleteRestaurant(
  id: string,
  slug?: string
): Promise<void> {
  await deleteDoc(doc(db, "restaurants", id)).catch(() => {
    // A seed-only listing has no document; the tombstone is what matters.
  });
  if (slug) {
    const current = await getSiteSettings();
    await saveSiteSettings({
      deleted: Array.from(new Set([...current.deleted, slug])),
    });
  }
  refreshRestaurants();
}

/** Brings a deleted listing back by clearing its tombstone. */
export async function restoreRestaurant(slug: string): Promise<void> {
  const current = await getSiteSettings();
  await saveSiteSettings({
    deleted: current.deleted.filter((s) => s !== slug),
  });
  refreshRestaurants();
}

/** Deletes several listings in one pass, tombstoning each. */
export async function deleteRestaurants(
  items: { id: string; slug: string }[]
): Promise<void> {
  for (const { id } of items) {
    await deleteDoc(doc(db, "restaurants", id)).catch(() => {});
  }
  const current = await getSiteSettings();
  await saveSiteSettings({
    deleted: Array.from(
      new Set([...current.deleted, ...items.map((i) => i.slug)])
    ),
  });
  refreshRestaurants();
}

/** Features or unfeatures several listings at once. */
export async function bulkSetFeatured(
  ids: string[],
  featured: boolean
): Promise<void> {
  for (const id of ids) {
    await setDoc(
      doc(db, "restaurants", id),
      { featured, updatedAt: Date.now() },
      { merge: true }
    );
  }
  refreshRestaurants();
}

/** Hides or shows several listings at once. */
export async function bulkSetHidden(
  ids: string[],
  hidden: boolean
): Promise<void> {
  const current = await getSiteSettings();
  const next = hidden
    ? Array.from(new Set([...current.hidden, ...ids]))
    : current.hidden.filter((x) => !ids.includes(x));
  await saveSiteSettings({ hidden: next });
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

/**
 * Every Firebase Auth account, via the server route.
 *
 * Returns null when the route isn't configured with a service account, which
 * is the signal to fall back to the Firestore-derived list rather than showing
 * an empty table.
 */
export async function listAllAuthUsers(
  idToken: string
): Promise<ManagedUser[] | null> {
  try {
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      users: {
        uid: string;
        email?: string;
        name?: string;
        disabled: boolean;
        lastSignInAt?: string;
      }[];
    };
    return data.users.map((u) => ({
      uid: u.uid,
      email: u.email,
      name: u.name,
      points: 0,
      suspended: u.disabled,
      role: "user" as const,
    }));
  } catch {
    return null;
  }
}

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
