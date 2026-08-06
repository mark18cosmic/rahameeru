# Setting it up

Everything you need to take this from a checkout to something running, in the
order you'd actually do it. Written 2026-08-06.

---

## 1. Run it locally, no accounts needed

```bash
npm install
npm run dev:stack     # app + Firebase emulator, in Docker
npm run seed          # loads the sample restaurants
```

- App: http://localhost:3200
- Emulator UI: http://localhost:4000 (inspect accounts and documents here)

Sign-ups on the local stack land in the Auth emulator, so you can create as many
test accounts as you like and delete them from the UI. Google sign-in still goes
to the real Google popup, so use email and password locally.

Plain `npm run dev` runs against whatever project `.env.local` points at, with
no emulator.

---

## 2. Firebase, for real

1. Create a project at console.firebase.google.com.
2. **Authentication → Sign-in method**: enable Email/Password and Google.
3. **Firestore Database**: create in production mode, region `asia-south1`
   (Mumbai) — closest to Malé.
4. **Project settings → Your apps → Web**: copy the config values into
   `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=…
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=…
NEXT_PUBLIC_FIREBASE_PROJECT_ID=…
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=…
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…
NEXT_PUBLIC_FIREBASE_APP_ID=…
NEXT_PUBLIC_ADMIN_EMAILS=you@example.com
```

These are `NEXT_PUBLIC_`, so they compile into the browser bundle. That is
normal for Firebase — the security model is rules, not secrecy — but it does
mean **you must rebuild after changing any of them**, and each environment needs
its own build.

### Security rules — do this before anyone else can reach the site

`firestore.rules` in this repo is the wide-open emulator version. Deploying it
as is would let anyone edit any restaurant, approve their own vendor claim, and
rewrite other people's points. Replace it with something like:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn()  { return request.auth != null; }
    function isAdmin()     { return isSignedIn() && request.auth.token.admin == true; }
    function owns(rid)     { return isSignedIn()
                              && get(/databases/$(database)/documents/restaurants/$(rid)).data.ownerId == request.auth.uid; }

    match /restaurants/{id} {
      allow read: if true;
      // An owner may correct their own listing; only an admin may change
      // ownership, ratings or review counts.
      allow update: if isAdmin() || (owns(id)
        && !request.resource.data.diff(resource.data)
              .affectedKeys().hasAny(['ownerId','rating','reviewCount','id','slug']));
      allow create, delete: if isAdmin();
    }

    match /reviews/{id} {
      allow read: if true;
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      // The author edits the review; the venue may only add a reply.
      allow update: if (isSignedIn() && resource.data.userId == request.auth.uid)
                    || (owns(resource.data.restaurantId)
                        && request.resource.data.diff(resource.data)
                             .affectedKeys().hasOnly(['reply']));
      allow delete: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid);
    }

    match /users/{uid} {
      allow read, write: if isSignedIn() && request.auth.uid == uid;
    }

    match /vendors/{uid} {
      allow read: if isAdmin() || (isSignedIn() && request.auth.uid == uid);
      // Apply for yourself, but never approve yourself.
      allow create: if isSignedIn() && request.auth.uid == uid
                    && request.resource.data.status == 'pending';
      allow update: if isAdmin()
                    || (isSignedIn() && request.auth.uid == uid
                        && !request.resource.data.diff(resource.data)
                              .affectedKeys().hasAny(['status','restaurantIds']));
    }

    match /metrics/{id} { allow read: if true; allow write: if isSignedIn() || true; }
    match /photos/{key} { allow read: if true; allow write: if true; }
  }
}
```

Deploy with `firebase deploy --only firestore:rules`.

Two things to note. `NEXT_PUBLIC_ADMIN_EMAILS` only controls what the UI offers
— the rules above use a custom claim, which is the real guard. Set it once per
admin with the Admin SDK:

```js
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

And `metrics`/`photos` are deliberately permissive because they are counters and
a cache with nothing private in them; tighten with App Check when you're ready.

---

## 3. Getting your restaurants in

The app merges Firestore with a bundled seed set, so it always renders
something. To load your own data:

```bash
FIREBASE_EMULATOR_HOST=""  npm run seed   # against the real project, careful
```

Better: adapt `scripts/seed-emulator.ts` into a one-off import that reads a CSV
and writes `restaurants/{id}` documents. The shape it needs is in
`app/lib/types.ts` — only `name`, `slug`, `cuisine`, `priceLevel`, `location`
and `description` are really required; photos resolve by name if you leave
`image` empty.

---

## 4. Deploying

**Vercel** is the least work: import the repo, paste the same `NEXT_PUBLIC_*`
values into the project's environment variables, deploy. `/api/photo` and
`/api/route` need outbound HTTPS, which Vercel allows.

**Docker** if you'd rather self-host:

```bash
docker compose up --build     # reads .env, serves on :3000
```

The image is a multi-stage build on Next's standalone output and runs as a
non-root user. Remember the rebuild rule for env changes.

---

## 5. Optional: your own routing server

Directions work out of the box against the public OSRM demo server, which is
free but explicitly not for production and makes no uptime promise. To run your
own, which stays free forever and has no terms attached:

```bash
mkdir -p osrm && cd osrm
curl -O https://download.geofabrik.de/asia/maldives-latest.osm.pbf   # ~3.5 MB
docker run -t -v "$PWD:/data" osrm/osrm-backend osrm-extract -p /opt/foot.lua /data/maldives-latest.osm.pbf
docker run -t -v "$PWD:/data" osrm/osrm-backend osrm-partition /data/maldives-latest.osrm
docker run -t -v "$PWD:/data" osrm/osrm-backend osrm-customize /data/maldives-latest.osrm
docker run -d -p 5000:5000 -v "$PWD:/data" osrm/osrm-backend \
  osrm-routed --algorithm mld /data/maldives-latest.osrm
```

Then set `OSRM_URL=http://localhost:5000` (or the service name in compose) and
`/api/route` will prefer it, falling back to the public server and finally to a
straight-line estimate. Note the profile: `foot.lua` gives walking routes,
`car.lua` driving — run a second instance on another port if you want both to be
self-hosted.

---

## 6. Vendor plans and billing

Plans are **not connected to a payment processor**. Choosing one writes
`plan` on the vendor document and nothing else happens; every screen that shows
a plan says so. To make them real:

1. Stripe account, one Price per paid tier (MVR isn't supported by Stripe — bill
   in USD, or use a local processor such as BML's gateway).
2. A `/api/checkout` route that creates a Checkout Session with the vendor's
   uid in `client_reference_id`.
3. A `/api/webhook` route that verifies the signature and writes
   `plan`, `subscriptionId` and `currentPeriodEnd` onto `vendors/{uid}`.
4. Gate the paid features on `currentPeriodEnd > now` rather than on `plan`
   alone, so a lapsed subscription degrades instead of staying open.

Until step 3 exists, do not change the copy that says nothing is charged.

---

## 7. Admin day-to-day

- `/admin` — vendor claims. Approve, reject with a note, or suspend. Approving
  is also what links the listing to the account.
- Check `about` on each claim: a business registration number or an Instagram
  you can match against the venue is usually enough. A claim on a listing is a
  claim on other people's reviews, so it's worth the two minutes.
- Rejections show your note back to the applicant, so write it for them.

---

## 8. Before launch

- [ ] Firestore rules deployed and tested with the rules simulator
- [ ] Admin custom claims set for your account
- [ ] `NEXT_PUBLIC_ADMIN_EMAILS` matches those accounts
- [ ] Real restaurant data imported
- [ ] Auth domain allow-list updated in Firebase (production hostname)
- [ ] Google sign-in tested on the production domain
- [ ] `metadataBase` in `app/layout.tsx` pointed at the real hostname
- [ ] A backup: Firestore export scheduled from the Firebase console
