/* SILONG PH service worker
 *
 * Design rules:
 *  - Never cache API responses. Weather must stay explicitly fresh/stale.
 *  - Never cache admin pages or authentication responses.
 *  - Network-first for navigations so pages are not silently outdated.
 *  - Cache-first for immutable static assets.
 *  - A standalone offline.html is precached with inline CSS so it works
 *    without any Next.js runtime chunks.
 *
 * Cache versioning:
 *  - Bump VERSION whenever the caching strategy changes or a deployment
 *    needs to invalidate previously cached pages. The activate handler
 *    removes every older silong-* cache.
 */

const VERSION = "silong-v3";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-192-maskable.png",
  "/icons/icon-512-maskable.png",
  "/icons/apple-touch-icon.png",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      // A missing optional asset must not prevent the worker from installing.
      await Promise.all(
        PRECACHE.map(async (url) => {
          try {
            await cache.add(url);
          } catch {
            // The offline page and core icons are best-effort. The worker can
            // still serve the network and the remaining cached assets.
          }
        }),
      );
      // Do not skipWaiting automatically. A waiting worker activates after the
      // existing tabs close, so an open page never loses its old JS chunks.
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("silong-") && key !== STATIC_CACHE && key !== PAGE_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/geo/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/favicon.ico"
  );
}

function isPrivatePath(url) {
  return (
    url.pathname === "/admin" ||
    url.pathname.startsWith("/admin/") ||
    url.pathname.startsWith("/api/")
  );
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      try {
        await cache.put(request, response.clone());
      } catch {
        // Storage quota or a transient cache failure must not block the page.
      }
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const staticCache = await caches.open(STATIC_CACHE);
    const offline = await staticCache.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response(
      "<!doctype html><title>Offline</title><p>You are offline and this page is not cached.</p>",
      { headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    try {
      await cache.put(request, response.clone());
    } catch {
      // A full or unavailable cache should not turn a valid asset into an error.
    }
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js") return;
  if (isPrivatePath(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isStaticAsset(url)) {
    // A failed chunk request must not return the offline HTML document:
    // that would be parsed as JavaScript and break the application.
    event.respondWith(cacheFirst(request).catch(() => new Response("", { status: 504, statusText: "Offline" })));
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches
            .open(PAGE_CACHE)
            .then((cache) => cache.put(request, copy))
            .catch(() => undefined);
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response("", { status: 504, statusText: "Offline" });
      }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
