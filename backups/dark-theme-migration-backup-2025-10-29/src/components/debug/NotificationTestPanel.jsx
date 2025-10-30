// =============================================
// FILE: src/components/debug/NotificationTestPanel.jsx
// Dev panel to manually trigger different notification types and a fake geolocation flow
// =============================================
import React from 'react';
import { useUI } from '@contexts/UIContext.jsx';
import { getUserLocation, LocationStatus } from '../../utils/location-service.js';

export default function NotificationTestPanel() {
  const { addNotification } = useUI();
  const [running, setRunning] = React.useState(false);
  const [lastResult, setLastResult] = React.useState(null);

  const trigger = (type) => {
    const map = {
      success: { title: 'Operazione riuscita', message: 'Esempio notifica di successo.' },
      error: { title: 'Errore', message: 'Qualcosa è andato storto.' },
      warning: { title: 'Attenzione', message: 'Questa è una condizione da monitorare.' },
      info: { title: 'Informazione', message: 'Messaggio informativo di esempio.' },
    };
    addNotification({ type, ...map[type] });
  };

  const testGeo = async () => {
    setRunning(true);
    addNotification({
      type: 'info',
      title: 'Test Geolocalizzazione',
      message: 'Richiesta in corso...',
    });
    const result = await getUserLocation({ timeout: 4000, highAccuracy: false, cache: false });
    setLastResult(result);
    switch (result.status) {
      case LocationStatus.SUCCESS:
        addNotification({
          type: 'success',
          title: 'Posizione OK',
          message: `Lat: ${result.coords.lat.toFixed(4)} Lng: ${result.coords.lng.toFixed(4)}${result.cached ? ' (cache)' : ''}`,
        });
        break;
      case LocationStatus.PERMISSION_DENIED:
        addNotification({
          type: 'warning',
          title: 'Permesso negato',
          message: "L'utente ha negato l'autorizzazione.",
        });
        break;
      case LocationStatus.INSECURE_CONTEXT:
        addNotification({
          type: 'error',
          title: 'Contesto non sicuro',
          message: 'Serve HTTPS per la geolocalizzazione.',
        });
        break;
      case LocationStatus.TIMEOUT:
        addNotification({
          type: 'warning',
          title: 'Timeout',
          message: 'Nessuna risposta entro il limite.',
        });
        break;
      case LocationStatus.POSITION_UNAVAILABLE:
        addNotification({
          type: 'error',
          title: 'Non disponibile',
          message: 'Posizione non ottenibile.',
        });
        break;
      case LocationStatus.BLOCKED_BY_POLICY:
        addNotification({
          type: 'error',
          title: 'Policy',
          message: 'Bloccato da Permissions-Policy.',
        });
        break;
      default:
        addNotification({
          type: 'error',
          title: 'Errore',
          message: result.message || 'Errore sconosciuto.',
        });
    }
    setRunning(false);
  };

  return (
    <div className="p-4 mt-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
      <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
        Notification Test Panel
      </h3>
      <p className="text-xs mb-3 text-gray-500 dark:text-gray-400">
        Solo in DEV / super admin. Permette di testare rapidamente il sistema di notifiche e la
        pipeline geolocalizzazione.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => trigger('success')}
          className="px-3 py-1 rounded bg-green-600 text-white text-sm"
        >
          Success
        </button>
        <button
          onClick={() => trigger('error')}
          className="px-3 py-1 rounded bg-red-600 text-white text-sm"
        >
          Error
        </button>
        <button
          onClick={() => trigger('warning')}
          className="px-3 py-1 rounded bg-yellow-500 text-black text-sm"
        >
          Warning
        </button>
        <button
          onClick={() => trigger('info')}
          className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
        >
          Info
        </button>
        <button
          disabled={running}
          onClick={testGeo}
          className="px-3 py-1 rounded bg-purple-600 disabled:opacity-50 text-white text-sm flex items-center gap-1"
        >
          {running && (
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          Test Geo
        </button>
      </div>
      {lastResult && (
        <pre className="text-[10px] bg-gray-900 text-green-300 p-2 rounded max-h-40 overflow-auto">
          {JSON.stringify(lastResult, null, 2)}
        </pre>
      )}
      <div className="mt-2 text-[10px] text-gray-400">
        Dispatch manuale test:{' '}
        <code>
          {
            "window.dispatchEvent(new CustomEvent('notify', {detail:{type:'info', message:'Test manuale'}}))"
          }
        </code>
      </div>
    </div>
  );
}
