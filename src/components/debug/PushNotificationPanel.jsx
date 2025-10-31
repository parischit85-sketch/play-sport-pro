import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@ui/card.jsx';
import { Button } from '@ui/button.jsx';
import { Badge } from '@ui/Badge.jsx';
import { Bell, BellOff, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  subscribeToPush,
  unsubscribeFromPush,
  isPushSubscribed,
  getPushNotificationStatus,
  sendTestNotification,
  checkPushServerConfig,
} from '@utils/push';
import { useAuth } from '@contexts/AuthContext';

export default function PushNotificationPanel() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [serverCheck, setServerCheck] = useState(null);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    checkSubscription();
    setPermission(getPushNotificationStatus());
    setIsMockMode(!!window.__MOCK_PUSH_MODE__);
  }, []);

  const checkSubscription = async () => {
    const subscribed = await isPushSubscribed();
    setIsSubscribed(subscribed);
  };

  const handleSubscribe = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Devi effettuare il login' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const subscription = await subscribeToPush(user.uid);

      if (subscription) {
        setIsSubscribed(true);
        setPermission('granted');
        setMessage({ type: 'success', text: 'Sottoscrizione completata!' });
      } else {
        setMessage({ type: 'error', text: 'Impossibile completare la sottoscrizione' });
      }
    } catch (error) {
      console.error('Errore nella sottoscrizione:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const success = await unsubscribeFromPush(user.uid);

      if (success) {
        setIsSubscribed(false);
        setMessage({ type: 'success', text: 'Sottoscrizione annullata' });
      } else {
        setMessage({ type: 'error', text: "Errore nell'annullamento" });
      }
    } catch (error) {
      console.error("Errore nell'annullamento:", error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Devi effettuare il login' });
      return;
    }

    if (!isSubscribed) {
      setMessage({ type: 'error', text: 'Devi prima abilitare le notifiche' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const success = await sendTestNotification(user.uid);

      if (success) {
        setMessage({
          type: 'success',
          text: 'Notifica di test inviata! Controlla il pannello notifiche del sistema.',
        });
      } else {
        setMessage({ type: 'error', text: "Errore nell'invio della notifica" });
      }
    } catch (error) {
      console.error("Errore nell'invio della notifica:", error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleServerDiagnostics = async () => {
    setIsLoading(true);
    setMessage(null);
    setServerCheck(null);
    try {
      const res = await checkPushServerConfig();
      setServerCheck(res);
      if (!res.ok) {
        setMessage({ type: 'error', text: `Diagnostica fallita: ${res.error}` });
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" /> Autorizzato
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" /> Negato
          </Badge>
        );
      case 'unsupported':
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" /> Non supportato
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" /> Non richiesto
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Notifiche Push</h3>
          <div className="flex items-center gap-2">
            {isMockMode && (
              <Badge className="bg-purple-500">
                <span className="mr-1">🎭</span> Mock Mode
              </Badge>
            )}
            {getPermissionBadge()}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Attiva le notifiche push per ricevere aggiornamenti in tempo reale sulle tue
            prenotazioni.
          </p>
          {isMockMode && (
            <div className="p-2 bg-purple-50 bg-purple-900/20 rounded text-sm text-purple-800 text-purple-300">
              <p className="font-medium">🎭 Modalità Mock Attiva</p>
              <p className="text-xs">
                Il Service Worker non è disponibile. Le notifiche vengono simulate in console. Usa
                questa modalità per testare la logica di sottoscrizione senza problemi di storage.
              </p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-gray-300'}`}
            />
            <span className="text-xs text-muted-foreground">
              {isSubscribed ? 'Sottoscritto' : 'Non sottoscritto'}
            </span>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 bg-green-900/20 text-green-300'
                : message.type === 'error'
                  ? 'bg-red-50 text-red-800 bg-red-900/20 text-red-300'
                  : 'bg-blue-50 text-blue-800 bg-blue-900/20 text-blue-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {!isSubscribed ? (
            <Button
              onClick={handleSubscribe}
              disabled={isLoading || permission === 'denied' || permission === 'unsupported'}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              {isLoading ? 'Attivazione...' : 'Attiva Notifiche'}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleTestNotification}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Invio...' : 'Invia Notifica di Test'}
              </Button>
              <Button
                onClick={handleUnsubscribe}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                <BellOff className="w-4 h-4 mr-2" />
                {isLoading ? 'Disattivazione...' : 'Disattiva Notifiche'}
              </Button>
            </>
          )}
          <Button
            onClick={handleServerDiagnostics}
            disabled={isLoading}
            variant="secondary"
            className="w-full"
          >
            {isLoading ? 'Verifica...' : 'Diagnostica server push'}
          </Button>
        </div>

        {serverCheck && (
          <div className="p-3 bg-gray-50 bg-gray-800 rounded-lg text-xs text-gray-700 text-gray-300 space-y-1">
            <div className="font-medium">Stato server push:</div>
            {serverCheck.ok && serverCheck.data ? (
              <ul className="list-disc pl-5 space-y-1">
                <li>Ambiente: {serverCheck.data.environment}</li>
                {'checks' in serverCheck.data && (
                  <>
                    <li>
                      VAPID_PUBLIC_KEY:{' '}
                      {serverCheck.data.checks.VAPID_PUBLIC_KEY?.exists ? 'OK' : 'MANCANTE'}
                    </li>
                    <li>
                      VAPID_PRIVATE_KEY:{' '}
                      {serverCheck.data.checks.VAPID_PRIVATE_KEY?.exists ? 'OK' : 'MANCANTE'}
                    </li>
                    <li>
                      FIREBASE_PROJECT_ID:{' '}
                      {serverCheck.data.checks.FIREBASE_PROJECT_ID?.exists ? 'OK' : 'MANCANTE'}
                    </li>
                    <li>
                      FIREBASE_CLIENT_EMAIL:{' '}
                      {serverCheck.data.checks.FIREBASE_CLIENT_EMAIL?.exists ? 'OK' : 'MANCANTE'}
                    </li>
                    <li>
                      FIREBASE_PRIVATE_KEY:{' '}
                      {serverCheck.data.checks.FIREBASE_PRIVATE_KEY?.exists ? 'OK' : 'MANCANTE'}
                    </li>
                  </>
                )}
                {'allConfigured' in serverCheck.data && (
                  <li className="font-semibold">
                    Completa: {serverCheck.data.allConfigured ? 'Sì' : 'No'}
                  </li>
                )}
                {'firebaseTest' in serverCheck.data && (
                  <li>Firebase Admin: {serverCheck.data.firebaseTest.status}</li>
                )}
              </ul>
            ) : (
              <div>Errore: {serverCheck.error || 'Sconosciuto'}</div>
            )}
          </div>
        )}

        {permission === 'denied' && (
          <div className="p-3 bg-amber-50 bg-amber-900/20 rounded-lg text-sm text-amber-800 text-amber-300">
            <p className="font-medium mb-1">Permesso negato</p>
            <p className="text-xs">
              Hai negato il permesso per le notifiche. Per attivare le notifiche, devi modificare le
              impostazioni del browser.
            </p>
          </div>
        )}

        {permission === 'unsupported' && (
          <div className="p-3 bg-gray-50 bg-gray-800 rounded-lg text-sm text-gray-700 text-gray-300">
            <p className="font-medium mb-1">Non supportato</p>
            <p className="text-xs">
              Il tuo browser non supporta le notifiche push o il service worker.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
