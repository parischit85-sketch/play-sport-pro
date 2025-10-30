// Service Worker per PlaySport Pro - Enhanced Performance Optimization
const CACHE_VERSION = 'v1.12.0';
const STATIC_CACHE = `playsport-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `playsport-dynamic-${CACHE_VERSION}`;
const API_CACHE = `playsport-api-${CACHE_VERSION}`;

// Enhanced cache strategies configuration
const CACHE_STRATEGIES = {
  // Static assets - Cache First (images, fonts, icons)
  STATIC_ASSETS: [
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
    /\/assets\//,
    /\/icons\//,
    /\/images\//,
  ],

  // API calls - Network First with fallback
  API_ENDPOINTS: [/\/api\//, /firebase/, /firestore/],

  // Pages - Stale While Revalidate
  PAGES: [/\.html$/, /\/$/, /\/dashboard/, /\/matches/, /\/players/, /\/bookings/],
};

// Performance monitoring metrics
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  offlineRequests: 0,
  startTime: Date.now(),
};

const urlsToCache = [
  '/',
  '/play-sport-pro_horizontal.svg',
  '/play-sport-pro_icon_only.svg',
  '/favicon.ico',
  '/favicon.png',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html',
];

// Enhanced installation with critical resource caching
self.addEventListener('install', (event) => {
  console.log('🔧 [SW] Installing Enhanced Service Worker v1.11.0');

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 [SW] Caching critical resources...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ [SW] Critical resources cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ [SW] Cache installation failed:', error);
      })
  );
});

// Enhanced activation with smart cache cleanup
self.addEventListener('activate', (event) => {
  console.log('🚀 [SW] Activating Enhanced Service Worker v1.11.0');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log('🗑️ [SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ [SW] Service Worker activated with enhanced performance');
        return self.clients.claim();
      })
  );
});

// Enhanced fetch handling with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension:')) {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  // Skip external domains that have their own CSP
  const externalDomains = [
    'apis.google.com',
    'res.cloudinary.com',
    'www.googletagmanager.com',
    'www.google-analytics.com',
    'accounts.google.com',
    'api.open-meteo.com',
  ];

  if (externalDomains.some((domain) => url.hostname.includes(domain))) {
    // Let browser handle these requests directly without SW intervention
    return;
  }

  performanceMetrics.networkRequests++;

  // Choose caching strategy based on request type
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isApiEndpoint(request.url)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isPageRequest(request.url)) {
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else {
    event.respondWith(dynamicCacheStrategy(request));
  }
});

/**
 * Cache First Strategy - For static assets
 */
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      performanceMetrics.cacheHits++;
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      // Safely cache response, ignoring CSP/CORS errors
      try {
        cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        // Silently ignore cache errors (usually CSP violations)
      }
    }

    performanceMetrics.cacheMisses++;
    return networkResponse;
  } catch (error) {
    // Only log non-CSP errors
    if (!error.message?.includes('Content Security Policy')) {
      console.warn('⚠️ [SW] Cache first failed:', error);
    }
    performanceMetrics.offlineRequests++;
    return getOfflineFallback(request);
  }
}

/**
 * Network First Strategy - For API calls with TTL
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful API responses with TTL
      const cache = await caches.open(API_CACHE);
      const responseToCache = networkResponse.clone();

      // Add timestamp for TTL management
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-at', Date.now().toString());

      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });

      // Safely cache response, ignoring CSP/CORS errors
      try {
        cache.put(request, modifiedResponse);
      } catch (cacheError) {
        // Silently ignore cache errors (usually CSP violations)
      }
    }

    return networkResponse;
  } catch (error) {
    // Only log non-CSP errors
    if (!error.message?.includes('Content Security Policy')) {
      console.warn('⚠️ [SW] Network first fallback to cache:', error);
    }

    const cachedResponse = await caches.match(request);
    if (cachedResponse && isCacheValid(cachedResponse)) {
      performanceMetrics.cacheHits++;
      return cachedResponse;
    }

    performanceMetrics.offlineRequests++;
    return getApiOfflineFallback(request);
  }
}

/**
 * Stale While Revalidate Strategy - For pages
 */
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Fetch in background to update cache
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  if (cachedResponse) {
    performanceMetrics.cacheHits++;
    return cachedResponse;
  }

  performanceMetrics.cacheMisses++;
  return fetchPromise;
}

/**
 * Dynamic Cache Strategy - For other requests
 */
async function dynamicCacheStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      performanceMetrics.cacheHits++;
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    performanceMetrics.cacheMisses++;
    return networkResponse;
  } catch (error) {
    performanceMetrics.offlineRequests++;
    return getOfflineFallback(request);
  }
}

/**
 * Helper Functions
 */
function isStaticAsset(url) {
  return CACHE_STRATEGIES.STATIC_ASSETS.some((pattern) => pattern.test(url));
}

function isApiEndpoint(url) {
  return CACHE_STRATEGIES.API_ENDPOINTS.some((pattern) => pattern.test(url));
}

function isPageRequest(url) {
  return CACHE_STRATEGIES.PAGES.some((pattern) => pattern.test(url));
}

function isCacheValid(response, ttlMinutes = 30) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return true; // No TTL set, assume valid

  const cacheAge = Date.now() - parseInt(cachedAt);
  const ttlMs = ttlMinutes * 60 * 1000;

  return cacheAge < ttlMs;
}

async function getOfflineFallback(request) {
  if (request.destination === 'document') {
    return caches.match('/offline.html') || caches.match('/');
  }

  if (request.destination === 'image') {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">Immagine non disponibile</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }

  return new Response('Contenuto non disponibile offline', {
    status: 503,
    statusText: 'Service Unavailable',
  });
}

async function getApiOfflineFallback(request) {
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'Richiesta non disponibile offline',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// Enhanced message handling with performance metrics
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Performance metrics retrieval
  if (event.data && event.data.type === 'GET_PERFORMANCE_METRICS') {
    const runtime = Date.now() - performanceMetrics.startTime;
    const cacheHitRatio =
      performanceMetrics.cacheHits /
        (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) || 0;

    event.ports[0].postMessage({
      type: 'PERFORMANCE_METRICS',
      data: {
        ...performanceMetrics,
        cacheHitRatio: Math.round(cacheHitRatio * 100) / 100,
        runtime: runtime,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Legacy version check
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }

  // Legacy hash checking - disabled but maintained for compatibility
  if (event.data && event.data.type === 'CHECK_HASH') {
    console.log('[SW] Hash checking disabled - no refresh triggered');
    event.ports[0].postMessage({
      hashMismatch: false,
      currentHash: 'performance-optimized',
      clientHash: event.data.hash,
    });
  }

  // Enhanced cache clearing
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
        })
        .then(() => {
          // Reset performance metrics
          performanceMetrics = {
            cacheHits: 0,
            cacheMisses: 0,
            networkRequests: 0,
            offlineRequests: 0,
            startTime: Date.now(),
          };
          event.ports[0].postMessage({
            type: 'CACHE_CLEARED',
            success: true,
          });
        })
        .catch((error) => {
          event.ports[0].postMessage({
            type: 'CACHE_CLEARED',
            success: false,
            error: error.message,
          });
        })
    );
  }
});

// Notifica quando la PWA può essere installata
self.addEventListener('beforeinstallprompt', (event) => {
  console.log('[SW] PWA installation prompt ready');
  event.preventDefault();
});

// Gestione degli aggiornamenti dell'app
self.addEventListener('controllerchange', () => {
  console.log('[SW] New service worker activated');
  // Fix: usare clients API invece di window nel service worker context
  self.clients
    .matchAll({ includeUncontrolled: true, type: 'window' })
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'RELOAD_PAGE' });
      });
    })
    .catch((err) => console.log('[SW] reload error:', err));
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================

// Gestione ricezione push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('[SW] Push data parsing error:', error);
    data = { title: 'Paris League', body: 'Nuova notifica disponibile!' };
  }

  const options = {
    title: data.title || 'Paris League',
    body: data.body || 'Hai una nuova notifica',
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    image: data.image || '/logo.png',
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
      ...data.data,
    },
    actions: [
      {
        action: 'open',
        title: 'Apri App',
        icon: '/icons/icon.svg',
      },
      {
        action: 'dismiss',
        title: 'Ignora',
        icon: '/icons/icon.svg',
      },
    ],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
  };

  event.waitUntil(
    self.registration
      .showNotification(options.title, options)
      .then(() => console.log('[SW] Notification displayed'))
      .catch((error) => console.error('[SW] Notification display failed:', error))
  );
});

// Gestione click su notifica
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  if (action === 'dismiss') {
    console.log('[SW] Notification dismissed');
    return;
  }

  // Apri/Focus app
  const urlToOpen = action === 'open' || !action ? data.url || '/' : '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Cerca una finestra già aperta
        for (const client of clients) {
          if (client.url.includes(urlToOpen.split('?')[0]) && 'focus' in client) {
            console.log('[SW] Focusing existing window');
            return client.focus();
          }
        }

        // Apri nuova finestra
        if (clients.openWindow) {
          console.log('[SW] Opening new window:', urlToOpen);
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => console.error('[SW] Notification click handling failed:', error))
  );
});

// Gestione chiusura notifica
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);

  // Analytics tracking opzionale
  // gtag('event', 'notification_closed', {
  //   notification_tag: event.notification.tag
  // });
});
