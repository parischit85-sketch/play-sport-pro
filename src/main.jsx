// =============================================
// FILE: src/main.jsx
// =============================================
import React from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import AppRouter from './router/AppRouter.jsx';

// Development health check
if (import.meta.env.DEV) {
  import('./utils/health-check.js');
}

// Performance monitoring in production
if (import.meta.env.PROD) {
  // Add performance monitoring here if needed
  // Example: Web Vitals reporting
}

// PWA Service Worker Registration
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ SW registered: ', registration);
        
        // Gestione degli aggiornamenti del SW
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nuovo contenuto disponibile
              console.log('🔄 New content available! Please refresh.');
              // Qui puoi mostrare una notifica all'utente
            }
          });
        });
      })
      .catch((registrationError) => {
        console.log('❌ SW registration failed: ', registrationError);
      });
  });
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Elemento #root non trovato in index.html');
}

createRoot(container).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
