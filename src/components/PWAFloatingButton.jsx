// =============================================
// FILE: src/components/PWAFloatingButton.jsx
// =============================================
import React, { useState } from 'react';
import { usePWA } from '../hooks/usePWA';

export default function PWAFloatingButton() {
  const { 
    isInstallable, 
    isInstalled, 
    installApp, 
    browserInfo, 
    installInstructions 
  } = usePWA();
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Non mostrare se già installata
  if (isInstalled) {
    return null;
  }

  // Non mostrare se non è installabile
  if (!isInstallable) {
    return null;
  }

  const handleInstallClick = async () => {
    // Se ci sono istruzioni specifiche, mostra il modal
    if (installInstructions && installInstructions.show) {
      setShowInstructionsModal(true);
      return;
    }

    // Altrimenti prova l'installazione automatica
    try {
      await installApp();
    } catch (error) {
      console.error('Install failed:', error);
      // Se fallisce e ci sono istruzioni, mostra il modal
      if (installInstructions && installInstructions.show) {
        setShowInstructionsModal(true);
      }
    }
  };

  const getButtonText = () => {
    if (browserInfo && browserInfo.isIOS) return '📱 Installa';
    if (browserInfo && browserInfo.isAndroid) return '🤖 Installa';
    return 'Installa App';
  };

  return (
    <>
      {/* Floating PWA Button - Solo mobile */}
      <div className="sm:hidden fixed right-4 bottom-20 z-[9999]">
        {!isMinimized ? (
          <div className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg backdrop-blur-sm">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium"
            >
              <svg 
                className="w-4 h-4" 
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
            
            {/* Pulsante minimizza */}
            <button
              onClick={() => setIsMinimized(true)}
              className="px-3 py-3 text-white/70 hover:text-white border-l border-white/20"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          // Versione minimizzata
          <button
            onClick={() => setIsMinimized(false)}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </button>
        )}
      </div>

      {/* Modal per istruzioni browser-specific */}
      {showInstructionsModal && installInstructions && installInstructions.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{installInstructions.icon || '📱'}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {installInstructions.title || 'Installa App'}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Segui questi passaggi per installare l'app:
              </p>

              {installInstructions.instructions && (
                <div className="text-left space-y-3 mb-6">
                  {installInstructions.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700">{instruction}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {browserInfo && !browserInfo.isIOS && !browserInfo.isFirefox && (
                  <button
                    onClick={async () => {
                      setShowInstructionsModal(false);
                      await installApp();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Prova Auto-Install
                  </button>
                )}
                
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors text-sm"
                >
                  Ho capito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
