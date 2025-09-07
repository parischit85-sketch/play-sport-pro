import React, { useState, useEffect } from 'react';
import { useNativeFeatures } from '../hooks/useNativeFeatures';
import { Capacitor } from '@capacitor/core';

const NativeFeaturesTest = () => {
  const { location, isNative, getCurrentLocation, scheduleLocalNotification, shareContent } = useNativeFeatures();
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (test, success, message) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      success,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Test GPS
  const testGPS = async () => {
    setIsLoading(true);
    try {
      await getCurrentLocation();
      if (location) {
        addTestResult('GPS', true, `Posizione: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
      } else {
        addTestResult('GPS', false, 'Impossibile ottenere la posizione');
      }
    } catch (error) {
      addTestResult('GPS', false, error.message);
    }
    setIsLoading(false);
  };

  // Test Notifica Locale
  const testLocalNotification = async () => {
    try {
      const scheduleTime = new Date(Date.now() + 5000); // 5 secondi da ora
      await scheduleLocalNotification(
        'Test Play Sport Pro',
        'Notifica locale funzionante! 🎾',
        scheduleTime
      );
      addTestResult('Notifiche Locali', true, 'Notifica programmata per 5 secondi');
    } catch (error) {
      addTestResult('Notifiche Locali', false, error.message);
    }
  };

  // Test Condivisione
  const testShare = async () => {
    try {
      await shareContent(
        'Play Sport Pro',
        'Scopri la migliore app per la gestione del padel!',
        'https://github.com/parischit85-sketch/play-sport-pro'
      );
      addTestResult('Condivisione', true, 'Dialog di condivisione aperto');
    } catch (error) {
      addTestResult('Condivisione', false, error.message);
    }
  };

  // Test Info Piattaforma
  const testPlatformInfo = () => {
    const platform = Capacitor.getPlatform();
    const isNativePlatform = Capacitor.isNativePlatform();
    const plugins = Object.keys(Capacitor.Plugins);
    
    addTestResult('Piattaforma', true, 
      `Platform: ${platform}, Native: ${isNativePlatform}, Plugins: ${plugins.length}`
    );
  };

  useEffect(() => {
    testPlatformInfo();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          🧪 Test Funzionalità Native
        </h2>

        {/* Info Piattaforma */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">📱 Info Piattaforma</h3>
          <div className="text-sm text-blue-700">
            <p><strong>Piattaforma:</strong> {Capacitor.getPlatform()}</p>
            <p><strong>Nativo:</strong> {isNative ? '✅ Sì' : '❌ No (Web)'}</p>
            <p><strong>Plugins Caricati:</strong> {Object.keys(Capacitor.Plugins).length}</p>
          </div>
        </div>

        {/* Pulsanti Test */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={testGPS}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            📍 Test GPS
          </button>

          <button
            onClick={testLocalNotification}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            🔔 Test Notifiche
          </button>

          <button
            onClick={testShare}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            📤 Test Share
          </button>
        </div>

        {/* Posizione Corrente */}
        {location && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">📍 Posizione GPS</h3>
            <div className="text-sm text-green-700">
              <p><strong>Latitudine:</strong> {location.latitude}</p>
              <p><strong>Longitudine:</strong> {location.longitude}</p>
              <p><strong>Google Maps:</strong> 
                <a 
                  href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline ml-1"
                >
                  Apri Maps
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Risultati Test */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-4">📋 Risultati Test</h3>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500 italic">Nessun test eseguito ancora...</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testResults.map(result => (
                <div 
                  key={result.id}
                  className={`p-3 rounded border-l-4 ${
                    result.success 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`font-semibold ${
                        result.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {result.success ? '✅' : '❌'} {result.test}
                      </span>
                      <p className={`text-sm mt-1 ${
                        result.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear Results */}
        {testResults.length > 0 && (
          <button
            onClick={() => setTestResults([])}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            🗑️ Cancella Risultati
          </button>
        )}
      </div>
    </div>
  );
};

export default NativeFeaturesTest;
