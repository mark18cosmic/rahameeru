import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";

/**
 * A wheel a group decides on together.
 *
 * One person starts it from their current wheel; everyone with the link can
 * veto places and anyone can spin. The spin itself is stored (the pool at that
 * moment, the winner and the final angle), so every phone animates to the
 * same slice instead of each running its own random draw.
 *
 * No account is needed to join: the link is the invitation, and its id is a
 * random Firestore id, so it can't be guessed.
 */
export type GroupWheel = {
  id: string;
  /** The places on offer, fixed when the wheel was started. */
  poolIds: string[];
  /** Participant id to the name they go by. */
  names: Record<string, string>;
  /** Participant id to the restaurant ids they've ruled out. */
  vetoes: Record<string, string[]>;
  result?: {
    /** The pool the spin was drawn from, in slice order. */
    ids: string[];
    winnerId: string;
    /** Absolute rotation in degrees, shared so every viewer lands the same. */
    rotation: number;
    at: number;
    by: string;
  };
  createdAt: number;
};

/** Upper bound on the pool, mirrored in the Firestore rules. */
export const MAX_POOL = 30;

export type Me = { id: string; name: string };

const ME_KEY = "rahameeru.wheel.me";

/**
 * Who this browser is on shared wheels. Kept in localStorage so a refresh
 * doesn't turn you into a second person with no vetoes.
 */
export function loadMe(fallbackName?: string): Me {
  try {
    const raw = localStorage.getItem(ME_KEY);
    if (raw) {
      const me = JSON.parse(raw) as Me;
      if (me.id && me.name) return me;
    }
  } catch {
    // Private mode or blocked storage: a fresh identity for this visit.
  }
  const me = {
    id: Math.random().toString(36).slice(2, 12),
    name: fallbackName || `Guest ${10 + Math.floor(Math.random() * 90)}`,
  };
  saveMe(me);
  return me;
}

export function saveMe(me: Me) {
  try {
    localStorage.setItem(ME_KEY, JSON.stringify(me));
  } catch {
    // Not fatal: the name just won't survive a reload.
  }
}

export async function createGroupWheel(poolIds: string[], me: Me): Promise<string> {
  const ref = doc(collection(db, "wheels"));
  await setDoc(ref, {
    poolIds: poolIds.slice(0, MAX_POOL),
    names: { [me.id]: me.name },
    vetoes: {},
    createdAt: Date.now(),
  });
  return ref.id;
}

export function watchGroupWheel(
  id: string,
  onChange: (wheel: GroupWheel | null) => void,
  onError: () => void
): () => void {
  return onSnapshot(
    doc(db, "wheels", id),
    (snap) => onChange(snap.exists() ? ({ id: snap.id, ...snap.data() } as GroupWheel) : null),
    onError
  );
}

export function setName(id: string, me: Me) {
  return updateDoc(doc(db, "wheels", id), { [`names.${me.id}`]: me.name.slice(0, 30) });
}

export function setVetoes(id: string, meId: string, restaurantIds: string[]) {
  return updateDoc(doc(db, "wheels", id), { [`vetoes.${meId}`]: restaurantIds });
}

export function saveSpin(id: string, result: NonNullable<GroupWheel["result"]>) {
  return updateDoc(doc(db, "wheels", id), { result });
}
