// Service Worker per PlaySport Pro - Enhanced Performance Optimization
const CACHE_VERSION = 'v20251115102506';
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
  console.log('🔧 [SW] Installing Enhanced Service Worker v1.14.0');

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
  console.log('🚀 [SW] Activating Enhanced Service Worker v1.14.0');

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
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      // Safely cache response, ignoring CSP/CORS errors
      try {
        cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        // Silently ignore cache errors (usually CSP violations)
      }
    }

    performanceMetrics.cacheMisses++;
    return networkResponse || new Response('Network error', { status: 503 });
  } catch (error) {
    // Silently handle errors - expected in development
    performanceMetrics.offlineRequests++;
    const fallback = await getOfflineFallback(request);
    return fallback || new Response('Offline', { status: 503 });
  }
}

/**
 * Network First Strategy - For API calls with TTL
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.ok) {
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

    return networkResponse || new Response('Network error', { status: 503 });
  } catch (error) {
    // Silently handle errors - expected in development
    const cachedResponse = await caches.match(request);
    if (cachedResponse && isCacheValid(cachedResponse)) {
      performanceMetrics.cacheHits++;
      return cachedResponse;
    }

    performanceMetrics.offlineRequests++;
    const fallback = await getApiOfflineFallback(request);
    return (
      fallback ||
      new Response(JSON.stringify({ error: 'Offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    );
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
      if (networkResponse && networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse || cachedResponse || new Response('Network error', { status: 503 });
    })
    .catch(() => cachedResponse || new Response('Offline', { status: 503 }));

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
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      try {
        cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        // Silently ignore cache errors
      }
    }

    performanceMetrics.cacheMisses++;
    return networkResponse || new Response('Network error', { status: 503 });
  } catch (error) {
    performanceMetrics.offlineRequests++;
    const fallback = await getOfflineFallback(request);
    return fallback || new Response('Offline', { status: 503 });
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

// Notifica quando la PWA può essere installata - INOLTRA L'EVENTO AI CLIENT
self.addEventListener('beforeinstallprompt', (event) => {
  console.log('[SW] PWA installation prompt ready - forwarding to clients');

  // Inoltra l'evento a tutti i client (finestre del browser)
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'BEFORE_INSTALL_PROMPT',
        promptEvent: event,
      });
    });
  });

  // NON prevenire l'evento qui - lascialo arrivare al componente React
  // event.preventDefault(); // COMMENTATO - lascia che arrivi al componente
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

// Funzione helper per tracciare analytics notifiche
async function trackNotificationAnalytics(eventData) {
  try {
    const event = {
      id: `sw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...eventData,
      platform: 'web',
      userAgent: navigator.userAgent,
      swVersion: CACHE_VERSION,
    };

    // Invia analytics al backend via fetch (non bloccante)
    fetch('/api/analytics/notification-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
      // Non aspettare la risposta per non bloccare il SW
      keepalive: true,
    }).catch((error) => {
      console.warn('[SW] Analytics tracking failed (non-blocking):', error);
    });

    console.log('[SW] 📊 Analytics tracked:', event.type, 'for notification');
  } catch (error) {
    console.warn('[SW] Analytics tracking error:', error);
  }
}

// Gestione ricezione push notifications con supporto rich notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('[SW] Push data parsing error:', error);
    data = { title: 'Play-sport.pro', body: 'Nuova notifica disponibile!' };
  }

  // Costruisci opzioni avanzate per notifiche rich
  const options = {
    // Campi base
    title: data.title || 'Play-sport.pro',
    body: data.body || 'Hai una nuova notifica',
    icon: data.icon || '/icons/icon.svg',
    badge: data.badge || '/icons/icon.svg',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    timestamp: data.timestamp || Date.now(),

    // Campi avanzati per notifiche rich
    image: data.image, // Immagine grande (hero image)
    actions: data.actions || [
      {
        action: 'open',
        title: 'Apri App',
        icon: '/icons/icon.svg',
      },
      {
        action: 'dismiss',
        title: 'Ignora',
      },
    ],

    // Dati personalizzati per deep linking e azioni
    data: {
      url: data.data?.url || '/',
      type: data.data?.type || 'general',
      playerId: data.data?.playerId,
      clubId: data.data?.clubId,
      matchId: data.data?.matchId,
      bookingId: data.data?.bookingId,
      tournamentId: data.data?.tournamentId,
      deepLink: data.data?.deepLink,
      actionButtons: data.data?.actionButtons,
      priority: data.data?.priority || 'normal',
      category: data.data?.category || 'general',
      timestamp: Date.now(),
      ...data.data,
    },

    // Suoni e vibrazione
    vibrate: data.vibrate || [200, 100, 200],

    // Notifiche persistenti e ri-notifica
    renotify: data.renotify || false,

    // Lingua e direzione testo
    lang: data.lang || 'it',
    dir: data.dir || 'ltr',
  };

  // Gestione priorità notifiche
  if (data.data?.priority === 'high') {
    options.requireInteraction = true;
    options.silent = false;
    options.vibrate = [300, 100, 300, 100, 300];
  } else if (data.data?.priority === 'low') {
    options.silent = true;
    options.vibrate = [];
  }

  // Gestione categorie specifiche
  if (data.data?.category === 'booking') {
    options.actions = [
      { action: 'view-booking', title: 'Vedi Prenotazione', icon: '/icons/icon.svg' },
      { action: 'open', title: 'Apri App', icon: '/icons/icon.svg' },
      { action: 'dismiss', title: 'Ignora' },
    ];
  } else if (data.data?.category === 'match') {
    options.actions = [
      { action: 'view-match', title: 'Vedi Partita', icon: '/icons/icon.svg' },
      { action: 'open', title: 'Apri App', icon: '/icons/icon.svg' },
      { action: 'dismiss', title: 'Ignora' },
    ];
  } else if (data.data?.category === 'certificate') {
    options.actions = [
      { action: 'view-certificate', title: 'Vedi Certificato', icon: '/icons/icon.svg' },
      { action: 'download-certificate', title: 'Scarica PDF', icon: '/icons/icon.svg' },
      { action: 'open', title: 'Apri App', icon: '/icons/icon.svg' },
    ];
  }

  event.waitUntil(
    self.registration
      .showNotification(options.title, options)
      .then(() => {
        console.log('[SW] Rich notification displayed');

        // Track notification delivered event con metadati ricchi
        trackNotificationAnalytics({
          type: 'delivered',
          channel: 'push',
          notificationType: data.data?.type || 'general',
          category: data.data?.category || 'general',
          priority: data.data?.priority || 'normal',
          userId: data.data?.playerId,
          clubId: data.data?.clubId,
          matchId: data.data?.matchId,
          bookingId: data.data?.bookingId,
          tournamentId: data.data?.tournamentId,
          success: true,
          metadata: {
            title: options.title,
            tag: options.tag,
            hasImage: !!options.image,
            hasActions: options.actions?.length > 0,
            actionCount: options.actions?.length || 0,
            requireInteraction: options.requireInteraction,
            isSilent: options.silent,
            hasVibration: options.vibrate?.length > 0,
            language: options.lang,
          },
        });
      })
      .catch((error) => {
        console.error('[SW] Rich notification display failed:', error);

        // Track notification delivery failed event
        trackNotificationAnalytics({
          type: 'delivery-failed',
          channel: 'push',
          notificationType: data.data?.type || 'general',
          category: data.data?.category || 'general',
          userId: data.data?.playerId,
          clubId: data.data?.clubId,
          success: false,
          error: error.message,
          metadata: {
            title: options.title,
            tag: options.tag,
            hasImage: !!options.image,
          },
        });
      })
  );
});

// Gestione click su notifica con supporto per azioni personalizzate
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification, 'Action:', event.action);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  // Determina l'URL da aprire basato sull'azione e sui dati
  let urlToOpen = data.url || '/';

  // Gestione azioni personalizzate
  switch (action) {
    case 'view-booking':
      if (data.bookingId) {
        urlToOpen = `/bookings/${data.bookingId}`;
      } else {
        urlToOpen = '/bookings';
      }
      break;

    case 'view-match':
      if (data.matchId) {
        urlToOpen = `/matches/${data.matchId}`;
      } else {
        urlToOpen = '/matches';
      }
      break;

    case 'view-certificate':
      if (data.playerId) {
        urlToOpen = `/players/${data.playerId}/certificate`;
      } else {
        urlToOpen = '/certificates';
      }
      break;

    case 'download-certificate':
      if (data.playerId) {
        // Per il download, apri prima la pagina del certificato
        urlToOpen = `/players/${data.playerId}/certificate?download=true`;
      } else {
        urlToOpen = '/certificates';
      }
      break;

    case 'view-tournament':
      if (data.tournamentId) {
        urlToOpen = `/tournaments/${data.tournamentId}`;
      } else {
        urlToOpen = '/tournaments';
      }
      break;

    case 'open':
    case 'default':
      // Usa l'URL specificato nei dati o quello di default
      urlToOpen = data.url || '/';
      break;

    case 'dismiss':
      console.log('[SW] Notification dismissed via action');
      // Track dismiss action
      trackNotificationAnalytics({
        type: 'dismissed',
        channel: 'push',
        notificationType: data.type || 'general',
        category: data.category || 'general',
        userId: data.playerId,
        clubId: data.clubId,
        success: true,
        metadata: {
          action: 'dismiss',
          tag: notification.tag,
          url: data.url,
          timestamp: data.timestamp,
        },
      });
      return; // Non aprire nessuna pagina

    default:
      // Azione personalizzata o sconosciuta
      if (data.deepLink) {
        urlToOpen = data.deepLink;
      } else {
        urlToOpen = data.url || '/';
      }
      break;
  }

  // Track notification clicked event con azione specifica
  trackNotificationAnalytics({
    type: 'clicked',
    channel: 'push',
    notificationType: data.type || 'general',
    category: data.category || 'general',
    userId: data.playerId,
    clubId: data.clubId,
    matchId: data.matchId,
    bookingId: data.bookingId,
    tournamentId: data.tournamentId,
    success: true,
    metadata: {
      action: action || 'default',
      tag: notification.tag,
      url: urlToOpen,
      timestamp: data.timestamp,
      timeToClick: Date.now() - (data.timestamp || Date.now()),
      deepLinkUsed: !!data.deepLink,
    },
  });

  // Apri/Focus app con l'URL determinato
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Cerca una finestra già aperta che corrisponda all'URL
        const baseUrl = urlToOpen.split('?')[0]; // Ignora query parameters per matching
        for (const client of clients) {
          if (client.url.includes(baseUrl) && 'focus' in client) {
            console.log('[SW] Focusing existing window:', baseUrl);
            return client.focus();
          }
        }

        // Apri nuova finestra con l'URL specifico
        if (self.clients.openWindow) {
          console.log('[SW] Opening new window:', urlToOpen);
          return self.clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('[SW] Notification click handling failed:', error);
        // Fallback: apri homepage
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
  );
});

// Gestione chiusura notifica con metadati ricchi
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);

  const notification = event.notification;
  const data = notification.data || {};

  // Track notification closed event (solo se non è stata cliccata)
  trackNotificationAnalytics({
    type: 'closed',
    channel: 'push',
    notificationType: data.type || 'general',
    category: data.category || 'general',
    priority: data.priority || 'normal',
    userId: data.playerId,
    clubId: data.clubId,
    matchId: data.matchId,
    bookingId: data.bookingId,
    tournamentId: data.tournamentId,
    success: true,
    metadata: {
      tag: notification.tag,
      url: data.url,
      timestamp: data.timestamp,
      displayDuration: Date.now() - (data.timestamp || Date.now()),
      deepLink: data.deepLink,
      wasInteracted: false, // Non è stata cliccata, solo chiusa
    },
  });
});
