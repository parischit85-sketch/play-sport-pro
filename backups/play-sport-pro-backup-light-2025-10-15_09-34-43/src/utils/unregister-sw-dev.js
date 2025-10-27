// Utility per assicurarsi che nessun Service Worker interferisca in sviluppo
// Rimuove tutti i service worker registrati e svuota le cache note.
// NON rimuove se ?enableSW è presente nell'URL
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const urlParams = new URLSearchParams(window.location.search);
  const enableSW = urlParams.has('enableSW');

  if (!enableSW) {
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
  } else {
    console.log('[DEV] SW enabled via ?enableSW, skipping unregister');
  }
}

export {}; // modulo vuoto
