import React, { useState, useEffect } from 'react';
import { usePWA } from '../../hooks/usePWA.js';

export default function PWABanner({ className = '' }) {
  const { isInstallable, isInstalled, installApp, browserInfo, installInstructions } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  if (isInstalled || isDismissed || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    if (installInstructions?.show) {
      setShowInstructionsModal(true);
      return;
    }

    try {
      const success = await installApp();
      if (success) {
        setIsDismissed(true);
      }
    } catch (error) {
      console.error('Install failed:', error);
      if (installInstructions?.show) {
        setShowInstructionsModal(true);
      }
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
    setTimeout(() => {
      localStorage.removeItem('pwa-banner-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  const getBrowserSpecificText = () => {
    if (browserInfo?.isIOS) return '📱 Installa su iPhone/iPad';
    if (browserInfo?.isAndroid) return '🤖 Installa su Android';
    if (browserInfo?.isFirefox) return '🦊 Installa con Firefox';
    if (browserInfo?.isMobile) return '📱 Installa App Mobile';
    return '💻 Installa App Desktop';
  };

  return (
    <>
      <div className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg ${className}`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-white mb-1">
                  {getBrowserSpecificText()}
                </h3>
                <p className="text-blue-100 text-sm">
                  {browserInfo?.isMobile 
                    ? 'Aggiungila alla home screen per accesso rapido'
                    : 'Installala sul desktop per un\'esperienza app nativa'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstall}
                className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                {installInstructions?.show ? 'Come installare' : 'Installa ora'}
              </button>
              
              <button
                onClick={handleDismiss}
                className="text-blue-100 hover:text-white p-2 transition-colors"
                title="Nascondi banner"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showInstructionsModal && installInstructions?.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">{installInstructions.icon || '📱'}</span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {installInstructions.title || 'Installa App'}
              </h3>
              
              <p className="text-gray-600 mb-6">Segui questi semplici passaggi:</p>

              {installInstructions.instructions && (
                <div className="text-left space-y-4 mb-8">
                  {installInstructions.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 pt-1">{instruction}</p>
                    </div>
                  ))}
                </div>
              )}

              {browserInfo && (
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <p className="text-xs text-gray-600 text-center">
                    Browser: {browserInfo.isChrome ? 'Chrome' : 
                             browserInfo.isFirefox ? 'Firefox' :
                             browserInfo.isEdge ? 'Edge' :
                             browserInfo.isSafari ? 'Safari' :
                             browserInfo.isOpera ? 'Opera' :
                             browserInfo.isSamsung ? 'Samsung Internet' : 'Altro'}
                    {browserInfo.isMobile ? ' Mobile' : ''}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Ho capito
                </button>
                {browserInfo && !browserInfo.isIOS && !browserInfo.isFirefox && (
                  <button
                    onClick={async () => {
                      setShowInstructionsModal(false);
                      await installApp();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
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
