// Cache-first service worker for the app shell.
// All app content is bundled — the network is only needed for /api/generate,
// which has its own local fallback.

const CACHE_NAME = "mood-room-v4";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/og.png",
  "/fonts/lora-latin-var.woff2",
  "/fonts/lora-latin-italic.woff2"
];

// Hashed bundles (/assets/*) change name on every deploy, so without a cap
// the cache grows forever between CACHE_NAME bumps. Keep the most recent
// few dozen — plenty for one app version plus stragglers.
const MAX_HASHED_ASSETS = 48;

async function trimHashedAssets() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  const hashed = keys.filter((request) =>
    new URL(request.url).pathname.startsWith("/assets/")
  );
  // cache.keys() preserves insertion order, so the front is the oldest.
  const excess = hashed.length - MAX_HASHED_ASSETS;
  for (let i = 0; i < excess; i += 1) {
    await cache.delete(hashed[i]);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Generation endpoint must hit the network; the app already falls back
  // to local content when this fails.
  if (url.pathname.startsWith("/api/")) return;

  // Navigation requests: serve cached index for offline SPA routing.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(() =>
          caches.match("/index.html").then((cached) => cached || Response.error())
        )
    );
    return;
  }

  // Cache-first for static assets.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            event.waitUntil(
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, copy))
                .then(trimHashedAssets)
            );
          }
          return response;
        })
        .catch(() => cached || Response.error());
    })
  );
});
