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
// Registrato sia in development che in production (necessario per push notifications)
window.addEventListener('load', async () => {
  try {
    // Inizializza il servizio di aggiornamenti
    updateService.init();
    hashChecker.init();
    
    if (import.meta.env.DEV) {
      console.log('🔧 Service Worker enabled in development mode (for push notifications)');
    } else {
      console.log('✅ Update Service initialized');
    }
  } catch (error) {
    console.error('❌ Update Service failed:', error);
  }
});

const container = document.getElementById('root');
if (!container) {
  throw new Error('Elemento #root non trovato in index.html');
}

createRoot(container).render(
  <SecurityProvider>
    <AppRouter />
  </SecurityProvider>
);
