/**
 * Creates the owner/admin account.
 *
 * Runs against whichever project the NEXT_PUBLIC_FIREBASE_* variables point at,
 * using the ordinary web SDK — so it needs no service account and no
 * `firebase login`, just the same config the app itself ships with.
 *
 *   npx tsx scripts/create-admin.ts              # uses OWNER_EMAIL
 *   npx tsx scripts/create-admin.ts me@other.mv  # or an address you pass
 *
 * The password is asked for interactively, confirmed, and never written to
 * disk, argv or the shell history. If the account already exists the script
 * signs in with the password you gave instead of failing, and then makes sure
 * the admin document is in place — so it is safe to re-run.
 *
 * Note this only creates the *account*. Being an admin is decided by
 * `adminEmails()` in app/lib/useVendor.ts, which always includes OWNER_EMAIL.
 * To admin a different address, add it to NEXT_PUBLIC_ADMIN_EMAILS as well.
 */

import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { OWNER_EMAIL, ADMIN_CAPABILITIES } from "../app/lib/admin";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Reads a line without echoing it, so a shoulder or a screen share sees nothing. */
function askHidden(prompt: string): Promise<string> {
  let muted = false;
  const mutable = new Writable({
    write(chunk, _enc, cb) {
      if (!muted) process.stdout.write(chunk);
      cb();
    },
  });
  const rl = createInterface({
    input: process.stdin,
    output: mutable,
    terminal: true,
  });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const email = (process.argv[2] ?? OWNER_EMAIL).trim().toLowerCase();

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error(
      "✗ No Firebase config found.\n" +
        "  Set NEXT_PUBLIC_FIREBASE_API_KEY, _PROJECT_ID and friends first —\n" +
        "  put them in .env.local, or prefix them on this command."
    );
    process.exit(1);
  }

  console.log(`\nProject : ${firebaseConfig.projectId}`);
  console.log(`Account : ${email}\n`);

  const password = await askHidden("Choose a password (min 6 characters): ");
  if (password.length < 6) {
    console.error("✗ Firebase requires at least 6 characters.");
    process.exit(1);
  }
  const again = await askHidden("Confirm password: ");
  if (password !== again) {
    console.error("✗ Those didn't match. Nothing was created.");
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  let uid: string;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    uid = cred.user.uid;
    await updateProfile(cred.user, { displayName: "Rahameeru Admin" });
    console.log("✓ Account created.");
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code !== "auth/email-already-in-use") throw err;
    // Already provisioned — sign in so the document write is authenticated.
    const cred = await signInWithEmailAndPassword(auth, email, password);
    uid = cred.user.uid;
    console.log("✓ Account already existed; signed in with that password.");
  }

  await setDoc(
    doc(db, "users", uid),
    {
      email,
      role: "admin",
      capabilities: ADMIN_CAPABILITIES,
      unlimitedRewards: true,
      createdAt: Date.now(),
    },
    { merge: true }
  );

  console.log("✓ Admin document written to users/" + uid);
  console.log("\nSign in at /login, then open /admin.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n✗ Failed:", err?.message ?? err);
  process.exit(1);
});
