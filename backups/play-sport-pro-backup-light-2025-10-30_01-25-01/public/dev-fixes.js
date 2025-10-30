// Script per eliminare gli errori WebSocket durante lo sviluppo
// Inserisci questo nell'index.html per sopprimere gli errori WebSocket

(function () {
  // Sopprimi gli errori WebSocket se in development
  if (import.meta.env.DEV) {
    const originalError = console.error;
    console.error = function (...args) {
      const message = args[0];
      if (typeof message === "string") {
        // Filtra i messaggi di errore WebSocket
        if (
          message.includes("WebSocket connection") ||
          message.includes("failed to connect to websocket") ||
          (message.includes("vite") && message.includes("websocket"))
        ) {
          // Mostra un messaggio più friendly
          console.warn(
            "🔄 HMR WebSocket disconnesso - il reload manuale funziona comunque",
          );
          return;
        }
      }
      originalError.apply(console, args);
    };
  }
})();
