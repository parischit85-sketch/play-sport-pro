// =============================================
// FILE: src/pages/PushNotificationsTestPage.jsx
// DESCRIPTION: Pagina dedicata per testare le notifiche push
// =============================================

import React from 'react';
import { useAuth } from '@contexts/AuthContext.jsx';
import NativePushTestPanel from '@components/debug/NativePushTestPanel.jsx';

const PushNotificationsTestPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔔 Test Notifiche Push
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Prova le notifiche push su questa piattaforma (Web/Android/iOS)
          </p>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💻</span>
              <h3 className="font-semibold text-blue-900 dark:text-blue-400">
                Web Push (Desktop)
              </h3>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Funziona su Chrome, Firefox, Edge desktop. Richiede HTTPS (o localhost).
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📱</span>
              <h3 className="font-semibold text-green-900 dark:text-green-400">
                Android (FCM)
              </h3>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Richiede APK buildato. Funziona in foreground, background e app chiusa.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🍎</span>
              <h3 className="font-semibold text-purple-900 dark:text-purple-400">
                iOS (APNs)
              </h3>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Richiede Apple Developer Account ($99/anno) e configurazione APNs.
            </p>
          </div>
        </div>

        {/* Test Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <NativePushTestPanel />
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-400 mb-3">
                Come testare le notifiche
              </h3>
              
              <div className="space-y-4 text-sm text-yellow-800 dark:text-yellow-300">
                <div>
                  <h4 className="font-semibold mb-2">1. Web Push (Locale - Disponibile ORA)</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Clicca "Iscriviti alle Notifiche" sopra</li>
                    <li>Accetta il permesso nel browser</li>
                    <li>Clicca "Invia Notifica di Test"</li>
                    <li>Dovresti vedere la notifica in alto a destra (desktop)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. Android FCM (Richiede APK)</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Completa configurazione Android (vedi ANDROID_CONFIG_REQUIRED.md)</li>
                    <li>Esegui: <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">.\deploy-native-push.ps1</code></li>
                    <li>Builda APK in Android Studio</li>
                    <li>Installa APK su device fisico</li>
                    <li>Apri questa pagina nell'app</li>
                    <li>Clicca "Iscriviti alle Notifiche"</li>
                    <li>Testa notifiche con app aperta, in background, e chiusa</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">3. iOS APNs (Richiede Setup)</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Acquista Apple Developer Account ($99/anno)</li>
                    <li>Genera certificato APNs</li>
                    <li>Configura Firebase per iOS</li>
                    <li>Builda app iOS</li>
                    <li>Testa su device fisico iOS</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {currentUser && (
          <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Debug Info
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>User ID:</strong> {currentUser.uid}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Platform:</strong> {navigator.platform}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 60)}...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PushNotificationsTestPage;
