import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';

// Funzione per rilevare il sistema operativo
const getOperatingSystem = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'ios';
  }

  // Android detection
  if (/android/i.test(userAgent)) {
    return 'android';
  }

  // Windows detection
  if (/windows/i.test(userAgent)) {
    return 'windows';
  }

  // macOS detection
  if (/mac/i.test(userAgent)) {
    return 'macos';
  }

  // Linux detection
  if (/linux/i.test(userAgent)) {
    return 'linux';
  }

  return 'unknown';
};

// Istruzioni per installare la PWA
const PWA_INSTRUCTIONS = {
  ios: [
    '1. Tocca il pulsante di condivisione nella barra degli indirizzi',
    '2. Scorri verso il basso e seleziona "Aggiungi alla schermata Home"',
    '3. Tocca "Aggiungi" per confermare'
  ],
  android: [
    '1. Tocca il menu in alto a destra',
    '2. Seleziona "Aggiungi alla schermata home" o "Installa app"',
    '3. Tocca "Aggiungi" o "Installa" per confermare'
  ],
  windows: [
    '1. Clicca sull\'icona di installazione nella barra degli indirizzi',
    '2. Oppure clicca sul menu e seleziona "Installa Play Sport Pro"',
    '3. Segui le istruzioni per completare l\'installazione'
  ],
  macos: [
    '1. Clicca sull\'icona di condivisione nella barra degli indirizzi',
    '2. Seleziona "Aggiungi alla Dock"',
    '3. L\'app sarà disponibile nella tua Dock'
  ],
  linux: [
    '1. Clicca sull\'icona di installazione nella barra degli indirizzi',
    '2. Oppure usa il menu del browser per installare la PWA',
    '3. L\'app apparirà nel tuo launcher delle applicazioni'
  ],
  unknown: [
    '1. Cerca l\'opzione "Installa" o "Aggiungi alla schermata home" nel tuo browser',
    '2. Segui le istruzioni del browser per installare l\'app',
    '3. L\'app sarà disponibile come applicazione nativa'
  ]
};

export default function AppDownloadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [os, setOs] = useState('unknown');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    // Controlla se l'utente ha già ignorato il popup
    const dismissed = localStorage.getItem('app-download-modal-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Debug info iniziale
    const initialDebug = {
      userAgent: navigator.userAgent,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      navigatorStandalone: window.navigator.standalone,
      hasBeforeInstallPrompt: 'onbeforeinstallprompt' in window,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasGetInstalledRelatedApps: 'getInstalledRelatedApps' in window.navigator,
      timestamp: new Date().toISOString()
    };
    setDebugInfo(initialDebug);
    console.log('PWA Debug Info:', initialDebug);

    // Controlla se l'app è già installata
    const checkIfAppIsInstalled = async () => {
      try {
        if ('getInstalledRelatedApps' in navigator) {
          const relatedApps = await navigator.getInstalledRelatedApps();
          const isInstalled = relatedApps.some(app => app.id === 'com.playsportpro.app' || app.url.includes('m-padelweb.web.app'));
          console.log('Related apps check:', relatedApps, 'Is installed:', isInstalled);
          setDebugInfo(prev => ({ ...prev, isAppInstalled: isInstalled, relatedApps }));
          return isInstalled;
        }
      } catch (error) {
        console.error('Error checking installed apps:', error);
        setDebugInfo(prev => ({ ...prev, checkInstalledError: error.message }));
      }
      return false;
    };

    checkIfAppIsInstalled();

    // Cattura l'evento beforeinstallprompt per PWA - sia direttamente che dal service worker
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event captured directly:', e);
      // Previene il prompt automatico del browser
      e.preventDefault();
      // Salva l'evento per usarlo dopo
      setDeferredPrompt(e);
      setDebugInfo(prev => ({ ...prev, promptCaptured: true, promptEvent: e, source: 'direct' }));
    };

    // Ascolta messaggi dal service worker
    const handleServiceWorkerMessage = (e) => {
      if (e.data && e.data.type === 'BEFORE_INSTALL_PROMPT') {
        console.log('beforeinstallprompt event received from service worker:', e.data.promptEvent);
        // Il service worker ha inoltrato l'evento
        setDeferredPrompt(e.data.promptEvent);
        setDebugInfo(prev => ({ ...prev, promptCaptured: true, promptEvent: e.data.promptEvent, source: 'service_worker' }));
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    // Rileva il sistema operativo
    const detectedOs = getOperatingSystem();
    setOs(detectedOs);

    // Mostra il popup dopo 2 secondi se non è già stato ignorato
    const timer = setTimeout(() => {
      // Controlla se siamo in modalità standalone (PWA già installata)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true;

      console.log('Checking if should show modal:', { isStandalone, deferredPrompt: !!deferredPrompt });

      // Non mostrare se è già una PWA installata
      if (!isStandalone) {
        setIsOpen(true);
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  const handleDownload = async () => {
    console.log('Install button clicked');
    console.log('Deferred prompt available:', !!deferredPrompt);
    console.log('Debug info:', debugInfo);

    // Se abbiamo il prompt di installazione PWA, mostralo
    if (deferredPrompt) {
      try {
        console.log('Showing install prompt...');
        // Mostra il prompt di installazione
        const result = deferredPrompt.prompt();
        console.log('Prompt result:', result);

        // Aspetta la risposta dell'utente
        const { outcome } = await deferredPrompt.userChoice;
        console.log('User choice outcome:', outcome);

        // Resetta il prompt dopo l'uso
        setDeferredPrompt(null);

        // Chiudi il modal
        setIsOpen(false);

        // Log dell'esito per debug
        console.log('Install prompt outcome:', outcome);

        // Se l'utente ha accettato, possiamo considerare l'app installata
        if (outcome === 'accepted') {
          console.log('PWA install accepted');
          alert('Installazione avviata! L\'app dovrebbe apparire a breve.');
        } else {
          console.log('PWA install dismissed');
          alert('Installazione annullata dall\'utente.');
        }
      } catch (error) {
        console.error('Error showing install prompt:', error);
        alert('Errore durante l\'installazione: ' + error.message);
        // Fallback: chiudi il modal
        setIsOpen(false);
      }
    } else {
      // NESSUN PROMPT DISPONIBILE - Mostra istruzioni manuali
      console.log('No deferred prompt available - Chrome might have already shown the install banner or user dismissed it');
      
      // Mostra alert con istruzioni dettagliate
      const instructions = os === 'windows' 
        ? 'Per installare l\'app:\n\n1. Clicca sull\'icona ⊕ nella barra degli indirizzi (a destra)\n2. Oppure: Menu Chrome (⋮) → "Installa Play Sport Pro..."\n3. Clicca "Installa" nella finestra popup\n\nSe non vedi queste opzioni, Chrome potrebbe aver già mostrato il banner di installazione che hai chiuso. In tal caso, prova a:\n- Svuotare la cache (Ctrl+Shift+Del)\n- Riaprire il sito in modalità incognito'
        : 'Per installare l\'app:\n\n1. Tocca il menu del browser\n2. Seleziona "Aggiungi alla schermata home" o "Installa app"\n3. Conferma l\'installazione';
      
      alert(instructions);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setIsDismissed(true);
    localStorage.setItem('app-download-modal-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setIsOpen(false);
    // Rimanda il popup tra 7 giorni
    setTimeout(() => {
      setIsOpen(true);
    }, 7 * 24 * 60 * 60 * 1000);
  };

  const getOsInfo = () => {
    switch (os) {
      case 'ios':
        return {
          name: 'iOS',
          icon: '📱',
          color: 'from-gray-800 to-gray-900',
        };
      case 'android':
        return {
          name: 'Android',
          icon: '🤖',
          color: 'from-green-600 to-green-700',
        };
      case 'windows':
        return {
          name: 'Windows',
          icon: '🪟',
          color: 'from-blue-600 to-blue-700',
        };
      default:
        return {
          name: 'Dispositivo',
          icon: '📱',
          color: 'from-gray-600 to-gray-700',
        };
    }
  };

  const osInfo = getOsInfo();

  if (isDismissed || !isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDismiss}
      title=""
      size="sm"
      closeOnOverlayClick={false}
    >
      <div className="text-center">
        {/* Icona del dispositivo */}
        <div className={`w-20 h-20 bg-gradient-to-br ${osInfo.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
          <span className="text-4xl">{osInfo.icon}</span>
        </div>

        {/* Titolo */}
        <h2 className="text-2xl font-bold text-white mb-3">
          Installa l'App Play Sport Pro
        </h2>

        {/* Descrizione */}
        <p className="text-gray-300 mb-6 leading-relaxed">
          Trasforma il portale in un'app nativa sul tuo dispositivo.
          Clicca "Installa ora" per avviare l'installazione automatica:
        </p>

        {/* Istruzioni PWA */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <p className="text-gray-300 text-sm mb-3 text-center">
            Su alcuni dispositivi l'installazione avviene automaticamente.
            Se necessario, segui questi passi:
          </p>
          <div className="space-y-3">
            {PWA_INSTRUCTIONS[os]?.map((instruction, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <span className="text-gray-300 text-sm leading-relaxed">{instruction}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-400 mb-2">Debug Info:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>
              Prompt disponibile:{' '}
              <span className={deferredPrompt ? 'text-green-400' : 'text-red-400'}>
                {deferredPrompt ? 'Sì' : 'No'}
              </span>
            </div>
            <div>
              Browser supporta PWA:{' '}
              <span className={debugInfo.hasBeforeInstallPrompt ? 'text-green-400' : 'text-red-400'}>
                {debugInfo.hasBeforeInstallPrompt ? 'Sì' : 'No'}
              </span>
            </div>
            <div>
              Service Worker:{' '}
              <span className={debugInfo.hasServiceWorker ? 'text-green-400' : 'text-red-400'}>
                {debugInfo.hasServiceWorker ? 'Sì' : 'No'}
              </span>
            </div>
            <div>
              Modal catturato:{' '}
              <span className={debugInfo.promptCaptured ? 'text-green-400' : 'text-red-400'}>
                {debugInfo.promptCaptured ? 'Sì' : 'No'}
              </span>
            </div>
            <div>
              Fonte evento: <span className="text-blue-400">{debugInfo.source || 'Nessuna'}</span>
            </div>
            <div>
              App già installata:{' '}
              <span className={debugInfo.isAppInstalled ? 'text-yellow-400' : 'text-green-400'}>
                {debugInfo.isAppInstalled ? 'Sì' : 'No'}
              </span>
            </div>
            <div>
              Modalità standalone:{' '}
              <span className={debugInfo.isStandalone ? 'text-yellow-400' : 'text-green-400'}>
                {debugInfo.isStandalone ? 'Sì' : 'No'}
              </span>
            </div>
            <div>OS: {os}</div>
            {debugInfo.checkInstalledError && (
              <div className="text-red-400">Errore check: {debugInfo.checkInstalledError}</div>
            )}
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-yellow-400 text-xs">
                💡 Se il prompt non appare, cerca l'icona ⊕ nella barra degli indirizzi di Chrome
              </p>
            </div>
          </div>
        </div>

        {/* Pulsanti */}
        <div className="space-y-3">
          <button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Installa ora
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleRemindLater}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Ricordamelo dopo
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-gray-400 py-3 px-4 rounded-lg font-medium transition-colors text-sm"
            >
              Non mostrare più
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-4">
          Puoi installare l'app più tardi seguendo le stesse istruzioni
        </p>
      </div>
    </Modal>
  );
}