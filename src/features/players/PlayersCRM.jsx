// =============================================
// FILE: src/features/players/PlayersCRM.jsx
// Sistema CRM completo per la gestione giocatori
// =============================================

import React, { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Section from '@ui/Section.jsx';
import Modal from '@ui/Modal.jsx';
import { uid } from '@lib/ids.js';
import { byPlayerFirstAlpha } from '@lib/names.js';
import { createPlayerSchema, PLAYER_CATEGORIES } from './types/playerTypes.js';
import PlayerCard from './components/PlayerCard';
import PlayerForm from './components/PlayerForm';
import PlayerDetails from './components/PlayerDetails';
import CRMTools from './components/CRMTools';
import { useAuth } from '@contexts/AuthContext.jsx';
import { listAllUserProfiles } from '@services/auth.jsx';

export default function PlayersCRM({
  state,
  setState,
  onOpenStats,
  playersById,
  T,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
}) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTools, setShowTools] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');

  const players = Array.isArray(state?.players) ? state.players : [];

  // 🔧 Leggi il parametro 'selected' dalla URL all'avvio
  useEffect(() => {
    const selectedParam = searchParams.get('selected');
    if (selectedParam) {
      setSelectedPlayerId(selectedParam);
    }
  }, []); // Solo al mount

  // 🔧 Aggiorna la URL quando cambia selectedPlayerId
  useEffect(() => {
    if (selectedPlayerId) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('selected', selectedPlayerId);
      setSearchParams(newParams, { replace: true });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('selected');
      setSearchParams(newParams, { replace: true });
    }
  }, [selectedPlayerId]); // Quando cambia selectedPlayerId

  // Deriva il giocatore selezionato dai dati correnti (si aggiorna live)
  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerId) return null;
    return players.find((p) => p.id === selectedPlayerId) || null;
  }, [players, selectedPlayerId]);

  // Filtri e ricerca
  const filteredPlayers = useMemo(() => {
    let filtered = [...players];

    // Filtro per categoria
    if (filterCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === filterCategory);
    }

    // Ricerca per nome, email, telefono
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.email?.toLowerCase().includes(term) ||
          p.phone?.includes(term) ||
          p.firstName?.toLowerCase().includes(term) ||
          p.lastName?.toLowerCase().includes(term)
      );
    }

    return filtered.sort(byPlayerFirstAlpha);
  }, [players, filterCategory, searchTerm]);

  // Statistiche rapide
  const stats = useMemo(() => {
    const total = players.length;
    const members = players.filter((p) => p.category === PLAYER_CATEGORIES.MEMBER).length;
    const active = players.filter((p) => p.isActive !== false).length;
    const withAccount = players.filter((p) => p.isAccountLinked).length;

    return { total, members, active, withAccount };
  }, [players]);

  const handleAddPlayer = async (playerData) => {
    if (onAddPlayer) {
      await onAddPlayer(playerData);
    } else {
      // Fallback to local state if no Firebase function provided
      const newPlayer = {
        ...createPlayerSchema(),
        ...playerData,
        id: uid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setState((s) => {
        const cur = Array.isArray(s?.players) ? s.players : [];
        return {
          ...(s || { players: [], matches: [] }),
          players: [...cur, newPlayer],
        };
      });
    }

    setShowPlayerForm(false);
  };

  const handleUpdatePlayer = async (playerId, updates) => {
    if (onUpdatePlayer) {
      await onUpdatePlayer(playerId, updates);
    } else {
      // Fallback to local state if no Firebase function provided
      setState((s) => {
        const cur = Array.isArray(s?.players) ? s.players : [];
        return {
          ...(s || { players: [], matches: [] }),
          players: cur.map((p) =>
            p.id === playerId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        };
      });
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (onDeletePlayer) {
      await onDeletePlayer(playerId);
    } else {
      // Fallback to local state if no Firebase function provided
      if (
        !confirm(
          'Sei sicuro di voler eliminare questo giocatore? Questa azione non può essere annullata.'
        )
      ) {
        return;
      }

      setState((s) => {
        const cur = Array.isArray(s?.players) ? s.players : [];
        return {
          ...(s || { players: [], matches: [] }),
          players: cur.filter((p) => p.id !== playerId),
        };
      });
    }
    setSelectedPlayerId(null);
  };

  const handleCreateFromAccount = async () => {
    try {
      setLoadingAccounts(true);
      const res = await listAllUserProfiles(500);
      setAccounts(res || []);
      setAccountSearch('');
      setShowAccountPicker(true);
    } catch (error) {
      console.error('Error loading accounts:', error);
      alert('Errore nel caricamento degli account. Riprova.');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleSelectAccount = async (account) => {
    const playerData = {
      firstName: account.firstName || account.displayName?.split(' ')[0] || '',
      lastName: account.lastName || account.displayName?.split(' ')[1] || '',
      name:
        account.displayName ||
        `${account.firstName} ${account.lastName}`.trim() ||
        account.email?.split('@')[0] ||
        '',
      email: account.email || '',
      linkedAccountId: account.uid,
      linkedAccountEmail: account.email,
      isAccountLinked: true,
      category: PLAYER_CATEGORIES.MEMBER,
      phone: account.phone || '',
      dateOfBirth: account.dateOfBirth || null,
    };

    await handleAddPlayer(playerData);
    setShowAccountPicker(false);
    setAccounts([]);
    setAccountSearch('');
  };

  // Filtra gli account escludendo quelli già collegati
  const linkedAccountIds = useMemo(() => {
    return new Set(players.filter((p) => p.linkedAccountId).map((p) => p.linkedAccountId));
  }, [players]);

  const linkedEmails = useMemo(() => {
    return new Set(
      players.filter((p) => p.linkedAccountEmail).map((p) => p.linkedAccountEmail.toLowerCase())
    );
  }, [players]);

  const unlinkedAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (acc.uid && linkedAccountIds.has(acc.uid)) return false;
      if (acc.email && linkedEmails.has(acc.email.toLowerCase())) return false;
      return true;
    });
  }, [accounts, linkedAccountIds, linkedEmails]);

  const filteredAccounts = useMemo(() => {
    const q = accountSearch.trim().toLowerCase();
    if (!q) return unlinkedAccounts;
    return unlinkedAccounts.filter((acc) => {
      return (
        (acc.email || '').toLowerCase().includes(q) ||
        (acc.firstName || '').toLowerCase().includes(q) ||
        (acc.lastName || '').toLowerCase().includes(q) ||
        (acc.displayName || '').toLowerCase().includes(q)
      );
    });
  }, [unlinkedAccounts, accountSearch]);

  return (
    <>
      <Section title="CRM Giocatori" T={T}>
        {/* Header con statistiche e azioni */}
        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 xl:p-3 mb-6`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Statistiche */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-3 flex-1">
              <div className="text-center">
                <div className="text-2xl xl:text-xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </div>
                <div className={`text-xs ${T.subtext}`}>Totale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl xl:text-xl font-bold text-green-600 dark:text-green-400">
                  {stats.members}
                </div>
                <div className={`text-xs ${T.subtext}`}>Membri</div>
              </div>
              <div className="text-center">
                <div className="text-2xl xl:text-xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.active}
                </div>
                <div className={`text-xs ${T.subtext}`}>Attivi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl xl:text-xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.withAccount}
                </div>
                <div className={`text-xs ${T.subtext}`}>Con Account</div>
              </div>
            </div>

            {/* Azioni principali */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowPlayerForm(true)}
                className={`${T.btnPrimary} px-4 py-2 text-sm`}
              >
                ➕ Nuovo Giocatore
              </button>
              <button
                onClick={handleCreateFromAccount}
                disabled={loadingAccounts}
                className={`${T.btnSecondary} px-4 py-2 text-sm ${loadingAccounts ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loadingAccounts ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Caricamento...
                  </>
                ) : (
                  <>👤 Crea da Account</>
                )}
              </button>
              <button
                onClick={() => setShowTools(true)}
                className={`${T.btnSecondary} px-4 py-2 text-sm`}
              >
                🛠️ Strumenti
              </button>
            </div>
          </div>
        </div>

        {/* Filtri e ricerca */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cerca per nome, email, telefono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${T.input} w-full`}
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`${T.input} min-w-[150px]`}
            >
              <option value="all">Tutte le categorie</option>
              <option value={PLAYER_CATEGORIES.MEMBER}>Membri</option>
              <option value={PLAYER_CATEGORIES.NON_MEMBER}>Non Membri</option>
              <option value={PLAYER_CATEGORIES.GUEST}>Ospiti</option>
              <option value={PLAYER_CATEGORIES.VIP}>VIP</option>
            </select>
          </div>
        </div>

        {/* Lista giocatori */}
        <div className="space-y-4">
          {filteredPlayers.length === 0 ? (
            <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl`}>
              <div className="text-6xl mb-4">👥</div>
              <h3 className={`text-xl font-bold mb-2 ${T.text}`}>Nessun giocatore trovato</h3>
              <p className={`${T.subtext} mb-4`}>
                {searchTerm || filterCategory !== 'all'
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Inizia aggiungendo il primo giocatore al tuo CRM'}
              </p>
              <button
                onClick={() => setShowPlayerForm(true)}
                className={`${T.btnPrimary} px-6 py-3`}
              >
                ➕ Aggiungi Primo Giocatore
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 [@media(min-width:2200px)]:grid-cols-5 items-stretch">
              {filteredPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  playersById={playersById}
                  onEdit={() => {
                    setEditingPlayer(player);
                    setShowPlayerForm(true);
                  }}
                  onDelete={() => handleDeletePlayer(player.id)}
                  onView={() => setSelectedPlayerId(player.id)}
                  onStats={() => onOpenStats?.(player.id)}
                  T={T}
                />
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Modal dettagli giocatore */}
      {selectedPlayer && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPlayerId(null)}
          title={`${selectedPlayer.name || 'Giocatore'} - Dettagli`}
          size="large"
        >
          <PlayerDetails
            player={selectedPlayer}
            onUpdate={(updates) => handleUpdatePlayer(selectedPlayer.id, updates)}
            onClose={() => setSelectedPlayerId(null)}
            T={T}
          />
        </Modal>
      )}

      {/* Modal form giocatore */}
      {showPlayerForm && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowPlayerForm(false);
            setEditingPlayer(null);
          }}
          title={editingPlayer ? 'Modifica Giocatore' : 'Nuovo Giocatore'}
          size="large"
        >
          <PlayerForm
            player={editingPlayer}
            onSave={
              editingPlayer
                ? (updates) => {
                    handleUpdatePlayer(editingPlayer.id, updates);
                    setShowPlayerForm(false);
                    setEditingPlayer(null);
                  }
                : handleAddPlayer
            }
            onCancel={() => {
              setShowPlayerForm(false);
              setEditingPlayer(null);
            }}
            T={T}
          />
        </Modal>
      )}

      {/* Modal strumenti CRM */}
      {showTools && (
        <Modal isOpen={true} onClose={() => setShowTools(false)} title="Strumenti CRM" size="large">
          <CRMTools
            players={players}
            onClose={() => setShowTools(false)}
            onBulkOperation={(action) => {
              // Implementa le operazioni bulk
              console.log('Bulk operation:', action);
            }}
            onRefreshData={() => {
              // Refresh data se necessario
              console.log('Refreshing data...');
            }}
            T={T}
          />
        </Modal>
      )}

      {/* Modal seleziona account */}
      {showAccountPicker && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowAccountPicker(false);
            setAccounts([]);
            setAccountSearch('');
          }}
          title="Seleziona Account da Convertire"
          size="large"
        >
          <div className="space-y-4">
            {/* Informazioni */}
            <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
              <p className={`text-sm ${T.subtext} mb-2`}>
                Seleziona un account registrato per creare automaticamente un profilo giocatore
                collegato.
              </p>
              <p className={`text-xs ${T.subtext}`}>
                Vengono mostrati solo gli account non ancora collegati a un giocatore.
              </p>
            </div>

            {/* Ricerca */}
            <input
              type="text"
              placeholder="Cerca per nome o email..."
              value={accountSearch}
              onChange={(e) => setAccountSearch(e.target.value)}
              className={`${T.input} w-full`}
              autoFocus
            />

            {/* Lista account */}
            <div className={`${T.cardBg} ${T.border} rounded-lg max-h-[400px] overflow-y-auto`}>
              {loadingAccounts ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className={`mt-4 ${T.subtext}`}>Caricamento account...</p>
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-3">👥</div>
                  <p className={`text-lg font-medium ${T.text} mb-2`}>
                    {accountSearch.trim() ? 'Nessun account trovato' : 'Nessun account disponibile'}
                  </p>
                  <p className={`text-sm ${T.subtext}`}>
                    {accountSearch.trim()
                      ? 'Prova a modificare i criteri di ricerca'
                      : 'Tutti gli account registrati sono già collegati a un giocatore'}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAccounts.map((acc) => (
                    <li
                      key={acc.uid}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {(acc.firstName || acc.displayName || acc.email || '?')
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className={`font-medium ${T.text} truncate`}>
                              {acc.firstName || acc.lastName
                                ? `${acc.firstName || ''} ${acc.lastName || ''}`.trim()
                                : acc.displayName || 'Senza nome'}
                            </div>
                            <div className={`text-sm ${T.subtext} truncate`}>
                              {acc.email || 'Nessuna email'}
                            </div>
                            {acc.phone && (
                              <div className={`text-xs ${T.subtext}`}>📱 {acc.phone}</div>
                            )}
                          </div>
                        </div>

                        {/* Bottone */}
                        <button
                          onClick={() => handleSelectAccount(acc)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium flex-shrink-0 shadow-lg hover:shadow-xl"
                        >
                          Crea Giocatore
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Statistiche */}
            {!loadingAccounts && (
              <div className="flex justify-between items-center text-sm">
                <span className={T.subtext}>
                  {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''}{' '}
                  disponibili
                </span>
                <span className={T.subtext}>
                  {players.filter((p) => p.isAccountLinked).length} giocatori collegati
                </span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
