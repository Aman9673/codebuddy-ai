const CACHE_PREFIX = "codebuddy-";
const CACHE_NAME = `${CACHE_PREFIX}v5`;
const APP_SHELL = [
  "/",
  "/lessons",
  "/playground",
  "/ai-tutor",
  "/notes",
  "/quizzes",
  "/about",
  "/code-runner.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    request.headers.has("RSC") ||
    request.headers.has("Next-Router-Prefetch")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && APP_SHELL.includes(url.pathname)) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(url.pathname, response.clone());
        }
        return response;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return (
          (await cache.match(url.pathname)) ||
          (await cache.match("/")) ||
          new Response("CodeBuddy is offline.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          })
        );
      }
    })());
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            void caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, response.clone()))
              .catch((error) =>
                console.error("Could not cache a CodeBuddy resource:", error),
              );
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
