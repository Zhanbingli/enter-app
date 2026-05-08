// Minimal service worker — present so the app is installable as a PWA.
// Caching strategies can be layered on later.

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Pass-through. The app already falls back to local data when /api/generate fails,
  // so we don't need to intercept network calls for v1.
});
