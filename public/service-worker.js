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
