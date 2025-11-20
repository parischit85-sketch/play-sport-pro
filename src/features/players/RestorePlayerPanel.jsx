import { useState } from 'react';
import { httpsCallable } from 'firebase/auth';
import { functions } from '../../firebase/firebaseConfig';

/**
 * Pannello per ripristinare profili player corrotti
 * Ripristina il campo "id" al valore del Document ID
 */
export default function RestorePlayerPanel({ clubId }) {
  const [playerId, setPlayerId] = useState('FrewudyR6jSesgzYIe5do1iJKJf1');
  const [userId, setUserId] = useState('mwLUarfeMkQqKMmDZ1qPPMyN7mZ2');
  const [restoring, setRestoring] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRestore = async () => {
    if (!playerId.trim()) {
      setError('Player ID richiesto');
      return;
    }

    setRestoring(true);
    setError(null);
    setResult(null);

    try {
      const restorePlayerProfile = httpsCallable(functions, 'restorePlayerProfile');
      const response = await restorePlayerProfile({
        clubId,
        playerId: playerId.trim(),
        userId: userId.trim() || undefined
      });

      setResult(response.data);
      console.log('✅ Profilo ripristinato:', response.data);

    } catch (err) {
      console.error('❌ Errore ripristino:', err);
      setError(err.message || 'Errore durante il ripristino');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      padding: '24px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '16px', color: '#333' }}>
        🔧 Ripristina Profilo Player
      </h2>

      <p style={{ marginBottom: '24px', color: '#666', fontSize: '14px' }}>
        Ripristina il campo "id" al valore del Document ID per preservare matches e statistiche.
        Usa questa funzione SOLO per correggere profili corrotti dopo linking errato.
      </p>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
          Player ID (Document ID):
        </label>
        <input
          type="text"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          placeholder="Es: FrewudyR6jSesgzYIe5do1iJKJf1"
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}
        />
        <small style={{ color: '#999', fontSize: '12px' }}>
          Questo diventerà il campo "id" nel documento
        </small>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
          User ID (Firebase Auth UID) - Opzionale:
        </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Es: mwLUarfeMkQqKMmDZ1qPPMyN7mZ2"
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}
        />
        <small style={{ color: '#999', fontSize: '12px' }}>
          Usato solo per login e notifiche push
        </small>
      </div>

      <button
        onClick={handleRestore}
        disabled={restoring || !playerId.trim()}
        style={{
          width: '100%',
          padding: '14px 24px',
          backgroundColor: restoring ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: restoring ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => {
          if (!restoring && playerId.trim()) {
            e.target.style.backgroundColor = '#45a049';
          }
        }}
        onMouseOut={(e) => {
          if (!restoring) {
            e.target.style.backgroundColor = '#4CAF50';
          }
        }}
      >
        {restoring ? '⏳ Ripristino in corso...' : '🔧 Ripristina Profilo'}
      </button>

      {error && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#ffebee',
          border: '2px solid #ef5350',
          borderRadius: '8px',
          color: '#c62828'
        }}>
          <strong>❌ Errore:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#e8f5e9',
          border: '2px solid #4CAF50',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginBottom: '12px', color: '#2e7d32' }}>
            ✅ Profilo Ripristinato!
          </h3>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>Prima:</strong>
            <pre style={{ 
              marginTop: '4px',
              padding: '8px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              {JSON.stringify(result.before, null, 2)}
            </pre>
          </div>

          <div>
            <strong>Dopo:</strong>
            <pre style={{ 
              marginTop: '4px',
              padding: '8px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              {JSON.stringify(result.after, null, 2)}
            </pre>
          </div>

          <p style={{ marginTop: '12px', fontSize: '14px', color: '#2e7d32' }}>
            🎉 Le statistiche e i matches dovrebbero ora essere visibili!
          </p>
        </div>
      )}

      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#666'
      }}>
        <strong>ℹ️ Come funziona:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Il campo <code>id</code> viene impostato al valore del Document ID</li>
          <li>Il campo <code>userId</code> mantiene il Firebase Auth UID</li>
          <li>I matches usano sempre il Document ID (campo <code>id</code>)</li>
          <li>Le notifiche push usano il Firebase UID (campo <code>userId</code>)</li>
        </ul>
      </div>
    </div>
  );
}
