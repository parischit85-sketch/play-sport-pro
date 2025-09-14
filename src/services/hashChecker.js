// Hash Checker Service - Rileva cambiamenti negli asset e forza reload
class HashChecker {
  constructor() {
    this.currentHash = null;
    this.checkInterval = null;
    this.isChecking = false;
  }

  // Estrae l'hash degli asset dal DOM
  extractCurrentHash() {
    try {
      // Cerca nei link CSS
      const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
      for (const link of cssLinks) {
        const match = link.href.match(/assets\/index-([^-]+)-/);
        if (match) {
          return match[1];
        }
      }

      // Cerca negli script JS
      const scripts = document.querySelectorAll('script[src*="/assets/"]');
      for (const script of scripts) {
        const match = script.src.match(/assets\/[^-]+-([^-]+)-/);
        if (match) {
          return match[1];
        }
      }

      // Cerca nel HTML stesso per gli asset buildati
      const html = document.documentElement.outerHTML;
      const hashMatch = html.match(/assets\/index-([a-z0-9]+)-/);
      if (hashMatch) {
        return hashMatch[1];
      }

      return null;
    } catch (error) {
      console.error("[HashChecker] Error extracting hash:", error);
      return null;
    }
  }

  // Inizializza il controllo hash
  init() {
    // TEMPORANEAMENTE DISABILITATO per evitare refresh continui
    console.log("[HashChecker] Temporarily disabled to prevent refresh loops");
    return;
  }

  // Controlla se ci sono aggiornamenti
  async checkForUpdates() {
    try {
      if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
        return;
      }

      // Chiede al Service Worker di controllare l'hash
      const channel = new MessageChannel();

      return new Promise((resolve) => {
        channel.port1.onmessage = (event) => {
          const { hashMismatch, currentHash, clientHash } = event.data;

          if (hashMismatch) {
            console.log("[HashChecker] Hash mismatch detected!");
            console.log("Client hash:", clientHash);
            console.log("SW hash:", currentHash);
            this.handleHashMismatch();
          }

          resolve(event.data);
        };

        navigator.serviceWorker.controller.postMessage(
          {
            type: "CHECK_HASH",
            hash: this.currentHash,
          },
          [channel.port2],
        );
      });
    } catch (error) {
      console.error("[HashChecker] Update check failed:", error);
    }
  }

  // Gestisce quando viene rilevato un hash diverso
  handleHashMismatch() {
    // Pulisci la cache e ricarica
    this.clearCacheAndReload();
  }

  // Pulisce la cache e ricarica la pagina
  async clearCacheAndReload() {
    try {
      console.log("[HashChecker] Clearing cache and reloading...");

      // Pulisci tutte le cache
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        );
      }

      // Notifica il Service Worker di pulire anche le sue cache
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => {
          // Aspetta un momento per la pulizia cache, poi ricarica
          setTimeout(() => {
            window.location.reload(true);
          }, 500);
        };

        navigator.serviceWorker.controller.postMessage(
          { type: "CLEAR_CACHE" },
          [channel.port2],
        );
      } else {
        // Fallback: ricarica diretta
        setTimeout(() => {
          window.location.reload(true);
        }, 500);
      }
    } catch (error) {
      console.error("[HashChecker] Cache clear failed:", error);
      // Fallback: ricarica comunque
      window.location.reload(true);
    }
  }

  // Ferma il controllo
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isChecking = false;
  }

  // Forza un controllo immediato
  async forceCheck() {
    return this.checkForUpdates();
  }
}

// Istanza singleton
const hashChecker = new HashChecker();

export default hashChecker;
