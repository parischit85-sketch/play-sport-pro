// =============================================
// FILE: src/main.jsx
// =============================================
import React from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import AppRouter from './router/AppRouter.jsx';
import updateService from './services/updateService.js';
import hashChecker from './services/hashChecker.js';
// import { initSentry } from './lib/sentry.js';
import { initializeGA } from './lib/analytics.js';
import { initWebVitals } from './lib/web-vitals.js';
import SecurityProvider from './contexts/SecurityContext.jsx';

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
  // Assicura che nessun vecchio service worker resti attivo in dev
  import('./utils/unregister-sw-dev.js');
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
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      // Inizializza il servizio di aggiornamenti
      // Initialize services
      updateService.init();
      hashChecker.init();
      console.log('✅ Update Service initialized');
    } catch (error) {
      console.error('❌ Update Service failed:', error);
    }
  });
} else {
  console.log('🔧 Service Worker disabled in development mode');
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Elemento #root non trovato in index.html');
}

createRoot(container).render(
  <SecurityProvider>
    <AppRouter />
  </SecurityProvider>
);
