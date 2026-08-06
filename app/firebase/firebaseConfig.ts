import { getApps, getApp, initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Reuse the app across hot reloads / server & client to avoid duplicate init.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
/** Review photos live here. */
export const storage = getStorage(app);

/**
 * Point the SDK at the local Emulator Suite when one is configured.
 *
 * The browser and the server reach the same emulator by different names: from
 * the page it is whatever the host publishes (localhost), from inside the
 * compose network it is the service name. So the public variable drives the
 * client and the private one — read only on the server — drives SSR.
 */
const emulatorHost =
  typeof window === "undefined"
    ? process.env.FIREBASE_EMULATOR_HOST ??
      process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST
    : process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST;

if (emulatorHost) {
  try {
    connectFirestoreEmulator(db, emulatorHost, 8080);
    connectAuthEmulator(auth, `http://${emulatorHost}:9099`, {
      disableWarnings: true,
    });
    connectStorageEmulator(storage, emulatorHost, 9199);
  } catch {
    // Already connected on a previous module evaluation (hot reload) — the SDK
    // throws rather than no-opping, and a second call has nothing to do anyway.
  }
}

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export default app;
