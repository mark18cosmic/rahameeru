## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Usage](#usage)
- [Running with Docker](#running-with-docker)
- [License](#license)


## Introduction

Raha is a restaurant reviewing app designed to help users discover, review, and rate restaurants in the Maldives. The app provides a seamless experience with features such as user reviews, ratings, and a premium subscription for an ad-free experience and exclusive content.
## Features

Discover Restaurants: Search and filter restaurants based on location, cuisine, and rating.

User Reviews and Ratings: Submit and read detailed reviews with ratings for food, service, and ambiance.

Premium Subscription: Access ad-free experience and exclusive content.

Affiliate Marketing: Book tables or order food through affiliate links.

Push Notifications: Get notified about new reviews, responses, and promotions.

## Tech Stack
- Frontend: Next.js, NextUI
- Backend: Firebase (Database)
- Hosting: Vercel & Docker
- Styling: CSS, NextUI Components

## Usage

- **Home Page**: Browse featured restaurants, latest reviews, and top-rated restaurants.
- **Restaurant Listings**: Use filters and sort options to find restaurants.
- **Restaurant Detail Page**: View detailed information, reviews, and ratings.
- **User Profile**: Manage your reviews, favorites, and subscription status.
- **Review Submission**: Write and submit reviews with ratings and optional images.
- **Notifications**: Stay updated with the latest reviews and promotions.

## Running with Docker

The image is a multi-stage build on Next's `standalone` output (~330 MB, runs as
a non-root user).

Firebase's `NEXT_PUBLIC_*` values are compiled into the client bundle, so they
must be supplied **at build time** — passing them only to `docker run` leaves the
browser with an undefined API key. Put them in a local `.env` and use Compose:

```bash
docker compose up --build      # http://localhost:3000
```

Or build directly:

```bash
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=... \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=... \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=... \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=... \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=... \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=... \
  -t rahameeru .

docker run -p 3000:3000 rahameeru
```

Because those values are baked in, build a separate image per environment, and
rebuild (not just restart) whenever they change.

The container needs outbound HTTPS: `/api/photo` resolves restaurant photos by
name from an upstream image search.

## Local stack (OrbStack / Docker + Firebase emulator)

`docker-compose.dev.yml` runs the app against a local Firebase Emulator Suite
instead of the real project, so nothing touches production data:

```bash
npm run dev:stack        # builds and starts the emulator + the app
npm run seed             # loads the seed restaurants into the emulator
```

| Service     | URL                     |
| ----------- | ----------------------- |
| App         | http://localhost:3200   |
| Emulator UI | http://localhost:4000   |
| Firestore   | localhost:8080          |
| Auth        | localhost:9099          |

Accounts created on the sign-up page live in the Auth emulator and can be
inspected (and deleted) from the Emulator UI. Note that Google sign-in still
goes to the real Google popup, so use email/password locally.

The emulator connection is opt-in: the SDK only redirects when
`NEXT_PUBLIC_FIREBASE_EMULATOR_HOST` (browser) or `FIREBASE_EMULATOR_HOST`
(server) is set, both of which are supplied by the dev compose file alone.
`npm run dev` on its own still talks to whatever project `.env.local` points at.

Stop it with `npm run dev:stack:down`.

## Vendors and admin

`/vendor` is the restaurant-facing side: a landing page, a three-step claim
form at `/vendor/signup`, and `/vendor/dashboard` with reviews, visit trends and
plan selection. It has its own navigation and the diner tab bar is hidden there.

Claims land as `vendors/{uid}` documents with `status: "pending"`. Nothing is
visible to a vendor until an admin approves it at `/admin`, and approval is also
what links a listing to the account.

Admins are named by email, not by a database flag, so a compromised account
can't promote itself:

```bash
NEXT_PUBLIC_ADMIN_EMAILS=you@example.com,someone@example.com
```

It's a build-time value (it ships in the client bundle), so rebuild after
changing it. This only decides what the UI offers — the enforcement belongs in
Firestore rules before this goes anywhere public. `firestore.rules` in this repo
is the wide-open emulator version and must not be deployed as is.

### Scan on arrival

Approved vendors get a QR from their dashboard. It encodes a plain URL
(`/scan/<restaurantId>?k=<code>`), so diners scan it with their phone's own
camera — no app install and no in-app scanner. The code is derived from a secret
on the vendor record plus the calendar day, so a photo of the table tent stops
working at midnight.

`/api/scan/verify` recomputes the code server-side (accepting yesterday's too,
for a late night), checks the phone's location against the listing when the
browser shares one, and the scan document id (`uid_restaurantId_day`) enforces
one payout per person per venue per day. A review written within 24 hours of a
scan is marked as a verified visit.

Note the route reads the vendor's secret with the client SDK, which works
because the emulator rules are open. In production, `vendors` should only be
readable by its owner and admins — move that read to the Admin SDK with a
service account before locking the rules down.

**Plans do not charge anything.** No payment processor is connected; choosing a
plan records the intent on the vendor document, and every screen that mentions a
plan says so.

## Photos

Restaurant images resolve through `/api/photo`, which searches DuckDuckGo and
then Bing for the venue by name, server-side and without an API key, falling
back to a cuisine-matched stock photo. Results are cached in-process for six
hours and proxied so `next/image` can optimise them.

Images render through `app/components/ui/Photo.tsx`, which lazy-loads
everything below the fold behind a blur placeholder and walks a source chain —
stored Firestore URL → lookup → inline placeholder — so a dead link in the
database silently repairs itself instead of leaving a hole in the grid.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.