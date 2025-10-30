// =============================================
// FILE: src/services/updateService.js
// Sistema di gestione aggiornamenti PWA
// =============================================

class UpdateService {
  constructor() {
    this.currentVersion = '1.8.0';
    this.swRegistration = null;
    this.updateCheckInterval = null;
  }

  // Inizializza il service worker e controlla aggiornamenti
  async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none', // Forza check aggiornamenti SW
        });

        console.log('[UpdateService] Service Worker registrato:', this.swRegistration.scope);

        // Controlla aggiornamenti ogni 15 secondi (più frequente)
        this.startUpdateCheck();

        // Ascolta messaggi dal SW
        navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));

        // Controlla se c'è un SW in attesa
        if (this.swRegistration.waiting) {
          this.showUpdateAvailable();
        }

        // Ascolta SW state changes
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable();
              }
            });
          }
        });
      } catch (error) {
        console.error('[UpdateService] Errore registrazione SW:', error);
      }
    }
  }

  // Controlla aggiornamenti periodicamente
  startUpdateCheck() {
    // Check immediato
    this.checkForUpdates();

    // Check ogni 15 secondi (più frequente)
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, 15000);
  }

  // Controlla se ci sono aggiornamenti disponibili
  async checkForUpdates() {
    if (this.swRegistration) {
      try {
        await this.swRegistration.update();
      } catch (error) {
        console.log('[UpdateService] Update check failed:', error);
      }
    }
  }

  // Gestisce messaggi dal Service Worker
  handleSWMessage(event) {
    const { data } = event;

    if (data.type === 'RELOAD_PAGE') {
      this.reloadPage();
    }
  }

  // Mostra notifica aggiornamento disponibile
  showUpdateAvailable() {
    // Mostra un banner/toast per informare l'utente
    const updateBanner = this.createUpdateBanner();
    document.body.appendChild(updateBanner);
  }

  // Crea banner di aggiornamento
  createUpdateBanner() {
    const banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;

    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span>Nuova versione disponibile!</span>
      </div>
      <button id="update-btn" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
      ">Aggiorna</button>
    `;

    // Gestisci click aggiornamento
    banner.querySelector('#update-btn').addEventListener('click', () => {
      this.applyUpdate();
      banner.remove();
    });

    return banner;
  }

  // Applica l'aggiornamento
  async applyUpdate() {
    if (this.swRegistration && this.swRegistration.waiting) {
      // Dice al SW di prendere il controllo
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    // Forza clear cache
    await this.clearCache();

    // Ricarica la pagina
    setTimeout(() => {
      this.reloadPage();
    }, 100);
  }

  // Pulisce tutte le cache
  async clearCache() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
        console.log('[UpdateService] Cache cleared');
      } catch (error) {
        console.error('[UpdateService] Cache clear failed:', error);
      }
    }

    // Anche tramite SW se disponibile
    if (this.swRegistration && this.swRegistration.active) {
      const messageChannel = new MessageChannel();
      this.swRegistration.active.postMessage({ type: 'CLEAR_CACHE' }, [messageChannel.port2]);
    }
  }

  // Ricarica la pagina forzando bypass cache
  reloadPage() {
    // Per mobile PWA
    if (window.location.reload) {
      window.location.reload(true);
    } else {
      // Fallback con cache busting
      const url = new URL(window.location);
      url.searchParams.set('_cb', Date.now());
      window.location.href = url.toString();
    }
  }

  // Forza aggiornamento manuale (per debug)
  async forceUpdate() {
    await this.clearCache();
    this.reloadPage();
  }

  // Cleanup
  destroy() {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }
  }
}

// Export singleton
export const updateService = new UpdateService();
export default updateService;
