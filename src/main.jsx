// =============================================
// FILE: src/main.jsx
// =============================================
import React from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import AppRouter from "./router/AppRouter.jsx";
import updateService from "./services/updateService.js";
import hashChecker from "./services/hashChecker.js";

// PWA web application initialization

// Development health check
if (import.meta.env.DEV) {
  import("./utils/health-check.js");
  // Assicura che nessun vecchio service worker resti attivo in dev
  import("./utils/unregister-sw-dev.js");
}

// Performance monitoring in production
if (import.meta.env.PROD) {
  // Add performance monitoring here if needed
  // Example: Web Vitals reporting
}

// PWA Service Worker e Update Service
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", async () => {
    try {
      // Inizializza il servizio di aggiornamenti
      // Initialize services
      updateService.init();
      hashChecker.init();
      console.log("✅ Update Service initialized");
    } catch (error) {
      console.error("❌ Update Service failed:", error);
    }
  });
} else {
  console.log("🔧 Service Worker disabled in development mode");
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Elemento #root non trovato in index.html");
}

createRoot(container).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);
