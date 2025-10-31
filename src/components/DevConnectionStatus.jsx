// Development Connection Status Component
import React, { useState, useEffect } from 'react';

export default function DevConnectionStatus() {
  const [wsConnected, setWsConnected] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Solo in development
    if (import.meta.env.DEV) {
      let reconnectAttempts = 0;
      const maxAttempts = 3;

      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      // Usa la stessa porta dell'app (location.port) oppure variabile di override
      const defaultPort = window.location.port || '5173';
      const overridePort = import.meta.env.VITE_DEV_WS_PORT;
      const wsPort = overridePort || defaultPort;
      const host = window.location.hostname || 'localhost';

      const wsUrl = `${protocol}://${host}:${wsPort}`;

      const checkConnection = () => {
        let closed = false;
        try {
          const ws = new WebSocket(wsUrl);

          ws.onopen = () => {
            if (closed) return;
            setWsConnected(true);
            setShowStatus(false);
            reconnectAttempts = 0;
            ws.close(); // Non manteniamo aperta la connessione, serve solo probing
          };

          const handleFail = () => {
            if (closed) return;
            setWsConnected(false);
            if (reconnectAttempts < maxAttempts) {
              setShowStatus(true);
              reconnectAttempts++;
              setTimeout(checkConnection, 2500 * reconnectAttempts); // backoff incrementale
            }
          };

          ws.onerror = handleFail;
          ws.onclose = handleFail;
        } catch (error) {
          setWsConnected(false);
          setShowStatus(true);
        }
      };

      // Primo probe
      checkConnection();
    }
  }, []);

  // Non mostrare nulla in produzione o se tutto è connesso
  if (!import.meta.env.DEV || wsConnected || !showStatus) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-900/50 border border-yellow-600 rounded-lg p-3 shadow-lg z-50 max-w-sm">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
        <div className="text-sm">
          <div className="font-medium text-yellow-800 text-yellow-200">🔄 HMR Disconnesso</div>
          <div className="text-yellow-700 text-yellow-300 text-xs">
            Usa <kbd className="px-1 py-0.5 bg-yellow-800 rounded text-xs">F5</kbd> per refresh
            manuale
          </div>
        </div>
        <button
          onClick={() => setShowStatus(false)}
          className="ml-2 text-yellow-600 text-yellow-400 hover:text-yellow-800 hover:text-yellow-200"
        >
          ×
        </button>
      </div>
    </div>
  );
}
