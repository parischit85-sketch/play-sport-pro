import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../services/firebase';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Pannello admin per collegare profili orfani a utenti Firebase esistenti
 */
export default function LinkOrphanProfilesPanel({ clubId }) {
  const { user } = useAuth();
  const [orphans, setOrphans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedOrphan, setSelectedOrphan] = useState(null);
  const [selectedFirebaseUser, setSelectedFirebaseUser] = useState(null);
  const [message, setMessage] = useState(null);

  // Carica profili orfani al mount
  useEffect(() => {
    loadOrphans();
  }, [clubId]);

  const loadOrphans = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const callable = httpsCallable(functions, 'getOrphanProfiles');
      const result = await callable({ clubId });
      setOrphans(result.data.orphans || []);
      if (result.data.total === 0) {
        setMessage({ type: 'success', text: '✅ Nessun profilo orfano trovato - tutti i giocatori hanno account Firebase!' });
      }
    } catch (error) {
      console.error('[LinkOrphanProfiles] Error loading orphans:', error);
      setMessage({ type: 'error', text: `Errore nel caricamento: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setMessage({ type: 'error', text: 'Inserisci almeno 3 caratteri per la ricerca' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setSearchResults([]);

    try {
      const callable = httpsCallable(functions, 'searchFirebaseUsers');
      const result = await callable({ clubId, searchQuery: searchQuery.trim() });
      setSearchResults(result.data.results || []);
      if (result.data.total === 0) {
        setMessage({ type: 'warning', text: 'Nessun utente Firebase trovato con questi criteri' });
      }
    } catch (error) {
      console.error('[LinkOrphanProfiles] Error searching:', error);
      setMessage({ type: 'error', text: `Errore nella ricerca: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedOrphan || !selectedFirebaseUser) {
      setMessage({ type: 'error', text: 'Seleziona sia un profilo orfano che un utente Firebase' });
      return;
    }

    if (!window.confirm(
      `Confermi di voler collegare:\n\n` +
      `Profilo orfano: ${selectedOrphan.name} (${selectedOrphan.email})\n` +
      `→ Utente Firebase: ${selectedFirebaseUser.displayName} (${selectedFirebaseUser.email})\n\n` +
      `Questa operazione aggiornerà il campo userId e tutte le reference (bookings, matches, ecc.)`
    )) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const callable = httpsCallable(functions, 'linkOrphanProfile');
      const result = await callable({
        clubId,
        orphanPlayerId: selectedOrphan.userId,
        firebaseUid: selectedFirebaseUser.uid,
      });

      setMessage({
        type: 'success',
        text: `✅ ${result.data.message}! Profilo collegato correttamente.`,
      });

      // Reset e ricarica
      setSelectedOrphan(null);
      setSelectedFirebaseUser(null);
      setSearchQuery('');
      setSearchResults([]);
      await loadOrphans();
    } catch (error) {
      console.error('[LinkOrphanProfiles] Error linking:', error);
      setMessage({ type: 'error', text: `Errore nel collegamento: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="link-orphan-profiles-panel">
      <div className="panel-header">
        <h3>🔗 Collega Profili Orfani</h3>
        <p className="help-text">
          I profili orfani sono giocatori registrati nel club che non hanno un account Firebase.
          Collegali a utenti Firebase esistenti per permettere loro di ricevere notifiche push e accedere all'app.
        </p>
      </div>

      {/* Messaggio di stato */}
      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Lista profili orfani */}
      <div className="orphans-section">
        <div className="section-header">
          <h4>Profili Orfani ({orphans.length})</h4>
          <button onClick={loadOrphans} disabled={loading} className="btn-secondary btn-sm">
            🔄 Ricarica
          </button>
        </div>

        {loading && !orphans.length ? (
          <div className="loading">Caricamento...</div>
        ) : orphans.length === 0 ? (
          <div className="empty-state">
            ✅ Nessun profilo orfano - tutti i giocatori hanno account Firebase!
          </div>
        ) : (
          <div className="orphans-list">
            {orphans.map((orphan) => (
              <div
                key={orphan.userId}
                className={`orphan-card ${selectedOrphan?.userId === orphan.userId ? 'selected' : ''}`}
                onClick={() => setSelectedOrphan(orphan)}
              >
                <div className="orphan-info">
                  <strong>{orphan.name}</strong>
                  {orphan.email && <div className="email">{orphan.email}</div>}
                  {orphan.phoneNumber && <div className="phone">{orphan.phoneNumber}</div>}
                  <div className="user-id">ID: {orphan.userId}</div>
                </div>
                {selectedOrphan?.userId === orphan.userId && (
                  <div className="selected-badge">✓ Selezionato</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sezione ricerca utenti Firebase */}
      {selectedOrphan && (
        <div className="search-section">
          <div className="section-header">
            <h4>Cerca Utente Firebase</h4>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Cerca per email, telefono, nome o cognome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              disabled={loading}
            />
            <button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
              🔍 Cerca
            </button>
          </div>

          {/* Risultati ricerca */}
          {searchResults.length > 0 && (
            <div className="search-results">
              <h5>Risultati ({searchResults.length})</h5>
              {searchResults.map((user) => (
                <div
                  key={user.uid}
                  className={`user-card ${selectedFirebaseUser?.uid === user.uid ? 'selected' : ''}`}
                  onClick={() => setSelectedFirebaseUser(user)}
                >
                  <div className="user-info">
                    {user.photoURL && <img src={user.photoURL} alt="" className="avatar" />}
                    <div>
                      <strong>{user.displayName || 'Senza nome'}</strong>
                      {user.email && <div className="email">{user.email}</div>}
                      {user.phoneNumber && <div className="phone">{user.phoneNumber}</div>}
                      <div className="match-type">Trovato via: {user.matchType}</div>
                    </div>
                  </div>
                  {selectedFirebaseUser?.uid === user.uid && (
                    <div className="selected-badge">✓ Selezionato</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Azione collegamento */}
      {selectedOrphan && selectedFirebaseUser && (
        <div className="link-action">
          <div className="link-summary">
            <div className="arrow-box">
              <div className="from">
                <strong>Profilo Orfano</strong>
                <div>{selectedOrphan.name}</div>
                <div className="small">{selectedOrphan.email}</div>
              </div>
              <div className="arrow">→</div>
              <div className="to">
                <strong>Utente Firebase</strong>
                <div>{selectedFirebaseUser.displayName}</div>
                <div className="small">{selectedFirebaseUser.email}</div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLink}
            disabled={loading}
            className="btn-primary btn-lg"
          >
            🔗 Collega Profilo
          </button>
        </div>
      )}

      <style jsx>{`
        .link-orphan-profiles-panel {
          padding: 20px;
        }

        .panel-header h3 {
          margin: 0 0 10px 0;
          color: #1a1a1a;
        }

        .help-text {
          color: #666;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .message {
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .message-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .message-warning {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .section-header h4,
        .section-header h5 {
          margin: 0;
          color: #333;
        }

        .orphans-section,
        .search-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .orphans-list,
        .search-results {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .orphan-card,
        .user-card {
          background: white;
          padding: 15px;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .orphan-card:hover,
        .user-card:hover {
          border-color: #007bff;
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
        }

        .orphan-card.selected,
        .user-card.selected {
          border-color: #28a745;
          background: #f0fff4;
        }

        .orphan-info,
        .user-info {
          flex: 1;
        }

        .orphan-info strong,
        .user-info strong {
          display: block;
          margin-bottom: 5px;
          color: #1a1a1a;
        }

        .email,
        .phone,
        .user-id,
        .match-type {
          font-size: 13px;
          color: #666;
          margin-top: 3px;
        }

        .selected-badge {
          background: #28a745;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .search-box {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .search-box input {
          flex: 1;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .search-box button {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .search-box button:hover:not(:disabled) {
          background: #0056b3;
        }

        .search-box button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .user-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .link-action {
          background: #e8f4f8;
          padding: 20px;
          border-radius: 8px;
          border: 2px solid #007bff;
        }

        .link-summary {
          margin-bottom: 15px;
        }

        .arrow-box {
          display: flex;
          align-items: center;
          gap: 20px;
          justify-content: center;
        }

        .from,
        .to {
          flex: 1;
          text-align: center;
          padding: 15px;
          background: white;
          border-radius: 8px;
        }

        .arrow {
          font-size: 24px;
          color: #007bff;
          font-weight: bold;
        }

        .small {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }

        .btn-primary,
        .btn-secondary {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #28a745;
          color: white;
          width: 100%;
        }

        .btn-primary:hover:not(:disabled) {
          background: #218838;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #545b62;
        }

        .btn-lg {
          padding: 12px 24px;
          font-size: 16px;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading,
        .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }
      `}</style>
    </div>
  );
}
