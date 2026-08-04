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

## License

This project is licensed under the MIT License. See the LICENSE file for more details.