// =============================================
// FILE: src/features/mobile/PWAInstallPrompt.jsx
// Custom install prompt per Progressive Web App
// =============================================

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';

/**
 * PWA Install Prompt Component
 * 
 * Mostra banner personalizzato per installare l'app
 * Supporta:
 * - Android Chrome (A2HS)
 * - iOS Safari (istruzioni manuali)
 * - Desktop Chrome/Edge
 * - Dismissable con localStorage
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Rileva iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iOS);

    // Rileva se già installata (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Controlla se già dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedDate = dismissed ? new Date(dismissed) : null;
    const daysSinceDismiss = dismissedDate
      ? (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    // Mostra dopo 2 visite o se sono passati 7 giorni dall'ultimo dismiss
    const visitCount = parseInt(localStorage.getItem('visit-count') || '0', 10);
    localStorage.setItem('visit-count', String(visitCount + 1));

    const shouldShow = !standalone && (visitCount >= 2 || daysSinceDismiss > 7);

    // Listener per beforeinstallprompt (Android/Desktop)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      if (shouldShow && !dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Mostra prompt iOS se applicabile
    if (iOS && shouldShow && !dismissed && !standalone) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // iOS - mostra istruzioni
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    // Android/Desktop - usa native prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`PWA install outcome: ${outcome}`);
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Banner Install Prompt */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl animate-slide-up">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              {isIOS ? (
                <Smartphone className="w-6 h-6 text-blue-600" />
              ) : (
                <Download className="w-6 h-6 text-blue-600" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-sm md:text-base">
                Installa Play-Sport.pro
              </h3>
              <p className="text-xs md:text-sm text-blue-100 mt-0.5">
                Accesso rapido e notifiche push
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors"
            >
              Installa
            </button>
            
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal istruzioni iOS */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Installa su iOS
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Segui questi passaggi per installare l'app
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    Tocca il pulsante <strong>Condividi</strong> 
                    <span className="inline-block mx-1 text-blue-600">⎙</span> 
                    in basso
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    Scorri e seleziona <strong>"Aggiungi a Home"</strong>
                    <span className="inline-block ml-1 text-blue-600">+</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    Tocca <strong>"Aggiungi"</strong> in alto a destra
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Ho capito
            </button>
          </div>
        </div>
      )}

      {/* Inline styles per animazione */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

/**
 * Hook per rilevare se app è installata
 */
export function useIsInstalled() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone === true;
    setIsInstalled(standalone);
  }, []);

  return isInstalled;
}

/**
 * Hook per stato PWA
 */
export function usePWAState() {
  const [state, setState] = useState({
    isInstalled: false,
    canInstall: false,
    isIOS: false,
    isOnline: navigator.onLine,
  });

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(userAgent);
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone === true;

    setState(prev => ({
      ...prev,
      isIOS: iOS,
      isInstalled: standalone,
    }));

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setState(prev => ({ ...prev, canInstall: true }));
    };

    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return state;
}
