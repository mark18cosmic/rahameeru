# Feature ideas

Written 2026-08-05, against the app as it stands: Next 15 App Router, Firebase
auth + Firestore, client-side data loading with a local seed fallback, photos
resolved by name through `/api/photo`, favourites in local storage.

Ordered within each section by value for the effort. Nothing here is committed
to — it's a menu.

---

## 1. Close the loop on reviews

The review system is the thinnest part of the app relative to how central it is
to the pitch.

**One review per person, editable.** Right now the same account can post
unlimited reviews for one place, and there's no way to fix a typo. Key the doc
as `${restaurantId}_${userId}` instead of an auto id, then `setDoc` on submit —
that gives edit-in-place and dedupe in one move, and makes the rating maths
honest. *Small.*

**Photos on reviews.** The single highest-value addition for a food app: real
photos of real plates from real users beat anything the name lookup can find.
Firebase Storage, resize client-side before upload, cap at three per review.
Restaurant galleries then prefer user photos over search results. *Medium.*

**Structured sub-ratings.** Food / service / value as separate stars, averaged
into the headline number. The README already promises this. It also gives the
detail page something worth showing: a small bar chart of the distribution.
*Small.*

**Helpful votes and sorting.** "Was this helpful?" plus sort by
recent / highest / lowest / most helpful. Cheap, and it surfaces the useful
reviews on places with many. *Small.*

**Moderation.** A `reported` flag, a rules change so only the author can edit,
and a hidden `/admin` list. Needed before any of the above goes public. *Medium.*

---

## 2. Make the data trustworthy

**Hours accuracy loop.** "Is this still open?" prompt on the detail page when
the app thinks a place is open, aggregated into a confidence score. Opening
hours in Malé change often and stale hours are the fastest way to lose trust.
*Medium.*

**Owner claims.** Let a venue claim its page with an email at the domain, then
edit hours, menu and photos. This is also the natural first monetisation
surface (featured placement, promotions). *Large.*

**Menu freshness.** Show "menu updated 4 months ago" and let users flag prices
that have moved. Prices in the seed data will rot faster than anything else.
*Small.*

---

## 3. Discovery

**Near me.** The app knows `coords` for most places and already computes
`distanceKm` — it just never asks for geolocation. Sort by distance, show
"7 min walk", add a "within 500m" filter. On an island where everything is
walkable this is the single most useful sort. *Small.*

**Map view.** A toggle on `/explore` between grid and map. Pins coloured by
open/closed, tap for a card. Leaflet with OpenStreetMap tiles keeps it
keyless. *Medium.*

**Mood and occasion search.** The tag vocabulary already carries "Date Spots",
"Ocean View", "24/7". Promote them to first-class browse surfaces with their own
pages and copy, rather than just filter chips. *Small.*

**"Open right now, near me, under MVR 150."** One button that combines the three
filters people actually use together, on the home page. *Small.*

**Better wheel.** Let the wheel respect the current filters, remember the last
five results so it stops repeating, and offer "spin again without this one".
*Small.*

---

## 4. Personal

**Favourites in Firestore.** They live in local storage today, so they vanish
when someone switches phone or clears the browser. Move to
`users/{uid}/favourites` with local storage as the offline cache. *Small.*

**Lists.** "Date night", "Cheap lunch near work", "Take visitors here" — named
collections, shareable with a link. Turns the app from a lookup into something
people come back to. *Medium.*

**Been there.** Mark a place as visited; the home page then hides or de-ranks
them in "worth the walk" and can show "you've been to 14 of 60 places in Malé".
Light gamification without a points system. *Medium.*

**Weekly digest.** Push or email: new places added, places you saved that are
open late tonight. The service worker is already registered, so web push is
mostly wiring. *Medium.*

---

## 5. Performance and platform

**Server-render the lists.** Every page currently loads restaurants in a client
effect, so the first paint is skeletons even though the data is public and
cacheable. Move `getRestaurants` to a server component with
`revalidate`, and the app gets a real LCP and proper SEO for restaurant pages.
This is the biggest single win available and it's mostly deletion. *Medium.*

**Persist resolved photos.** `/api/photo` re-resolves after every cold start
because the cache is in-process. Write the winning URL back to the restaurant
doc so the second visitor gets it instantly, with a monthly refresh. *Small.*

**Offline detail pages.** The service worker caches shell assets; caching the
last 20 viewed restaurants would make the app usable on a patchy connection,
which is when people most need to check whether somewhere is open. *Medium.*

**Emulator seed export.** `firebase emulators:export` a snapshot with reviews
and users into the repo so `npm run dev:stack` comes up with a realistic
dataset rather than an empty auth emulator. *Small.*

---

## 6. If you want the app to feel alive

**Live "busy now" signal.** Crowd-sourced: a one-tap "how busy is it?" on the
detail page, aggregated per hour of week. No integrations, no APIs, and it's
the kind of thing only a local app can have.

**Tonight's shortlist.** At 6pm, the home page turns into three cards: one
cheap, one nearby, one you've saved. Fewer choices at the moment people are
actually deciding.

**Ramadan and holiday hours.** A seasonal hours overlay. In Malé this is the
difference between the app being right and being wrong for a month a year.

---

## Deliberately not doing

- **Bookings and ordering.** Neither has a Maldives-wide integration worth
  building against; affiliate links out are the honest version until one exists.
- **Chains and franchises as one page.** The seed data has separate branches
  with separate hours, which is what people actually search for.
- **A points/badges layer.** Nothing in the app is frequent enough to sustain it.
