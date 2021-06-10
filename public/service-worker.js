console.log("Hello from service worker!");

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/db.js",
  "/manifest.webmanifest",
];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

//install
self.addEventListener("install", (ev) => {
  ev.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Files successfully pre-cached");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  // tell the browser to activate this service worker immediately once it
  // has finished installing
  self.skipWaiting();
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", (ev) => {
  const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
  ev.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        //filters through array of old cache names to delete
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

//fetch
self.addEventListener("fetch", (ev) => {
  //cache successful requests to the API
  if (ev.request.url.includes("/api/")) {
    ev.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(ev.request)
          .then((response) => {
            // If the response was good, clone it and store it in the cache.

            if (response.status === 200) {
              cache.put(ev.request.url, response.clone());
            }
            return response;
          })
          .catch((err) => {
            //Network request failed, try to get it from the cache
            return cache.match(ev.request);
          })
          .catch((err) => {
            console.log(err);
          });
      })
    );
    return;
  }

  //if the request is not for the API, serve static assets using 'offline-first' approach.
  ev.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(ev.request).then((response) => {
        return response || fetch(ev.request);
      });
    })
  );
});
