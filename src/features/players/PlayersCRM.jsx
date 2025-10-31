// =============================================
// FILE: src/features/players/PlayersCRM.jsx
// Sistema CRM completo per la gestione giocatori
// =============================================

import React, { useMemo, useState, useEffect } from 'react';
import { getEffectiveRanking } from './utils/playerRanking.js';
import { Link, useSearchParams } from 'react-router-dom';
import Section from '@ui/Section.jsx';
import Modal from '@ui/Modal.jsx';
import ConfirmModal from '@ui/ConfirmModal.jsx';
import { toast } from '@ui/Toast.jsx';
import ExportModal from '@ui/ExportModal.jsx';
import VirtualizedList from '@ui/VirtualizedList.jsx';
import { uid } from '@lib/ids.js';
import { byPlayerFirstAlpha } from '@lib/names.js';
import { createPlayerSchema, PLAYER_CATEGORIES } from './types/playerTypes.js';
import PlayerCard from './components/PlayerCard';
import PlayerDetails from './components/PlayerDetails';
import PlayerForm from './components/PlayerForm';
import CRMTools from './components/CRMTools';
import { useAuth } from '@contexts/AuthContext.jsx';
import { PlayerCardSkeleton } from '@ui/SkeletonLoader.jsx';
import { useDebounce } from '@hooks/useDebounce.js';

export default function PlayersCRM({
  state,
  setState,
  onOpenStats,
  playersById,
  T,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  isLoading = false,
}) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [filterRegistrationDate, setFilterRegistrationDate] = useState('all'); // 'all', 'today', 'week', 'month', 'older'
  const [filterLastActivity, setFilterLastActivity] = useState('all'); // 'all', 'today', 'week', 'month', 'older'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'registration', 'lastActivity', 'rating'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTools, setShowTools] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // 🚀 OTTIMIZZAZIONE: Debounce del search term (riduce filtri dell'80%)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

  // 🚀 OTTIMIZZAZIONE: Pre-calcola indice di ricerca per filtri più veloci
  const playersWithSearchIndex = useMemo(() => {
    return players.map((player) => ({
      ...player,
      _searchIndex: [player.name, player.firstName, player.lastName, player.email, player.phone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    }));
  }, [players]);

  // Utility per filtri data
  const getDateFilter = (dateFilter) => {
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  };

  // Filtri e ricerca
  const filteredPlayers = useMemo(() => {
    // 🚀 OTTIMIZZAZIONE: Usa players con indice di ricerca preprocessato
    let filtered = [...playersWithSearchIndex];

    // Filtro per categoria
    if (filterCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === filterCategory);
    }

    // Filtro per stato
    if (filterStatus !== 'all') {
      filtered = filtered.filter((p) => {
        const isActive = p.isActive !== false;
        return filterStatus === 'active' ? isActive : !isActive;
      });
    }

    // Filtro per data registrazione
    if (filterRegistrationDate !== 'all') {
      const dateThreshold = getDateFilter(filterRegistrationDate);
      if (dateThreshold) {
        filtered = filtered.filter((p) => {
          const regDate = new Date(p.createdAt || p.registrationDate);
          return regDate >= dateThreshold;
        });
      }
    }

    // Filtro per ultimo accesso
    if (filterLastActivity !== 'all') {
      const dateThreshold = getDateFilter(filterLastActivity);
      if (dateThreshold) {
        filtered = filtered.filter((p) => {
          if (!p.lastActivity) return false;
          const lastActivity = new Date(p.lastActivity);
          return lastActivity >= dateThreshold;
        });
      }
    }

    // 🚀 OTTIMIZZAZIONE: Ricerca usando indice preprocessato (più veloce)
    if (debouncedSearchTerm.trim()) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((p) => p._searchIndex?.includes(term));
    }

    // Filtro per ordinamento per rating: mostra solo chi partecipa al campionato
    if (sortBy === 'rating') {
      filtered = filtered.filter(
        (p) => p.tournamentData?.isParticipant && p.tournamentData?.isActive
      );
    }

    // Ordinamento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'registration':
          const dateA = new Date(a.createdAt || a.registrationDate || 0);
          const dateB = new Date(b.createdAt || b.registrationDate || 0);
          return dateB - dateA; // Più recenti prima
        case 'lastActivity':
          const activityA = new Date(a.lastActivity || 0);
          const activityB = new Date(b.lastActivity || 0);
          return activityB - activityA; // Più recenti prima
        case 'rating': {
          // Usa il ranking effettivo (calcolato dal contesto + leaderboard)
          const ratingA = getEffectiveRanking(a, playersById) || 0;
          const ratingB = getEffectiveRanking(b, playersById) || 0;
          return ratingB - ratingA; // Più alti prima
        }
        case 'name':
        default:
          return byPlayerFirstAlpha(a, b);
      }
    });

    return filtered;
  }, [
    playersWithSearchIndex,
    filterCategory,
    filterStatus,
    filterRegistrationDate,
    filterLastActivity,
    debouncedSearchTerm,
    sortBy,
  ]);

  // Statistiche rapide
  const stats = useMemo(() => {
    const total = players.length;
    const filtered = filteredPlayers.length;
    const members = players.filter((p) => p.category === PLAYER_CATEGORIES.MEMBER).length;
    const active = players.filter((p) => p.isActive !== false).length;
    const withAccount = players.filter((p) => p.isAccountLinked).length;

    return { total, filtered, members, active, withAccount };
  }, [players, filteredPlayers.length]);

  // Conteggio filtri attivi
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterCategory !== 'all') count++;
    if (filterStatus !== 'all') count++;
    if (filterRegistrationDate !== 'all') count++;
    if (filterLastActivity !== 'all') count++;
    if (searchTerm.trim()) count++;
    return count;
  }, [filterCategory, filterStatus, filterRegistrationDate, filterLastActivity, searchTerm]);

  const handleAddPlayer = async (playerData) => {
    try {
      if (onAddPlayer) {
        await onAddPlayer(playerData, user);
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

      toast.success(`Giocatore "${playerData.name}" aggiunto con successo`);
      setShowPlayerForm(false);
    } catch (error) {
      console.error('Error adding player:', error);
      toast.error("Errore durante l'aggiunta del giocatore. Riprova.");
    }
  };

  const handleUpdatePlayer = async (playerId, updates) => {
    try {
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

      toast.success('Giocatore aggiornato con successo');
    } catch (error) {
      console.error('Error updating player:', error);
      toast.error("Errore durante l'aggiornamento del giocatore. Riprova.");
    }
  };

  const handleDeletePlayer = async (playerId) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    setPlayerToDelete(player);
    setShowConfirmDelete(true);
  };

  const confirmDeletePlayer = async () => {
    if (!playerToDelete) return;

    try {
      if (onDeletePlayer) {
        await onDeletePlayer(playerToDelete.id);
      } else {
        // Fallback to local state if no Firebase function provided
        setState((s) => {
          const cur = Array.isArray(s?.players) ? s.players : [];
          return {
            ...(s || { players: [], matches: [] }),
            players: cur.filter((p) => p.id !== playerToDelete.id),
          };
        });
      }

      toast.success(`Giocatore "${playerToDelete.name}" eliminato con successo`);
      setSelectedPlayerId(null);
    } catch (error) {
      console.error('Error deleting player:', error);
      toast.error("Errore durante l'eliminazione del giocatore. Riprova.");
    } finally {
      setShowConfirmDelete(false);
      setPlayerToDelete(null);
    }
  };

  const handleCreateFromAccount = async () => {
    try {
      setLoadingAccounts(true);
      const { listAllUserProfiles } = await import('@services/auth.jsx');
      const res = await listAllUserProfiles(500);
      setAccounts(res || []);
      setAccountSearch('');
      setShowAccountPicker(true);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Errore nel caricamento degli account. Riprova.');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleSelectAccount = async (account) => {
    try {
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

      // Crea il giocatore nel club
      const newPlayer = await handleAddPlayer(playerData);

      // Collega l'account globale al giocatore del club
      const { linkUserToClub } = await import('@services/auth.jsx');
      await linkUserToClub(account.uid, state?.clubId, newPlayer.id);

      toast.success(`Giocatore creato e collegato all'account ${account.email}`);
      setShowAccountPicker(false);
      setAccounts([]);
      setAccountSearch('');
    } catch (error) {
      console.error('Error linking account to player:', error);
      toast.error('Errore nel collegamento account-giocatore. Riprova.');
    }
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
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 xl:gap-3 flex-1">
              <div className="text-center">
                <div className={`text-2xl xl:text-xl font-bold ${T.accentInfo}`}>
                  {stats.filtered}
                  {stats.total !== stats.filtered && (
                    <span className={`text-sm ${T.subtext}`}>/{stats.total}</span>
                  )}
                </div>
                <div className={`text-xs ${T.subtext}`}>
                  {stats.total !== stats.filtered ? 'Filtrati' : 'Totale'}
                  {activeFiltersCount > 0 && (
                    <span className={`ml-1 ${T.accentWarning}`}>({activeFiltersCount})</span>
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl xl:text-xl font-bold ${T.accentSuccess}`}>
                  {stats.members}
                </div>
                <div className={`text-xs ${T.subtext}`}>Membri</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl xl:text-xl font-bold ${T.accentWarning}`}>
                  {stats.active}
                </div>
                <div className={`text-xs ${T.subtext}`}>Attivi</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl xl:text-xl font-bold ${T.accentInfo}`}>
                  {stats.withAccount}
                </div>
                <div className={`text-xs ${T.subtext}`}>Con Account</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl xl:text-xl font-bold ${T.accentInfo}`}>
                  {filteredPlayers.filter((p) => p.tournamentData?.isParticipant).length}
                </div>
                <div className={`text-xs ${T.subtext}`}>Torneo</div>
              </div>
            </div>

            {/* Azioni principali */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className={`${T.btnSecondary} px-3 py-2 text-sm`}
                title={viewMode === 'grid' ? 'Passa a vista lista' : 'Passa a vista griglia'}
              >
                {viewMode === 'grid' ? '📋 Lista' : '⊞ Griglia'}
              </button>
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
              <button
                onClick={() => setShowExportModal(true)}
                className={`${T.btnSecondary} px-4 py-2 text-sm`}
              >
                📥 Esporta
              </button>
            </div>
          </div>
        </div>

        {/* Filtri e ricerca */}
        <div className="space-y-4 mb-6">
          {/* Riga principale: ricerca e filtri base */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
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
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`${T.input} min-w-[140px]`}
              >
                <option value="name">Ordina per Nome</option>
                <option value="registration">Data Registrazione</option>
                <option value="lastActivity">Ultimo Accesso</option>
                <option value="rating">Rating</option>
              </select>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`${T.btnSecondary} px-3 py-2 text-sm whitespace-nowrap`}
              >
                🔍 Filtri {showAdvancedFilters ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {/* Filtri avanzati espandibili */}
          {showAdvancedFilters && (
            <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stato */}
                <div>
                  <label className={`text-sm font-medium ${T.text} mb-2 block`}>
                    Stato Account
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`${T.input} w-full`}
                  >
                    <option value="all">Tutti</option>
                    <option value="active">Attivi</option>
                    <option value="inactive">Inattivi</option>
                  </select>
                </div>

                {/* Data registrazione */}
                <div>
                  <label className={`text-sm font-medium ${T.text} mb-2 block`}>
                    Registrazione
                  </label>
                  <select
                    value={filterRegistrationDate}
                    onChange={(e) => setFilterRegistrationDate(e.target.value)}
                    className={`${T.input} w-full`}
                  >
                    <option value="all">Tutte le date</option>
                    <option value="today">Oggi</option>
                    <option value="week">Questa settimana</option>
                    <option value="month">Questo mese</option>
                  </select>
                </div>

                {/* Ultimo accesso */}
                <div>
                  <label className={`text-sm font-medium ${T.text} mb-2 block`}>
                    Ultimo Accesso
                  </label>
                  <select
                    value={filterLastActivity}
                    onChange={(e) => setFilterLastActivity(e.target.value)}
                    className={`${T.input} w-full`}
                  >
                    <option value="all">Tutti</option>
                    <option value="today">Oggi</option>
                    <option value="week">Questa settimana</option>
                    <option value="month">Questo mese</option>
                  </select>
                </div>
              </div>

              {/* Pulsante reset filtri */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterRegistrationDate('all');
                    setFilterLastActivity('all');
                    setSearchTerm('');
                  }}
                  className={`${T.btnSecondary} px-4 py-2 text-sm`}
                >
                  🗑️ Reset Filtri
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lista giocatori */}
        <div className="space-y-4">
          {/* 🚀 OTTIMIZZAZIONE: Counter chiaro dei giocatori filtrati */}
          {!isLoading && filteredPlayers.length > 0 && (
            <div className="flex items-center justify-between px-2">
              <p className={`text-sm ${T.subtext}`}>
                Visualizzati{' '}
                <span className={`font-semibold ${T.accentInfo}`}>{filteredPlayers.length}</span>
                {filteredPlayers.length !== players.length && (
                  <>
                    {' '}
                    di <span className="font-semibold">{players.length}</span>
                  </>
                )}{' '}
                giocatori
                {activeFiltersCount > 0 && (
                  <span className={`ml-2 ${T.accentWarning}`}>
                    (con {activeFiltersCount} filtro{activeFiltersCount > 1 ? 'i' : ''} attivo
                    {activeFiltersCount > 1 ? 'i' : ''})
                  </span>
                )}
              </p>
              <p className={`text-xs ${T.subtext}`}>
                Ordinamento:{' '}
                <span className="font-medium">
                  {sortBy === 'name' && 'Alfabetico'}
                  {sortBy === 'registration' && 'Data registrazione'}
                  {sortBy === 'lastActivity' && 'Ultima attività'}
                  {sortBy === 'rating' && 'Ranking'}
                </span>
              </p>
            </div>
          )}

          {isLoading ? (
            // Skeleton loaders durante il caricamento
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 [@media(min-width:2200px)]:grid-cols-5 items-stretch">
              {Array.from({ length: 8 }, (_, i) => (
                <PlayerCardSkeleton key={i} T={T} />
              ))}
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl`}>
              <div className="text-6xl mb-4">�</div>
              <h3 className={`text-xl font-bold mb-2 ${T.text}`}>
                {activeFiltersCount > 0 ? 'Nessun giocatore trovato' : 'Nessun giocatore presente'}
              </h3>
              <p className={`${T.subtext} mb-4`}>
                {activeFiltersCount > 0
                  ? 'Prova a modificare i filtri di ricerca o rimuovi alcuni filtri'
                  : 'Inizia aggiungendo il primo giocatore al tuo CRM'}
              </p>
              {activeFiltersCount > 0 ? (
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterRegistrationDate('all');
                      setFilterLastActivity('all');
                      setSearchTerm('');
                    }}
                    className={`${T.btnSecondary} px-4 py-2`}
                  >
                    🗑️ Rimuovi Filtri
                  </button>
                  <button
                    onClick={() => setShowPlayerForm(true)}
                    className={`${T.btnPrimary} px-4 py-2`}
                  >
                    ➕ Nuovo Giocatore
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowPlayerForm(true)}
                  className={`${T.btnPrimary} px-6 py-3`}
                >
                  ➕ Aggiungi Primo Giocatore
                </button>
              )}
            </div>
          ) : filteredPlayers.length > 50 ? (
            // Virtualized list per molte righe
            <VirtualizedList
              items={filteredPlayers}
              itemHeight={120} // Altezza stimata del PlayerCard
              containerHeight={800}
              className="border border-gray-700 rounded-lg"
              T={T}
              renderItem={(player, index) => (
                <div className="p-2">
                  <PlayerCard
                    player={player}
                    playersById={playersById}
                    onEdit={() => {
                      setSelectedPlayerId(player.id);
                      setIsEditMode(true);
                    }}
                    onDelete={() => handleDeletePlayer(player.id)}
                    onView={() => setSelectedPlayerId(player.id)}
                    onStats={() => onOpenStats?.(player.id)}
                    T={T}
                  />
                </div>
              )}
            />
          ) : viewMode === 'list' ? (
            // Vista lista
            <div className="space-y-2">
              {filteredPlayers.map((player) => (
                <div key={player.id} className={`${T.cardBg} ${T.border} rounded-lg p-3`}>
                  <PlayerCard
                    player={player}
                    playersById={playersById}
                    onEdit={() => {
                      setSelectedPlayerId(player.id);
                    }}
                    onDelete={() => handleDeletePlayer(player.id)}
                    onView={() => setSelectedPlayerId(player.id)}
                    onStats={() => onOpenStats?.(player.id)}
                    T={T}
                  />
                </div>
              ))}
            </div>
          ) : (
            // Vista griglia
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 [@media(min-width:2200px)]:grid-cols-5 items-stretch">
              {filteredPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  playersById={playersById}
                  onEdit={() => {
                    setSelectedPlayerId(player.id);
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
          size="xxxl"
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
                <ul className="divide-y divide-gray-700">
                  {filteredAccounts.map((acc) => (
                    <li key={acc.uid} className="p-4 hover:bg-gray-700/50 transition-colors">
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

      {/* Modal Form Giocatore */}
      {showPlayerForm && (
        <Modal
          isOpen={showPlayerForm}
          onClose={() => setShowPlayerForm(false)}
          title="Aggiungi Nuovo Giocatore"
          maxWidth="2xl"
        >
          <PlayerForm
            player={null}
            onSave={handleAddPlayer}
            onCancel={() => setShowPlayerForm(false)}
            T={T}
          />
        </Modal>
      )}

      {/* Modal di conferma eliminazione */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setPlayerToDelete(null);
        }}
        onConfirm={confirmDeletePlayer}
        title="Conferma Eliminazione"
        message={`Sei sicuro di voler eliminare il giocatore "${playerToDelete?.name}"? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        T={T}
      />

      {/* Modal di esportazione */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        players={players}
        filteredPlayers={filteredPlayers}
        T={T}
      />

      {/* Toast notifications rendered globally by NotificationProvider */}
    </>
  );
}
