// =============================================
// FILE: src/main.jsx
// =============================================
import React from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import AppRouter from './router/AppRouter.jsx';
import updateService from './services/updateService.js';

// PWA web application initialization

// Development health check
if (import.meta.env.DEV) {
  import('./utils/health-check.js');
}

// Performance monitoring in production
if (import.meta.env.PROD) {
  // Add performance monitoring here if needed
  // Example: Web Vitals reporting
}

// PWA Service Worker e Update Service
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Inizializza il servizio di aggiornamenti
      await updateService.init();
      console.log('✅ Update Service initialized');
    } catch (error) {
      console.error('❌ Update Service failed:', error);
    }
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
