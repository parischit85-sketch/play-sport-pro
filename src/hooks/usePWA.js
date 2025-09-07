// =============================================
// FILE: src/hooks/usePWA.js
// =============================================
import { useState, useEffect } from 'react';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({});

  useEffect(() => {
    // Rileva il browser e il sistema operativo
    const detectBrowser = () => {
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isMobile = isIOS || isAndroid || /Mobile|Tablet/.test(userAgent);
      
      const isChrome = /Chrome/.test(userAgent) && !/Edge|Edg/.test(userAgent);
      const isEdge = /Edge|Edg/.test(userAgent);
      const isFirefox = /Firefox/.test(userAgent);
      const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent);
      const isOpera = /OPR|Opera/.test(userAgent);
      const isSamsung = /SamsungBrowser/.test(userAgent);

      setBrowserInfo({
        isIOS,
        isAndroid,
        isMobile,
        isChrome,
        isEdge,
        isFirefox,
        isSafari,
        isOpera,
        isSamsung,
        supportsInstallPrompt: isChrome || isEdge || isSamsung || isOpera
      });
    };

    detectBrowser();

    // Controlla se l'app è già installata
    const checkIfInstalled = () => {
      // Verifica standalone mode (PWA installata)
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = window.navigator.standalone === true;
      const hasFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const hasMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      const installed = isInStandaloneMode || isIOSStandalone || hasFullscreen || hasMinimalUI;
      setIsInstalled(installed);
      
      if (installed) {
        console.log('✅ PWA is already installed');
      }
    };

    checkIfInstalled();

    // Gestisce l'evento beforeinstallprompt (Chrome, Edge, Samsung, Opera)
    const handleBeforeInstallPrompt = (event) => {
      console.log('🚀 PWA installation prompt ready');
      event.preventDefault();
      setDeferredPrompt(event);
      setIsInstallable(true);
    };

    // Gestisce l'evento appinstalled
    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      // Salva stato di installazione nel localStorage
      localStorage.setItem('pwa_installed', 'true');
    };

    // Ascolta gli eventi solo se il browser li supporta
    if (browserInfo.supportsInstallPrompt) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [browserInfo.supportsInstallPrompt]);

  // Funzione per installare l'app
  const installApp = async () => {
    if (!deferredPrompt) {
      console.warn('⚠️ No deferred prompt available');
      return false;
    }

    try {
      // Mostra il prompt di installazione
      deferredPrompt.prompt();

      // Aspetta la scelta dell'utente
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted PWA installation');
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('❌ User declined PWA installation');
        return false;
      }
    } catch (error) {
      console.error('❌ PWA installation failed:', error);
      return false;
    }
  };

  // Istruzioni specifiche per browser
  const getBrowserSpecificInstructions = () => {
    const { isIOS, isAndroid, isSafari, isFirefox, isChrome, isEdge } = browserInfo;
    
    // iOS Safari
    if (isIOS && isSafari) {
      return {
        show: true,
        title: 'Installa su iPhone/iPad',
        icon: '📱',
        instructions: [
          'Tocca il pulsante Condividi in basso',
          'Scorri verso il basso e tocca "Aggiungi alla schermata Home"',
          'Tocca "Aggiungi" nell\'angolo in alto a destra',
          'L\'app apparirà nella tua home screen'
        ]
      };
    }
    
    // Firefox (desktop e mobile)
    if (isFirefox) {
      return {
        show: true,
        title: 'Installa con Firefox',
        icon: '🦊',
        instructions: isAndroid ? [
          'Tocca il menu (3 punti) in alto a destra',
          'Seleziona "Installa"',
          'Conferma toccando "Aggiungi"'
        ] : [
          'Clicca sull\'icona più (+) nella barra degli indirizzi',
          'Seleziona "Installa questa app"',
          'Conferma cliccando "Installa"'
        ]
      };
    }
    
    // Android Chrome/Edge/Samsung
    if (isAndroid && (isChrome || isEdge)) {
      return {
        show: true,
        title: 'Installa su Android',
        icon: '🤖',
        instructions: [
          'Tocca il menu (3 punti) in alto a destra',
          'Seleziona "Installa app" o "Aggiungi alla schermata Home"',
          'Conferma toccando "Installa"',
          'L\'app verrà aggiunta alla home screen'
        ]
      };
    }

    // Desktop Chrome/Edge
    if (!browserInfo.isMobile && (isChrome || isEdge)) {
      return {
        show: true,
        title: 'Installa sul Desktop',
        icon: '💻',
        instructions: [
          'Clicca sull\'icona "Installa" nella barra degli indirizzi',
          'Oppure apri il menu (3 punti) → "Installa Paris League"',
          'Conferma cliccando "Installa"',
          'L\'app apparirà nel menu Start/Applicazioni'
        ]
      };
    }
    
    return { show: false, instructions: [] };
  };

  // Controlla se il browser supporta PWA
  const isPWASupported = () => {
    return 'serviceWorker' in navigator && 
           'Cache' in window && 
           'caches' in window &&
           'PushManager' in window;
  };

  // Controlla se è possibile mostrare il pulsante di installazione
  const shouldShowInstallButton = () => {
    if (isInstalled) return false;
    
    // Mostra sempre per iOS Safari
    if (browserInfo.isIOS && browserInfo.isSafari) return true;
    
    // Mostra se c'è il prompt differito
    if (isInstallable && deferredPrompt) return true;
    
    // Mostra per Firefox (che non ha beforeinstallprompt)
    if (browserInfo.isFirefox) return true;
    
    // Nascondi per browser non supportati
    return false;
  };

  return {
    isInstallable: shouldShowInstallButton(),
    isInstalled,
    installApp,
    browserInfo,
    isPWASupported: isPWASupported(),
    installInstructions: getBrowserSpecificInstructions()
  };
}
