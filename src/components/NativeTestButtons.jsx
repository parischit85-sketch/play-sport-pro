import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { 
  PushNotifications 
} from '@capacitor/push-notifications';
import { 
  Geolocation 
} from '@capacitor/geolocation';
import { 
  Haptics, 
  ImpactStyle 
} from '@capacitor/haptics';
import { 
  Share 
} from '@capacitor/share';

export default function NativeTestButtons() {
  const [testResults, setTestResults] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);

  // Test Notifiche Push
  const testPushNotifications = async () => {
    try {
      setTestResults(prev => ({ ...prev, notifications: 'testing' }));
      
      if (Capacitor.isNativePlatform()) {
        // Test richiesta permessi push notifications
        const result = await PushNotifications.requestPermissions();
        
        if (result.receive === 'granted') {
          // Vibrazione di feedback
          await Haptics.impact({ style: ImpactStyle.Light });
          
          setTestResults(prev => ({ 
            ...prev, 
            notifications: { 
              success: true, 
              message: 'Permessi notifiche concessi! Push notifications ready.',
              timestamp: new Date().toLocaleTimeString()
            }
          }));
        } else {
          throw new Error('Permessi notifiche negati');
        }
      } else {
        // Test per PWA
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification('Test Notifica - Play Sport Pro', {
              body: 'Le notifiche web funzionano! 🎾',
              icon: '/icons/icon-192x192.png'
            });
            
            setTestResults(prev => ({ 
              ...prev, 
              notifications: { 
                success: true, 
                message: 'Notifica web inviata con successo!',
                timestamp: new Date().toLocaleTimeString()
              }
            }));
          } else {
            throw new Error('Permessi notifiche non concessi');
          }
        } else {
          throw new Error('Notifiche non supportate in questo browser');
        }
      }
    } catch (error) {
      console.error('Errore test notifiche:', error);
      setTestResults(prev => ({ 
        ...prev, 
        notifications: { 
          success: false, 
          message: `Errore: ${error.message}`,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    }
  };

  // Test GPS
  const testGPS = async () => {
    try {
      setTestResults(prev => ({ ...prev, gps: 'testing' }));
      
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      
      const { latitude, longitude, accuracy } = coordinates.coords;
      
      // Vibrazione di feedback
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
      
      setTestResults(prev => ({ 
        ...prev, 
        gps: { 
          success: true, 
          message: `GPS funzionante!`,
          data: {
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            accuracy: `${accuracy?.toFixed(0)}m` || 'N/A'
          },
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      console.error('Errore test GPS:', error);
      setTestResults(prev => ({ 
        ...prev, 
        gps: { 
          success: false, 
          message: `Errore GPS: ${error.message}`,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    }
  };

  // Test Condivisione
  const testShare = async () => {
    try {
      setTestResults(prev => ({ ...prev, share: 'testing' }));
      
      await Share.share({
        title: 'Play Sport Pro - Test App',
        text: 'Sto testando la nuova app Play Sport Pro! 🎾⚡',
        url: window.location.origin,
        dialogTitle: 'Condividi Play Sport Pro'
      });
      
      // Vibrazione di feedback
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
      
      setTestResults(prev => ({ 
        ...prev, 
        share: { 
          success: true, 
          message: 'Condivisione completata!',
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      // L'utente potrebbe aver chiuso la finestra di condivisione
      if (error.message.includes('cancelled')) {
        setTestResults(prev => ({ 
          ...prev, 
          share: { 
            success: true, 
            message: 'Condivisione annullata dall\'utente',
            timestamp: new Date().toLocaleTimeString()
          }
        }));
      } else {
        console.error('Errore test condivisione:', error);
        setTestResults(prev => ({ 
          ...prev, 
          share: { 
            success: false, 
            message: `Errore: ${error.message}`,
            timestamp: new Date().toLocaleTimeString()
          }
        }));
      }
    }
  };

  // Download APK
  const downloadAPK = async () => {
    try {
      setIsDownloading(true);
      
      // Vibrazione di feedback
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
      
      // URL del tuo APK caricato online (dovrai sostituire questo)
      const apkUrl = 'https://github.com/parischit85-sketch/play-sport-pro/releases/latest/download/play-sport-pro.apk';
      
      // Apri il link per il download
      window.open(apkUrl, '_blank');
      
      setTestResults(prev => ({ 
        ...prev, 
        download: { 
          success: true, 
          message: 'Download APK avviato! Controlla i download.',
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      console.error('Errore download APK:', error);
      setTestResults(prev => ({ 
        ...prev, 
        download: { 
          success: false, 
          message: `Errore download: ${error.message}`,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setIsDownloading(false);
    }
  };

  const clearResults = () => {
    setTestResults({});
  };

  const TestResult = ({ result, title }) => {
    if (!result) return null;
    
    if (result === 'testing') {
      return (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-yellow-800">Test in corso...</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className={`mt-3 p-3 rounded-lg border ${
        result.success 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start gap-2">
          <span className={`text-sm ${
            result.success ? 'text-green-600' : 'text-red-600'
          }`}>
            {result.success ? '✅' : '❌'}
          </span>
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.message}
            </p>
            {result.data && (
              <div className="mt-2 text-xs text-gray-600">
                <div>📍 Lat: {result.data.latitude}</div>
                <div>📍 Lng: {result.data.longitude}</div>
                <div>🎯 Precisione: {result.data.accuracy}</div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {result.timestamp}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">🧪 Test Features Native</h3>
        {Object.keys(testResults).length > 0 && (
          <button
            onClick={clearResults}
            className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            🗑️ Pulisci
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Test Notifiche */}
        <div className="space-y-2">
          <button
            onClick={testPushNotifications}
            disabled={testResults.notifications === 'testing'}
            className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:scale-100"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">🔔</span>
              <span className="text-sm">Test Notifiche</span>
            </div>
          </button>
          <TestResult result={testResults.notifications} title="Notifiche" />
        </div>

        {/* Test GPS */}
        <div className="space-y-2">
          <button
            onClick={testGPS}
            disabled={testResults.gps === 'testing'}
            className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:scale-100"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">📍</span>
              <span className="text-sm">Test GPS</span>
            </div>
          </button>
          <TestResult result={testResults.gps} title="GPS" />
        </div>

        {/* Test Condivisione */}
        <div className="space-y-2">
          <button
            onClick={testShare}
            disabled={testResults.share === 'testing'}
            className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:scale-100"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">📤</span>
              <span className="text-sm">Test Share</span>
            </div>
          </button>
          <TestResult result={testResults.share} title="Condivisione" />
        </div>

        {/* Download APK */}
        <div className="space-y-2">
          <button
            onClick={downloadAPK}
            disabled={isDownloading}
            className="w-full p-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:scale-100"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">📱</span>
              <span className="text-sm">
                {isDownloading ? 'Download...' : 'Scarica APK'}
              </span>
            </div>
          </button>
          <TestResult result={testResults.download} title="Download" />
        </div>
      </div>

      {/* Info aggiuntive */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">ℹ️ Informazioni Test</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• <strong>Notifiche:</strong> Testa sia notifiche locali che push</p>
          <p>• <strong>GPS:</strong> Richiede permessi di localizzazione</p>
          <p>• <strong>Share:</strong> Apre il pannello nativo di condivisione</p>
          <p>• <strong>APK:</strong> Download della versione più recente</p>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <span className="font-medium">Piattaforma attuale:</span> {' '}
            {Capacitor.isNativePlatform() 
              ? `📱 ${Capacitor.getPlatform()} (Nativo)` 
              : '🌐 Web (PWA)'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
