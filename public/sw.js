// The version and precache list below are filled in at build time by the precache plugin in vite.config.js.
const VERSION = "__VERSION__";
const PRECACHE = __PRECACHE__;
const CACHE = `iasonas-${VERSION}`;
const scope = self.registration.scope;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.map((path) => new URL(path, scope).href))).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => /^iasons?-/.test(key) && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Cache-first; anything not precached (e.g. narration audio) is cached after the first fetch.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith(scope)) return;
  // The app is a single page; any navigation inside the scope gets index.html (print.html is not precached).
  const lookup = request.mode === "navigate" && !request.url.includes("print.html") ? new URL("index.html", scope).href : request;
  event.respondWith(
    caches.match(lookup, { ignoreSearch: request.mode === "navigate", ignoreVary: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok && !request.url.includes("/images-print/")) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => (request.mode === "navigate" ? caches.match(new URL("index.html", scope).href) : Response.error()));
    }),
  );
});
