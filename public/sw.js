// ClawPDF service worker
// Cache-first for app shell, network-fallback for everything else.
const VERSION = "v1";
const CORE_CACHE = `clawpdf-core-${VERSION}`;
const RUNTIME_CACHE = `clawpdf-runtime-${VERSION}`;

const CORE_ASSETS = [
  "/",
  "/app/",
  "/download/",
  "/privacy/",
  "/terms/",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) =>
      Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => undefined),
        ),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CORE_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          // For navigations, fall back to cached home
          req.mode === "navigate"
            ? caches.match("/")
            : new Response("offline", { status: 503 }),
        );
    }),
  );
});
