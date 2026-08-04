/**
 * Loads the local seed set into the Firestore emulator.
 *
 * Run against a running emulator (see docker-compose.dev.yml):
 *   npm run seed
 *
 * Uses the ordinary client SDK rather than firebase-admin: the emulator's rules
 * are open, so there is nothing to authenticate, and it keeps the dependency
 * list identical to the app's.
 */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  writeBatch,
  collection,
  getDocs,
} from "firebase/firestore";
import { seedRestaurants } from "../app/lib/data";

const host = process.env.FIREBASE_EMULATOR_HOST ?? "127.0.0.1";
const port = Number(process.env.FIREBASE_EMULATOR_FIRESTORE_PORT ?? 8080);
const projectId = process.env.FIREBASE_PROJECT_ID ?? "rahameeru-local";

const app = initializeApp({ projectId, apiKey: "emulator", appId: "emulator" });
const db = getFirestore(app);
connectFirestoreEmulator(db, host, port);

/** Firestore rejects `undefined`; the seed objects carry optional fields. */
function strip<T>(value: T): T {
  if (Array.isArray(value)) return value.map(strip) as unknown as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, strip(v)])
    ) as T;
  }
  return value;
}

async function main() {
  console.log(`Seeding ${seedRestaurants.length} restaurants → ${host}:${port}`);

  const batch = writeBatch(db);
  for (const r of seedRestaurants) {
    batch.set(doc(db, "restaurants", r.id), strip(r));
  }
  await batch.commit();

  const snap = await getDocs(collection(db, "restaurants"));
  console.log(`Done. Collection now holds ${snap.size} documents.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  console.error(
    `Is the emulator up? Try: docker compose -f docker-compose.dev.yml up -d emulator`
  );
  process.exit(1);
});
