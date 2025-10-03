// Utility per assicurarsi che nessun Service Worker interferisca in sviluppo
// Rimuove tutti i service worker registrati e svuota le cache note.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => {
      console.log('[DEV] Unregister SW:', reg.scope);
      reg.unregister();
    });
  });

  if (window.caches) {
    caches.keys().then((keys) => {
      keys.forEach((k) => {
        if (/paris-league-v/i.test(k)) {
          console.log('[DEV] Delete cache:', k);
          caches.delete(k);
        }
      });
    });
  }
}

export {}; // modulo vuoto
