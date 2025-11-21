// =============================================
// FILE: src/main.jsx
// =============================================
import React from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import AppRouter from './router/AppRouter.jsx';
import updateService from './services/updateService.js';
import hashChecker from './services/hashChecker.js';
import './monitoring/sentry.js'; // Sentry monitoring for Push Notifications v2.0
import { initializeGA } from './lib/analytics.js';
import { initWebVitals } from './lib/web-vitals.js';
import SecurityProvider from './contexts/SecurityContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';

// Global Firebase quota error handler
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;

  // Check for Firebase quota exceeded errors
  if (
    error?.code === 'resource-exhausted' ||
    error?.message?.includes('quota exceeded') ||
    error?.message?.includes('resource-exhausted') ||
    error?.message?.includes('Quota exceeded')
  ) {
    console.warn('🚨 Firebase quota exceeded. App may not function properly.');

    // Show user-friendly message
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; z-index: 10000;
      background: #f59e0b; color: white; padding: 12px; text-align: center;
      font-family: system-ui, sans-serif; font-size: 14px;
    `;
    alertDiv.innerHTML = `
      ⚠️ Servizio temporaneamente limitato per superamento quota Firebase. 
      Alcune funzionalità potrebbero non essere disponibili.
    `;
    document.body.appendChild(alertDiv);

    // Prevent the error from causing app crash
    event.preventDefault();
    return;
  }

  // Check for React.Children errors specifically
  if (
    error?.message?.includes('Cannot set properties of undefined') &&
    error?.message?.includes('Children')
  ) {
    console.error('🚨 React.Children error detected - likely due to Firebase quota issues');

    // Show error message and reload suggestion
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000;
      background: #dc2626; color: white; padding: 20px; border-radius: 8px;
      font-family: system-ui, sans-serif; font-size: 16px; max-width: 400px; text-align: center;
    `;
    alertDiv.innerHTML = `
      <h3 style="margin: 0 0 10px 0;">Errore di caricamento</h3>
      <p style="margin: 0 0 15px 0;">L'applicazione ha riscontrato un errore durante l'inizializzazione.</p>
      <button onclick="window.location.reload()" style="
        background: white; color: #dc2626; border: none; padding: 8px 16px; 
        border-radius: 4px; cursor: pointer; font-weight: bold;
      ">Ricarica pagina</button>
    `;
    document.body.appendChild(alertDiv);

    // Prevent the error from propagating
    event.preventDefault();
    return;
  }
});

// Initialize Sentry error tracking
// initSentry();

// Initialize Google Analytics
initializeGA();

// Initialize Web Vitals monitoring
initWebVitals();

// PWA web application initialization

// Development health check
if (import.meta.env.DEV) {
  import('./utils/health-check.js');
  import('./utils/debugClubAdmin.js'); // Debug utilities
  import('./utils/bootstrapAdmin.js').then(({ installBootstrapAdminHelper }) => {
    installBootstrapAdminHelper();
  }).catch(() => {/* no-op */});
  // DISABLED FOR PUSH NOTIFICATIONS TESTING - SW must stay active
  // import('./utils/unregister-sw-dev.js');
}

// Performance monitoring in production
if (import.meta.env.PROD) {
  // Enhanced performance monitoring with Web Vitals
  import('./lib/web-vitals.js').then(({ trackServiceWorkerMetrics }) => {
    // Track Service Worker performance every 5 minutes
    setInterval(trackServiceWorkerMetrics, 5 * 60 * 1000);

    // Initial tracking after 30 seconds
    setTimeout(trackServiceWorkerMetrics, 30 * 1000);
  });
}

// PWA Service Worker e Update Service
// In development: DO NOT register SW by default (prevents dev cache/HMR issues)
// In production: always enabled
if (import.meta.env.PROD) {
  // Production: sempre attivo
  window.addEventListener('load', async () => {
    try {
      updateService.init();
      hashChecker.init();
      console.log('✅ Update Service initialized');
    } catch (error) {
      console.error('❌ Update Service failed:', error);
    }
  });
} else {
  // Development: ALWAYS enable SW for push notifications testing
  window.addEventListener('load', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const enableSW = true; // FORCED FOR PUSH TESTING - was: urlParams.has('enableSW');
    const mockPush = urlParams.has('mockPush');

    if (enableSW) {
      console.log('🔧 [DEV] Attempting Service Worker registration (FORCED ENABLE FOR PUSH)...');

      // Timeout per evitare hang in dev
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Registration timeout')), 10000);
      });

      try {
        await Promise.race([updateService.init(), timeoutPromise]);
        hashChecker.init();
        console.log('✅ [DEV] Service Worker enabled successfully');
        showDevNotification('✅ Service Worker attivo - Push notifications disponibili', 'success');
      } catch (error) {
        console.error('❌ [DEV] Service Worker registration failed:', error);
        showDevNotification(
          '⚠️ Service Worker fallito. Usa ?mockPush per testare push notifications',
          'warning',
          8000
        );
      }
    } else if (mockPush) {
      console.log('🎭 [DEV] Mock push notifications enabled via ?mockPush');
      enableMockPushNotifications();
      showDevNotification('🎭 Mock push mode attivo', 'info');
    } else {
      console.log('⏸️ [DEV] Service Worker disabled in development (default)');
      console.log('💡 [DEV] Use URL flags:');
      console.log('   ?enableSW  - Enable real Service Worker');
      console.log('   ?mockPush  - Enable mock push notifications');
    }
  });
}

// Funzione per abilitare mock push notifications in development
function enableMockPushNotifications() {
  console.log('🎭 [MOCK] Push notification mock mode enabled');

  // Override delle funzioni push per simulare comportamento
  window.__MOCK_PUSH_MODE__ = true;

  // Simula Notification API se non disponibile
  if (!('Notification' in window)) {
    window.Notification = class MockNotification {
      constructor(title, options = {}) {
        this.title = title;
        this.options = options;
        console.log('🔔 [MOCK] Notification created:', { title, options });

        // Mostra notifica visiva nel DOM
        this.showMockNotification(title, options);

        // Auto-dismiss dopo 5 secondi
        setTimeout(() => {
          console.log('🔔 [MOCK] Notification auto-dismissed:', title);
          this.hideMockNotification();
          if (this.onclose) this.onclose();
        }, 5000);
      }

      showMockNotification(title, options) {
        // Rimuovi notifiche esistenti
        const existing = document.querySelectorAll('.mock-notification');
        existing.forEach((el) => el.remove());

        const mockNotif = document.createElement('div');
        mockNotif.className = 'mock-notification';

        mockNotif.style.cssText = `
          position: fixed;
          top: 20px;
          left: 20px;
          background: #1f2937;
          border: 2px solid #3b82f6;
          color: white;
          padding: 16px;
          border-radius: 12px;
          z-index: 10001;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          max-width: 350px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.4);
          cursor: pointer;
        `;

        mockNotif.innerHTML = `
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="flex-shrink: 0; margin-top: 2px;">
              <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
              <div style="opacity: 0.9; line-height: 1.4;">${options.body || 'Nuova notifica'}</div>
              ${
                options.actions
                  ? `
                <div style="margin-top: 12px; display: flex; gap: 8px;">
                  ${options.actions
                    .map(
                      (action) => `
                    <button class="mock-action-btn" data-action="${action.action}" style="
                      background: rgba(255,255,255,0.1);
                      border: 1px solid rgba(255,255,255,0.2);
                      color: white;
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-size: 12px;
                      cursor: pointer;
                    ">${action.title}</button>
                  `
                    )
                    .join('')}
                </div>
              `
                  : ''
              }
            </div>
            <button class="mock-close-btn" style="
              background: none;
              border: none;
              color: rgba(255,255,255,0.6);
              cursor: pointer;
              font-size: 16px;
              line-height: 1;
            ">×</button>
          </div>
        `;

        // Gestisci click azioni
        mockNotif.addEventListener('click', (e) => {
          if (e.target.classList.contains('mock-action-btn')) {
            const action = e.target.dataset.action;
            console.log('🔔 [MOCK] Action clicked:', action);
            this.hideMockNotification();
            if (this.onclose) this.onclose();
          } else if (e.target.classList.contains('mock-close-btn')) {
            this.close();
          }
        });

        document.body.appendChild(mockNotif);
        this.mockElement = mockNotif;
      }

      hideMockNotification() {
        if (this.mockElement) {
          this.mockElement.style.opacity = '0';
          setTimeout(() => {
            if (this.mockElement && this.mockElement.parentElement) {
              this.mockElement.remove();
            }
          }, 300);
        }
      }

      close() {
        console.log('🔔 [MOCK] Notification manually closed:', this.title);
        this.hideMockNotification();
        if (this.onclose) this.onclose();
      }

      static requestPermission() {
        console.log('🔔 [MOCK] Permission requested - granted');
        return Promise.resolve('granted');
      }

      static get permission() {
        return 'granted';
      }
    };
  }

  // Simula Service Worker API con push manager completo
  if (!('serviceWorker' in navigator)) {
    navigator.serviceWorker = {
      register: () => {
        console.log('🎭 [MOCK] Service Worker registered');
        return Promise.resolve({
          active: { state: 'activated' },
          ready: Promise.resolve(),
          pushManager: {
            getSubscription: () => {
              console.log('🎭 [MOCK] Checking existing subscription');
              return Promise.resolve(null); // Sempre null per permettere nuova subscription
            },
            subscribe: (options) => {
              console.log('🎭 [MOCK] Creating push subscription', options);
              return Promise.resolve({
                endpoint: 'mock://push-endpoint-' + Date.now(),
                toJSON: () => ({
                  endpoint: 'mock://push-endpoint-' + Date.now(),
                  keys: {
                    p256dh: 'mock-p256dh-key-' + Math.random().toString(36).substr(2, 9),
                    auth: 'mock-auth-key-' + Math.random().toString(36).substr(2, 9),
                  },
                }),
              });
            },
          },
        });
      },
      getRegistration: () => {
        console.log('🎭 [MOCK] Getting registration');
        return Promise.resolve({
          pushManager: {
            getSubscription: () => {
              console.log('🎭 [MOCK] Checking existing subscription');
              return Promise.resolve(null);
            },
            subscribe: (options) => {
              console.log('🎭 [MOCK] Creating push subscription', options);
              return Promise.resolve({
                endpoint: 'mock://push-endpoint-' + Date.now(),
                toJSON: () => ({
                  endpoint: 'mock://push-endpoint-' + Date.now(),
                  keys: {
                    p256dh: 'mock-p256dh-key-' + Math.random().toString(36).substr(2, 9),
                    auth: 'mock-auth-key-' + Math.random().toString(36).substr(2, 9),
                  },
                }),
              });
            },
          },
        });
      },
    };
  }

  // Simula invio push (per test diretti)
  window.mockSendPush = (userId, notification) => {
    console.log('📤 [MOCK] Sending push notification:', { userId, notification });

    setTimeout(
      () => {
        console.log('📥 [MOCK] Push notification received');
        new Notification(notification.title || 'Test Push', {
          body: notification.body || 'This is a test push notification',
          icon: notification.icon || '/icon-192x192.png',
          data: notification.data || {},
          ...notification,
        });
      },
      1000 + Math.random() * 2000
    ); // Delay casuale 1-3 secondi

    return Promise.resolve({ success: true, mock: true });
  };

  console.log('✅ [MOCK] Mock push notifications ready');
  console.log('💡 [MOCK] Use PushNotificationPanel to test subscription flow');
  console.log('💡 [MOCK] Use window.mockSendPush(userId, notification) for direct testing');
}

// Funzione per mostrare notifiche informative in development
function showDevNotification(message, type = 'info', duration = 5000) {
  // Rimuovi notifiche esistenti
  const existing = document.querySelectorAll('.dev-notification');
  existing.forEach((el) => el.remove());

  const notification = document.createElement('div');
  notification.className = 'dev-notification';

  const colors = {
    success: { bg: '#10b981', border: '#059669' },
    warning: { bg: '#f59e0b', border: '#d97706' },
    error: { bg: '#ef4444', border: '#dc2626' },
    info: { bg: '#3b82f6', border: '#2563eb' },
  };

  const color = colors[type] || colors.info;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${color.bg};
    border: 2px solid ${color.border};
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: opacity 0.3s ease;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 8px;">
      <div style="flex: 1; line-height: 1.4;">${message}</div>
      <button style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        opacity: 0.8;
      " onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;

  // Click per rimuovere
  notification.addEventListener('click', () => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  });

  document.body.appendChild(notification);

  // Auto-remove dopo duration
  if (duration > 0) {
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Elemento #root non trovato in index.html');
}

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Fix per PWA installate: usa scope relativo per permettere registrazione
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    const registrationOptions = {
      scope: isPWA ? './' : '/', // Scope relativo per PWA installate
    };

    navigator.serviceWorker
      .register('/sw.js', registrationOptions)
      .then((registration) => {
        console.log('✅ Service Worker registrato con successo:', {
          scope: registration.scope,
          isPWA,
          state: registration.active?.state || 'installing',
        });

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('🔄 Nuova versione del Service Worker disponibile');
                // You could show a notification to the user here
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ Errore nella registrazione del Service Worker:', error);
        // In PWA installate, logga più dettagli per debug
        if (isPWA) {
          console.error('❌ PWA Service Worker registration failed:', {
            error: error.message,
            isPWA: true,
            userAgent: navigator.userAgent,
          });
        }
      });
  });
} else {
  console.warn('⚠️ Service Worker non supportato da questo browser');
}

// Development utilities: Load backfill + push test functions
if (import.meta.env.DEV) {
  // Backfill utility
  import('./utils/backfillPublicIndex.js').then(module => {
    window.backfillPublicTournamentsIndex = module.backfillPublicTournamentsIndex;
    console.log('💡 Dev utility loaded: window.backfillPublicTournamentsIndex()');
  }).catch(err => console.warn('Could not load backfill utility:', err));
  
  // Push notification test utilities
  import('./utils/test-push-subscription.js').catch(err => 
    console.warn('Could not load push test utilities:', err)
  );
}

createRoot(container).render(
  <SecurityProvider>
    <NotificationProvider>
      <AppRouter />
    </NotificationProvider>
  </SecurityProvider>
);
