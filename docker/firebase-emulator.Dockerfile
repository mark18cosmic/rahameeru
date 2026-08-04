# Firebase Emulator Suite: Auth + Firestore, for local development only.
# The Firestore emulator is a Java program, so the image needs a JRE alongside
# node — the official firebase-tools package only ships the launcher.
FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends default-jre-headless ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g firebase-tools@13

WORKDIR /workspace
COPY firebase.json .firebaserc firestore.rules ./

# Pre-download the emulator jars at build time so `up` doesn't stall on a
# first-run fetch (and so the container works on a slow connection).
RUN firebase setup:emulators:firestore

# 4000 UI · 8080 Firestore · 9099 Auth
EXPOSE 4000 8080 9099

CMD ["firebase", "emulators:start", "--project", "rahameeru-local", "--only", "auth,firestore"]
