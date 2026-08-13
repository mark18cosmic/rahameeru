import { NextResponse } from "next/server";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { OWNER_EMAIL } from "@/app/lib/admin";

/**
 * Every account, for the admin console's user table.
 *
 * This has to run on a server. The client SDK cannot enumerate Firebase Auth —
 * that is a deliberate restriction, not an oversight — so the console's own
 * list is assembled from `users/{uid}` documents and misses anyone who has
 * signed in but generated no app state. Only the Admin SDK sees the real list.
 *
 * Needs a service account in the environment:
 *
 *   FIREBASE_SERVICE_ACCOUNT='{"project_id":"…","client_email":"…","private_key":"…"}'
 *
 * Download it from Firebase Console → Project settings → Service accounts →
 * Generate new private key, then paste the whole JSON in as one line. Without
 * it this route answers 501 and the console quietly falls back to the
 * Firestore-derived list rather than breaking.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function adminApp() {
  if (getApps().length) return getApp();
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  const parsed = JSON.parse(raw) as {
    project_id: string;
    client_email: string;
    private_key: string;
  };
  return initializeApp({
    credential: cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      // Newlines survive an .env round-trip as the two characters \ and n.
      privateKey: parsed.private_key.replace(/\\n/g, "\n"),
    }),
  });
}

/** Admin emails, matching `adminEmails()` on the client. */
function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  const allowed = new Set(
    [
      OWNER_EMAIL,
      ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(","),
    ]
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
  return allowed.has(email.toLowerCase());
}

export async function GET(req: Request) {
  const app = adminApp();
  if (!app) {
    return NextResponse.json(
      { error: "not-configured", detail: "FIREBASE_SERVICE_ACCOUNT is not set." },
      { status: 501 }
    );
  }

  // The caller proves who they are with their ID token; the route never trusts
  // a header or a query parameter saying "I am an admin".
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "no-token" }, { status: 401 });
  }

  let email: string | undefined;
  try {
    const decoded = await getAuth(app).verifyIdToken(token);
    email = decoded.email;
  } catch {
    return NextResponse.json({ error: "bad-token" }, { status: 401 });
  }

  if (!isAdminEmail(email)) {
    return NextResponse.json({ error: "not-admin" }, { status: 403 });
  }

  const users: {
    uid: string;
    email?: string;
    name?: string;
    disabled: boolean;
    createdAt?: string;
    lastSignInAt?: string;
    providers: string[];
  }[] = [];

  // listUsers pages at 1000; keep going until Firebase stops handing out a
  // page token, so a project with more than one page isn't silently truncated.
  let pageToken: string | undefined;
  do {
    const page = await getAuth(app).listUsers(1000, pageToken);
    for (const u of page.users) {
      users.push({
        uid: u.uid,
        email: u.email,
        name: u.displayName,
        disabled: u.disabled,
        createdAt: u.metadata.creationTime,
        lastSignInAt: u.metadata.lastSignInTime,
        providers: u.providerData.map((p) => p.providerId),
      });
    }
    pageToken = page.pageToken;
  } while (pageToken);

  return NextResponse.json({ users });
}
