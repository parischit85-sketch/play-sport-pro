// =============================================
// FILE: src/components/PushTestPanel.jsx
// Componente temporaneo per testare Push Notifications
// =============================================

import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushTestPanel() {
  const {
    permission,
    subscription,
    isSupported,
    requestPermission,
    sendTestNotification,
    unsubscribe,
    subscribeToPush,
    isGranted,
  } = usePushNotifications();

  const handleEnablePush = async () => {
    console.log('🚀 [TEST] Starting push notification test...');
    console.log('📊 [TEST] Current permission:', permission);

    const result = await requestPermission();

    console.log('📊 [TEST] Request result:', result);
    console.log('📊 [TEST] Check Firestore Console → pushSubscriptions');
    console.log('📊 [TEST] Should see new subscription with your userId');
  };

  const handleTestNotif = async () => {
    console.log('🧪 [TEST] Sending test notification...');
    await sendTestNotification();
  };

  const handleDisablePush = async () => {
    console.log('🔴 [TEST] Disabling push notifications...');
    const result = await unsubscribe();
    if (result) {
      console.log('✅ [TEST] Push notifications disabled successfully');
      console.log('📊 [TEST] Check Firestore Console → pushSubscriptions');
      console.log('📊 [TEST] Subscription should be removed or marked inactive');
    } else {
      console.error('❌ [TEST] Failed to disable push notifications');
    }
  };

  const handleReEnablePush = async () => {
    console.log('🔄 [TEST] Re-enabling push notifications...');
    try {
      const result = await subscribeToPush();
      if (result) {
        console.log('✅ [TEST] Push notifications re-enabled successfully');
        console.log('📊 [TEST] Check Firestore Console → pushSubscriptions');
        console.log('📊 [TEST] New subscription should be created');
      } else {
        console.error('❌ [TEST] Failed to re-enable push notifications');
      }
    } catch (error) {
      console.error('❌ [TEST] Error re-enabling push:', error);
    }
  };

  if (!isSupported) {
    return (
      <div style={{
        padding: '20px',
        background: '#7f1d1d',
        border: '2px solid #dc2626',
        margin: '20px',
        borderRadius: '8px',
        color: '#fef2f2'
      }}>
        <h2>❌ Push Notifications Non Supportate</h2>
        <p>Il tuo browser non supporta le push notifications.</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      background: '#1e293b',
      border: '2px solid #3b82f6',
      margin: '0',
      marginBottom: '24px',
      borderRadius: '12px',
      color: '#e2e8f0'
    }}>
      <h2 style={{ marginBottom: '16px', color: '#f1f5f9', fontSize: '20px', fontWeight: 'bold' }}>
        🧪 Push Notifications Test Panel
      </h2>

      <div style={{
        marginBottom: '16px',
        padding: '12px',
        background: '#334155',
        borderRadius: '8px',
        border: '1px solid #475569'
      }}>
        <div style={{ color: '#cbd5e1', lineHeight: '1.8' }}>
          <strong style={{ color: '#f1f5f9' }}>Status:</strong> <span style={{
            color: permission === 'granted' ? '#34d399' : permission === 'denied' ? '#f87171' : '#fbbf24',
            fontWeight: '600'
          }}>{permission}</span>
          <br />
          <strong style={{ color: '#f1f5f9' }}>Supportato:</strong> {isSupported ? '✅ Sì' : '❌ No'}
          <br />
          <strong style={{ color: '#f1f5f9' }}>Attivo:</strong> {isGranted ? <span style={{ color: '#34d399' }}>✅ Sì</span> : <span style={{ color: '#f87171' }}>❌ No</span>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {!isGranted && (
          <button
            onClick={handleEnablePush}
            style={{
              padding: '12px 24px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
            onMouseOver={(e) => e.target.style.background = '#059669'}
            onMouseOut={(e) => e.target.style.background = '#10b981'}
          >
            ✅ Attiva Push Notifications
          </button>
        )}

        {isGranted && subscription && (
          <>
            <button
              onClick={handleTestNotif}
              style={{
                padding: '12px 24px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
              onMouseOver={(e) => e.target.style.background = '#d97706'}
              onMouseOut={(e) => e.target.style.background = '#f59e0b'}
            >
              🧪 Invia Test Notification
            </button>

            <button
              onClick={handleDisablePush}
              style={{
                padding: '12px 24px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
              onMouseOver={(e) => e.target.style.background = '#dc2626'}
              onMouseOut={(e) => e.target.style.background = '#ef4444'}
            >
              🔴 Disattiva Notifiche
            </button>
          </>
        )}

        {isGranted && !subscription && (
          <button
            onClick={handleReEnablePush}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
            onMouseOver={(e) => e.target.style.background = '#2563eb'}
            onMouseOut={(e) => e.target.style.background = '#3b82f6'}
          >
            🔄 Riattiva Notifiche
          </button>
        )}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: '#334155',
        borderRadius: '8px',
        fontSize: '14px',
        border: '1px solid #475569'
      }}>
        <strong style={{ color: '#f1f5f9' }}>📋 Checklist Test:</strong>
        <ol style={{ marginTop: '12px', paddingLeft: '20px', color: '#cbd5e1', lineHeight: '1.8' }}>
          <li>Fai login nell'app</li>
          <li>Apri DevTools Console (F12)</li>
          <li><strong>Attivazione:</strong> Click su "Attiva Push Notifications"</li>
          <li>Concedi permesso nel browser</li>
          <li>Verifica console per log "✅ Subscription saved"</li>
          <li>Apri Firebase Console → Firestore → pushSubscriptions</li>
          <li>Dovresti vedere nuova subscription con il tuo userId</li>
          <li><strong>Test:</strong> Click "Invia Test Notification" per verificare ricezione</li>
          <li><strong>Disattivazione:</strong> Click "Disattiva Notifiche" per rimuovere subscription</li>
          <li>Verifica Firestore: subscription dovrebbe essere rimossa o inactive</li>
          <li><strong>Riattivazione:</strong> Click "Riattiva Notifiche" per creare nuova subscription</li>
          <li>Verifica Firestore: nuova subscription creata con active: true</li>
        </ol>
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: '#0f172a',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        border: '1px solid #334155'
      }}>
        <strong style={{ color: '#94a3b8' }}>🔍 Debug Info:</strong>
        <pre style={{ marginTop: '8px', overflow: 'auto', color: '#cbd5e1', margin: 0 }}>
{JSON.stringify({
  permission,
  isSupported,
  isGranted,
  timestamp: new Date().toISOString()
}, null, 2)}
        </pre>
      </div>
    </div>
  );
}
