console.log("Hello from service worker!");

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
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

  self.skipWaiting();
});
