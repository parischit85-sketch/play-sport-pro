// =============================================
// FILE: src/components/NotificationTest.jsx
// Componente per testare le notifiche push
// =============================================
import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import NotificationService from '@services/notificationService.js';

export default function NotificationTest() {
  const [isNative, setIsNative] = useState(false);
  const [pushToken, setPushToken] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState('checking...');

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());

    // Controlla lo stato delle notifiche
    const checkNotificationStatus = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await NotificationService.initialize();
          const token = NotificationService.getPushToken();
          setPushToken(token);
          setNotificationStatus('initialized');
        } catch (error) {
          console.error('Notification init error:', error);
          setNotificationStatus('error');
        }
      } else {
        // Browser notification check
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            setNotificationStatus('granted');
          } else if (Notification.permission === 'denied') {
            setNotificationStatus('denied');
          } else {
            setNotificationStatus('default');
          }
        } else {
          setNotificationStatus('not_supported');
        }
      }
    };

    checkNotificationStatus();
  }, []);

  const requestBrowserNotifications = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
    }
  };

  const testLocalNotification = async () => {
    try {
      await NotificationService.testLocalNotification();
      alert('✅ Notifica di test inviata!');
    } catch (error) {
      console.error('Test notification error:', error);
      alert("❌ Errore nell'invio della notifica di test");
    }
  };

  const testBookingNotification = async () => {
    try {
      await NotificationService.notifyBookingConfirmed({
        court: 'Campo 1',
        date: 'Oggi',
        time: '18:00',
        id: 'test-booking-123',
      });
      alert('✅ Notifica prenotazione inviata!');
    } catch (error) {
      console.error('Booking notification error:', error);
      alert("❌ Errore nell'invio della notifica prenotazione");
    }
  };

  const testMatchNotification = async () => {
    try {
      await NotificationService.notifyMatchResult({
        winner: 'Mario & Luigi',
        score: '6-4, 6-2',
        id: 'test-match-123',
      });
      alert('✅ Notifica risultato inviata!');
    } catch (error) {
      console.error('Match notification error:', error);
      alert("❌ Errore nell'invio della notifica risultato");
    }
  };

  if (!isNative) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Test Notifiche Browser</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Status: <span className="font-semibold">{notificationStatus}</span>
              </p>
              <div className="mt-3 space-y-2">
                {notificationStatus === 'default' && (
                  <button
                    onClick={requestBrowserNotifications}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
                  >
                    🔔 Richiedi Permessi Notifiche
                  </button>
                )}

                {notificationStatus === 'granted' && (
                  <div className="space-y-2">
                    <button
                      onClick={testLocalNotification}
                      className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors mr-2"
                    >
                      🧪 Test Notifica
                    </button>
                    <button
                      onClick={testBookingNotification}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors mr-2"
                    >
                      📅 Test Prenotazione
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">🚀 App Nativa - Notifiche Push</h3>
          <div className="mt-2 text-sm text-green-700">
            <p>
              Status: <span className="font-semibold">{notificationStatus}</span>
            </p>
            {pushToken && (
              <p className="mt-1">
                Token:{' '}
                <span className="font-mono text-xs bg-green-100 px-1 rounded">
                  {pushToken.substring(0, 20)}...
                </span>
              </p>
            )}

            <div className="mt-3 space-y-2">
              <button
                onClick={testLocalNotification}
                className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors mr-2"
              >
                🧪 Test Notifica Locale
              </button>
              <button
                onClick={testBookingNotification}
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors mr-2"
              >
                📅 Test Prenotazione
              </button>
              <button
                onClick={testMatchNotification}
                className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-600 transition-colors"
              >
                🏆 Test Risultato
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

