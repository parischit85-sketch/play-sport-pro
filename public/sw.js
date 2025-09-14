// Service Worker per Paris League PWA
const CACHE_NAME = "paris-league-v1.8.4";
const APP_VERSION = "1.8.4";
const CURRENT_HASH = "dev-mode-disabled"; // Hash checking disabilitato
const urlsToCache = [
  "/",
  "/play-sport-pro_horizontal.svg",
  "/play-sport-pro_icon_only.svg",
  "/favicon.ico",
  "/favicon.png",
  "/manifest.json",
  "/icons/icon.svg",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  // Rimosso /src/main.jsx per evitare caching di asset di sviluppo
];

// Installazione del Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Service Worker");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching app shell");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("[SW] Cache installation failed:", error);
      }),
  );
  // Forza l'aggiornamento immediato
  self.skipWaiting();
});

// Attivazione del Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Service Worker");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        // Forza il nuovo SW a prendere il controllo immediatamente
        return self.clients.claim();
      }),
  );
});

// Intercettazione delle richieste di rete
self.addEventListener("fetch", (event) => {
  // Solo per richieste GET
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  const isAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css");
  const isImage =
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".ico");
  const isApiCall =
    url.pathname.includes("api") || url.hostname.includes("firebase");

  // API calls: sempre network first
  if (isApiCall) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request)),
    );
    return;
  }

  // Immagini e file statici: cache first con fallback a network
  if (isImage) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseToCache));
            }
            return response;
          })
          .catch((error) => {
            console.error("[SW] Image fetch failed:", event.request.url, error);
            throw error;
          });
      }),
    );
    return;
  }

  // JS/CSS assets: SEMPRE network first con cache busting per forzare aggiornamenti
  if (isAsset) {
    event.respondWith(
      fetch(event.request, { cache: "no-cache" })
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log(
                "[SW] Using cached asset (offline):",
                event.request.url,
              );
              return cachedResponse;
            }
            throw new Error("Asset not available offline");
          }),
        ),
    );
    return;
  }

  // Altri asset: cache first
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseToCache = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache));

          return response;
        })
        .catch((error) => {
          console.error("[SW] Fetch failed:", error);
          if (event.request.destination === "document") {
            return caches.match("/");
          }
        });
    }),
  );
});

// Gestione dei messaggi dall'app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  // Controllo versione app
  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: APP_VERSION });
  }

  // Controllo hash degli asset - TEMPORANEAMENTE DISABILITATO
  if (event.data && event.data.type === "CHECK_HASH") {
    // Sempre risponde che non c'è mismatch per evitare refresh continui
    console.log("[SW] Hash checking disabled - no refresh triggered");
    event.ports[0].postMessage({
      hashMismatch: false,
      currentHash: CURRENT_HASH,
      clientHash: event.data.hash,
    });
  }

  // Forza clear cache
  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        );
      })
      .then(() => {
        event.ports[0].postMessage({ success: true });
      });
  }
});

// Notifica quando la PWA può essere installata
self.addEventListener("beforeinstallprompt", (event) => {
  console.log("[SW] PWA installation prompt ready");
  event.preventDefault();
});

// Gestione degli aggiornamenti dell'app
self.addEventListener("controllerchange", () => {
  console.log("[SW] New service worker activated");
  // Fix: usare clients API invece di window nel service worker context
  self.clients
    .matchAll({ includeUncontrolled: true, type: "window" })
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: "RELOAD_PAGE" });
      });
    })
    .catch((err) => console.log("[SW] reload error:", err));
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================

// Gestione ricezione push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.error("[SW] Push data parsing error:", error);
    data = { title: "Paris League", body: "Nuova notifica disponibile!" };
  }

  const options = {
    title: data.title || "Paris League",
    body: data.body || "Hai una nuova notifica",
    icon: "/icons/icon.svg",
    badge: "/icons/icon.svg",
    image: data.image || "/logo.png",
    data: {
      url: data.url || "/",
      timestamp: Date.now(),
      ...data.data,
    },
    actions: [
      {
        action: "open",
        title: "Apri App",
        icon: "/icons/icon.svg",
      },
      {
        action: "dismiss",
        title: "Ignora",
        icon: "/icons/icon.svg",
      },
    ],
    tag: data.tag || "default",
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
  };

  event.waitUntil(
    self.registration
      .showNotification(options.title, options)
      .then(() => console.log("[SW] Notification displayed"))
      .catch((error) =>
        console.error("[SW] Notification display failed:", error),
      ),
  );
});

// Gestione click su notifica
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  if (action === "dismiss") {
    console.log("[SW] Notification dismissed");
    return;
  }

  // Apri/Focus app
  const urlToOpen = action === "open" || !action ? data.url || "/" : "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // Cerca una finestra già aperta
        for (const client of clients) {
          if (
            client.url.includes(urlToOpen.split("?")[0]) &&
            "focus" in client
          ) {
            console.log("[SW] Focusing existing window");
            return client.focus();
          }
        }

        // Apri nuova finestra
        if (clients.openWindow) {
          console.log("[SW] Opening new window:", urlToOpen);
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) =>
        console.error("[SW] Notification click handling failed:", error),
      ),
  );
});

// Gestione chiusura notifica
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification.tag);

  // Analytics tracking opzionale
  // gtag('event', 'notification_closed', {
  //   notification_tag: event.notification.tag
  // });
});
