// =============================================
// FILE: src/components/PWAInstallButton.jsx
// =============================================
import React, { useState } from 'react';
import { usePWA } from '../hooks/usePWA';

export default function PWAInstallButton({ className = '' }) {
  const { 
    isInstallable, 
    isInstalled, 
    installApp, 
    browserInfo, 
    isPWASupported,
    installInstructions 
  } = usePWA();
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // Non mostrare se già installata
  if (isInstalled) {
    return (
      <div className={`flex items-center gap-2 text-green-600 text-sm ${className}`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        App già installata
      </div>
    );
  }

  // Non mostrare se PWA non è supportato
  if (!isPWASupported) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        Browser non supportato per PWA
      </div>
    );
  }

  // Non mostrare se non è installabile
  if (!isInstallable) {
    return null;
  }

  const handleInstallClick = async () => {
    // Se il browser ha installInstructions, mostra il modal
    if (installInstructions.show) {
      setShowInstructionsModal(true);
      return;
    }

    // Altrimenti prova l'installazione automatica (Chrome, Edge, etc.)
    try {
      const success = await installApp();
      if (!success) {
        // Se fallisce, mostra comunque le istruzioni se disponibili
        if (installInstructions.show) {
          setShowInstructionsModal(true);
        }
      }
    } catch (error) {
      console.error('Install failed:', error);
      if (installInstructions.show) {
        setShowInstructionsModal(true);
      }
    }
  };

  // Testo del pulsante basato sul browser
  const getButtonText = () => {
    if (browserInfo.isIOS) return '📱 Installa su iPhone';
    if (browserInfo.isAndroid) return '🤖 Installa su Android';
    if (browserInfo.isFirefox) return '🦊 Installa con Firefox';
    return '💻 Installa App';
  };

  return (
    <>
      {/* Pulsante di installazione */}
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${className}`}
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" 
          />
        </svg>
        {getButtonText()}
      </button>

      {/* Modal per istruzioni browser-specific */}
      {showInstructionsModal && installInstructions.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">{installInstructions.icon}</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {installInstructions.title}
              </h3>
              
              <p className="text-gray-600 mb-6">
                Segui questi semplici passaggi per installare Paris League:
              </p>

              <div className="text-left space-y-4 mb-8">
                {installInstructions.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">{instruction}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Browser info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-600 text-center">
                  Browser rilevato: {browserInfo.isChrome ? 'Chrome' : 
                                   browserInfo.isFirefox ? 'Firefox' :
                                   browserInfo.isEdge ? 'Edge' :
                                   browserInfo.isSafari ? 'Safari' :
                                   browserInfo.isOpera ? 'Opera' :
                                   browserInfo.isSamsung ? 'Samsung Internet' : 'Altro'}
                  {browserInfo.isMobile && ' Mobile'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium transition-colors"
                >
                  Chiudi
                </button>
                {!browserInfo.isIOS && !browserInfo.isFirefox && (
                  <button
                    onClick={async () => {
                      setShowInstructionsModal(false);
                      await installApp();
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-lg"
                  >
                    Prova Auto-Install
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
