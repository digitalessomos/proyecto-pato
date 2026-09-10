/**
 * 🎂 Service Worker - Pastelería Pato (PWA)
 * © 2026 GastroWeb Studio 360 & Pastelería Pato.
 * 
 * Estrategia de caché balanceada:
 * - Cache-First para recursos estáticos locales (iconos, css, manifest)
 * - Network-First para documentos HTML (asegura catálogo fresco)
 * - Bypass total para peticiones a Firebase y APIs en tiempo real
 */

const CACHE_NAME = "pato-pasteleria-v1";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./admin.html",
  "./manifest.json",
  "./css/styles.css",
  "./data/config.js",
  "./data/products.js",
  "./js/firebase-config.js",
  "./js/productsService.js",
  "./js/cart.js",
  "./js/app.js",
  "./js/admin.js",
  "./public/assets/icon-192.png",
  "./public/assets/icon-512.png",
  "./public/assets/icon-maskable-512.png"
];

// 1. Instalación del Service Worker: precacheo de assets estáticos esenciales
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("🎂 [PWA Service Worker] Precaching recursos estáticos...");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("⚠️ [PWA Service Worker] Advertencia en precaching parcial:", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activación: limpieza de cachés anteriores
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("🧹 [PWA Service Worker] Limpiando caché obsoleta:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Interceptación inteligente de peticiones
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Excluir peticiones a Firestore, Google APIs, CDN o métodos que no sean GET
  if (
    event.request.method !== "GET" ||
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("firebase") ||
    url.hostname.includes("google") ||
    url.protocol.startsWith("chrome-extension")
  ) {
    return; // Petición directa a la red
  }

  // Para navegación HTML (index.html, admin.html): Network-First con fallback a caché
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match("./index.html");
          });
        })
    );
    return;
  }

  // Para assets estáticos locales: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
