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
    // In localhost, evita il banner fastidioso
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[UpdateService] Aggiornamento disponibile rilevato (Banner nascosto in localhost)');
      return;
    }

    // Mostra un banner/toast per informare l'utente
    const updateBanner = this.createUpdateBanner();
    document.body.appendChild(updateBanner);
  }

  // Crea banner di aggiornamento (Popup modale)
  createUpdateBanner() {
    // Rimuovi eventuali banner esistenti
    const existing = document.getElementById('update-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'update-banner';

    // Overlay style
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: fadeIn 0.3s ease-out;
    `;

    // Add keyframes for animation if not present
    if (!document.getElementById('update-keyframes')) {
      const style = document.createElement('style');
      style.id = 'update-keyframes';
      style.innerHTML = `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `;
      document.head.appendChild(style);
    }

    banner.innerHTML = `
      <div style="
        background: white;
        padding: 24px;
        border-radius: 16px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        width: 90%;
        max-width: 320px;
        text-align: center;
        animation: slideUp 0.3s ease-out;
        border: 1px solid rgba(0,0,0,0.1);
      ">
        <div style="
          width: 48px;
          height: 48px;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
        ">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        
        <h3 style="
          margin: 0 0 8px 0;
          color: #111827;
          font-size: 18px;
          font-weight: 600;
        ">Aggiornamento Disponibile</h3>
        
        <p style="
          margin: 0 0 20px 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        ">È disponibile una nuova versione dell'app. Aggiorna per ottenere le ultime funzionalità.</p>
        
        <button id="update-btn" style="
          width: 100%;
          background: #2563eb;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        ">
          Aggiorna Ora
        </button>
      </div>
    `;

    // Gestisci click aggiornamento
    const btn = banner.querySelector('#update-btn');
    btn.addEventListener('click', () => {
      btn.innerHTML = 'Aggiornamento in corso...';
      btn.style.opacity = '0.7';
      this.applyUpdate();
      // Non rimuoviamo il banner subito per dare feedback visivo
    });

    // Hover effect via JS
    btn.addEventListener('mouseenter', () => (btn.style.background = '#1d4ed8'));
    btn.addEventListener('mouseleave', () => (btn.style.background = '#2563eb'));

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
