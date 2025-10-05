// =============================================
// FILE: src/components/ui/PWAInstallPrompt.jsx
// Prompt completo per installazione PWA con permessi
// =============================================
import React, { useState, useEffect } from 'react';
import { usePWA } from '../../hooks/usePWA.js';
import { usePermissions } from '../../hooks/usePermissions.js';

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installApp, browserInfo, installInstructions } = usePWA();
  const {
    permissions,
    capabilities,
    requestAllPermissions,
    sendTestNotification,
    isLoading: permissionsLoading,
  } = usePermissions();

  const [showPrompt, setShowPrompt] = useState(false);
  const [currentStep, setCurrentStep] = useState('install'); // 'install', 'permissions', 'complete'
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Mostra il prompt dopo 3 secondi se l'app non è installata
  useEffect(() => {
    const hasSeenToday = localStorage.getItem('pwa-prompt-date') === new Date().toDateString();

    if (!isInstalled && !hasSeenToday && isInstallable) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
        localStorage.setItem('pwa-install-prompt-shown', 'true');
        localStorage.setItem('pwa-prompt-date', new Date().toDateString());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstalled, isInstallable]);

  // Se già installata, controlla i permessi
  useEffect(() => {
    if (isInstalled && !permissions.notifications && !localStorage.getItem('permissions-requested')) {
      setCurrentStep('permissions');
      setShowPrompt(true);
    }
  }, [isInstalled, permissions.notifications]);

  const handleInstall = async () => {
    if (installInstructions?.show) {
      setShowInstructions(true);
      return;
    }

    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        setCurrentStep('permissions');
      }
    } catch (error) {
      console.error('Install error:', error);
      if (installInstructions?.show) {
        setShowInstructions(true);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleRequestPermissions = async () => {
    const results = await requestAllPermissions();
    console.log('✅ Permissions results:', results);

    // Invia notifica di test se concessa
    if (results.notifications) {
      await sendTestNotification(
        '🎾 Benvenuto in Play Sport Pro!',
        'Riceverai notifiche per prenotazioni, partite e aggiornamenti importanti.'
      );
    }

    localStorage.setItem('permissions-requested', 'true');
    setCurrentStep('complete');

    // Chiudi il prompt dopo 3 secondi
    setTimeout(() => {
      setShowPrompt(false);
    }, 3000);
  };

  const handleSkip = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-skipped', 'true');
    // Richiedi di nuovo tra 7 giorni
    setTimeout(
      () => {
        localStorage.removeItem('pwa-prompt-skipped');
        localStorage.removeItem('pwa-prompt-date');
      },
      7 * 24 * 60 * 60 * 1000
    );
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fadeIn">
        {/* Modal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  {currentStep === 'install' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                  )}
                  {currentStep === 'permissions' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  )}
                  {currentStep === 'complete' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {currentStep === 'install' && 'Installa Play Sport Pro'}
                    {currentStep === 'permissions' && 'Abilita i Permessi'}
                    {currentStep === 'complete' && 'Tutto Pronto! 🎉'}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {currentStep === 'install' && 'Accesso rapido e funzioni extra'}
                    {currentStep === 'permissions' && 'Per un\'esperienza completa'}
                    {currentStep === 'complete' && 'Configurazione completata'}
                  </p>
                </div>
              </div>
              {currentStep !== 'complete' && (
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Step: Install */}
            {currentStep === 'install' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">
                    {browserInfo?.isIOS ? '📱' : browserInfo?.isAndroid ? '🤖' : '💻'}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Installa l&apos;app per accedere rapidamente e godere di tutte le funzionalità anche
                    offline.
                  </p>
                </div>

                {/* Benefici */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Accesso istantaneo
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Apri l&apos;app direttamente dalla home screen
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Funziona offline
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Visualizza dati e statistiche senza connessione
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Notifiche in tempo reale
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Aggiornamenti su prenotazioni e partite
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Permissions */}
            {currentStep === 'permissions' && (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                  Per offrirti la migliore esperienza abbiamo bisogno di alcuni permessi:
                </p>

                {/* Permessi */}
                <div className="space-y-3">
                  {/* Notifiche */}
                  {capabilities.hasNotifications && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-2xl">🔔</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Notifiche</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Ricevi aggiornamenti su prenotazioni, partite e tornei
                        </p>
                      </div>
                      {permissions.notifications === 'granted' && (
                        <span className="text-green-600 dark:text-green-400">✓</span>
                      )}
                    </div>
                  )}

                  {/* Geolocalizzazione */}
                  {capabilities.hasGeolocation && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-2xl">📍</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Posizione</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Trova i campi più vicini a te
                        </p>
                      </div>
                      {permissions.geolocation === 'granted' && (
                        <span className="text-green-600 dark:text-green-400">✓</span>
                      )}
                    </div>
                  )}

                  {/* Contatti */}
                  {capabilities.hasContacts && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-2xl">👥</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Contatti</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Invita facilmente gli amici a giocare
                        </p>
                      </div>
                      <span className="text-gray-400 text-sm">Opzionale</span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mt-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    ℹ️ Puoi modificare i permessi in qualsiasi momento dalle impostazioni del
                    browser
                  </p>
                </div>
              </div>
            )}

            {/* Step: Complete */}
            {currentStep === 'complete' && (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Sei pronto! 🎾
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Ora puoi goderti al meglio Play Sport Pro con tutte le funzionalità attive.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {currentStep !== 'complete' && (
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
              <div className="flex gap-3">
                {currentStep === 'install' && (
                  <>
                    <button
                      onClick={handleSkip}
                      className="flex-1 px-4 py-3 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors border border-gray-300 dark:border-gray-500"
                    >
                      Più tardi
                    </button>
                    <button
                      onClick={handleInstall}
                      disabled={isInstalling}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isInstalling ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Installazione...
                        </span>
                      ) : (
                        'Installa ora'
                      )}
                    </button>
                  </>
                )}

                {currentStep === 'permissions' && (
                  <>
                    <button
                      onClick={handleSkip}
                      className="flex-1 px-4 py-3 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors border border-gray-300 dark:border-gray-500"
                    >
                      Salta
                    </button>
                    <button
                      onClick={handleRequestPermissions}
                      disabled={permissionsLoading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
                    >
                      {permissionsLoading ? 'Richiesta...' : 'Consenti permessi'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && installInstructions?.show && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border dark:border-gray-600">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{installInstructions.icon || '📱'}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {installInstructions.title || 'Come installare'}
              </h3>
            </div>

            <div className="space-y-4 mb-6">
              {installInstructions.instructions?.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 pt-1">{instruction}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Ho capito
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
