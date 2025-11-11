import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@ui/card.jsx';
import { Button } from '@ui/button.jsx';
import { Badge } from '@ui/Badge.jsx';
import {
  Bell,
  BellOff,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  Database,
  Activity,
} from 'lucide-react';
import { unifiedPushService } from '@/services/unifiedPushService';
import { useAuth } from '@contexts/AuthContext';
import { db } from '@services/firebase.js';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export default function NativePushTestPanel() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);

  const loadPlatformInfo = () => {
    const info = unifiedPushService.getPlatformInfo();
    setPlatformInfo(info);
  };

  const loadSubscriptionStatus = async () => {
    try {
      if (!user) return;
      const isSubscribed = await unifiedPushService.isSubscribed(user.uid);
      const permission = await unifiedPushService.getPermissionStatus();
      setSubscriptionStatus({ isSubscribed, permission });
    } catch (error) {
      console.error('Error loading subscription status:', error);
    }
  };

  const loadUserSubscriptions = async () => {
    try {
      if (!user) return;

      const q = query(
        collection(db, 'pushSubscriptions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const subs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSubscriptions(subs);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setSubscriptions([]);
    }
  };

  const loadPushStats = async () => {
    try {
      if (!user) return;

      // Query notification events per analytics
      const eventsQuery = query(
        collection(db, 'notificationEvents'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const eventsSnap = await getDocs(eventsQuery);
      const events = eventsSnap.docs.map((doc) => doc.data());

      const sent = events.filter((e) => e.type === 'sent').length;
      const failed = events.filter((e) => e.type === 'failed').length;
      const clicked = events.filter((e) => e.type === 'clicked').length;

      const byPlatform = events.reduce((acc, e) => {
        const platform = e.platform || 'unknown';
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
      }, {});

      setStats({
        sent,
        failed,
        clicked,
        deliveryRate: sent > 0 ? ((sent / (sent + failed)) * 100).toFixed(1) : 0,
        ctr: sent > 0 ? ((clicked / sent) * 100).toFixed(1) : 0,
        byPlatform,
      });
    } catch (error) {
      console.error('Error loading push stats:', error);
      setStats(null);
    }
  };

  useEffect(() => {
    if (user) {
      loadPlatformInfo();
      loadSubscriptionStatus();
      loadUserSubscriptions();
      loadPushStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubscribe = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Login richiesto' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    // Safety timeout to reset loading state
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setMessage({ type: 'error', text: 'Timeout - ricarica la pagina e riprova' });
    }, 10000);

    try {
      const result = await unifiedPushService.subscribe(user.uid);

      clearTimeout(timeoutId);
      setMessage({
        type: 'success',
        text: `✅ Sottoscritto con successo! Tipo: ${result.type}, Platform: ${result.platform}`,
      });

      await loadSubscriptionStatus();
      await loadUserSubscriptions();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Subscription error:', error);
      setMessage({
        type: 'error',
        text: `❌ Errore: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      await unifiedPushService.unsubscribe(user.uid);

      setMessage({
        type: 'success',
        text: '✅ Disiscritto con successo',
      });

      await loadSubscriptionStatus();
      await loadUserSubscriptions();
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setMessage({
        type: 'error',
        text: `❌ Errore: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Login richiesto' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Per PWA, usa direttamente il Service Worker
      if (!platformInfo?.isNative) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('🎾 Test Play Sport Pro', {
          body: 'Notifica di test dalla PWA!',
          icon: '/icon-192.png',
          badge: '/badge-72.png',
          tag: 'test-notification',
          data: { url: '/dashboard', timestamp: Date.now() },
          actions: [
            { action: 'open', title: '👀 Apri' },
            { action: 'close', title: '✖️ Chiudi' },
          ],
          vibrate: [200, 100, 200],
          requireInteraction: false,
        });

        setMessage({
          type: 'success',
          text: '✅ Notifica PWA inviata! Controlla le notifiche del browser.',
        });
        
        setIsLoading(false);
        return;
      }

      // Invia notifica test nativa per native
      if (platformInfo?.isNative) {
        await unifiedPushService.scheduleLocalNotification({
          title: '🧪 Test Notifica Nativa',
          body: 'Questa è una notifica di test per verificare il sistema native push!',
          scheduleAt: new Date(Date.now() + 2000), // 2 secondi
          id: Date.now(),
        });

        setMessage({
          type: 'success',
          text: '✅ Notifica locale schedulata! Apparirà tra 2 secondi.',
        });
      } else {
        setMessage({
          type: 'info',
          text: 'ℹ️ Test notifica web - usa il pannello standard per testare Web Push',
        });
      }
    } catch (error) {
      console.error('Test notification error:', error);
      setMessage({
        type: 'error',
        text: `❌ Errore: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionBadge = () => {
    if (!subscriptionStatus) return null;

    const { permission } = subscriptionStatus;

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
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" /> Non richiesto
          </Badge>
        );
    }
  };

  const getPlatformIcon = () => {
    if (!platformInfo) return <Monitor className="w-5 h-5" />;

    if (platformInfo.isNative) {
      return <Smartphone className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Effettua il login per testare le notifiche push native
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getPlatformIcon()}
              <h3 className="text-lg font-semibold">Native Push Test Panel</h3>
            </div>
            <div className="flex items-center gap-2">
              {platformInfo?.isNative && (
                <Badge className="bg-blue-500">
                  <Smartphone className="w-3 h-3 mr-1" /> Native App
                </Badge>
              )}
              {getPermissionBadge()}
            </div>
          </div>

          {/* Platform Info */}
          {platformInfo && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">Platform:</span>
                <span>{platformInfo.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span>{platformInfo.pushType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Supported:</span>
                <span>{platformInfo.isSupported ? '✅ Yes' : '❌ No'}</span>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : message.type === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {/* Sempre mostra il test button per PWA */}
            {!platformInfo?.isNative && (
              <Button onClick={handleTestNotification} disabled={isLoading} className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Sending...' : '📨 Test Notification'}
              </Button>
            )}
            
            {!subscriptionStatus?.isSubscribed ? (
              <Button onClick={handleSubscribe} disabled={isLoading} className="flex-1">
                <Bell className="w-4 h-4 mr-2" />
                {isLoading ? 'Subscribing...' : 'Subscribe to Push'}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleUnsubscribe}
                  variant="outline"
                  disabled={isLoading}
                  className="flex-1"
                >
                  <BellOff className="w-4 h-4 mr-2" />
                  Unsubscribe
                </Button>
                {/* Per native, mostra test solo se iscritto */}
                {platformInfo?.isNative && (
                  <Button onClick={handleTestNotification} disabled={isLoading} className="flex-1">
                    <Send className="w-4 h-4 mr-2" />
                    Test Notification
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      {stats && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <h4 className="font-semibold">Push Statistics (Last 100 Events)</h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.sent}
                </div>
                <div className="text-xs text-muted-foreground">Sent</div>
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.failed}
                </div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.deliveryRate}%
                </div>
                <div className="text-xs text-muted-foreground">Delivery Rate</div>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.ctr}%
                </div>
                <div className="text-xs text-muted-foreground">CTR</div>
              </div>
            </div>

            {/* Platform Distribution */}
            <div>
              <h5 className="text-sm font-medium mb-2">By Platform:</h5>
              <div className="space-y-1">
                {Object.entries(stats.byPlatform).map(([platform, count]) => (
                  <div key={platform} className="flex justify-between text-sm">
                    <span className="capitalize">{platform}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Subscriptions */}
      {subscriptions.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              <h4 className="font-semibold">Active Subscriptions ({subscriptions.length})</h4>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">{sub.type || 'unknown'} Push</span>
                    <div className="flex items-center gap-1">
                      {sub.isActive ? (
                        <Badge className="bg-green-500 text-xs">
                          <Wifi className="w-3 h-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <WifiOff className="w-3 h-3 mr-1" /> Inactive
                        </Badge>
                      )}
                    </div>
                  </div>

                  {sub.platform && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform:</span>
                      <span className="capitalize">{sub.platform}</span>
                    </div>
                  )}

                  {sub.deviceId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Device:</span>
                      <span className="font-mono">{sub.deviceId.substring(0, 20)}...</span>
                    </div>
                  )}

                  {sub.fcmToken && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">FCM Token:</span>
                      <span className="font-mono text-green-600">
                        {sub.fcmToken.substring(0, 20)}...
                      </span>
                    </div>
                  )}

                  {sub.apnsToken && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">APNs Token:</span>
                      <span className="font-mono text-blue-600">
                        {sub.apnsToken.substring(0, 20)}...
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Created:</span>
                    <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                  </div>

                  {sub.lastUsedAt && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Last Used:</span>
                      <span>{new Date(sub.lastUsedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
