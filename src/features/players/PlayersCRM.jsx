// =============================================
// FILE: src/features/players/PlayersCRM.jsx
// Sistema CRM completo per la gestione giocatori
// =============================================

import React, { useMemo, useState, useEffect } from 'react';
import { getEffectiveRanking } from './utils/playerRanking.js';
import { useSearchParams } from 'react-router-dom';
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
import PlayersStatsHeader from './components/PlayersStatsHeader';
import PlayersFilterBar from './components/PlayersFilterBar';
import { useAuth } from '@contexts/AuthContext.jsx';
import { PlayerCardSkeleton } from '@ui/SkeletonLoader.jsx';
import { useDebounce } from '@hooks/useDebounce.js';
import { listAllUserProfiles } from '@services/auth.jsx';
import OrphanProfilesLinkingModal from './components/OrphanProfilesLinkingModal';

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
  const [showLinkOrphan, setShowLinkOrphan] = useState(false);
  const [orphanProfiles, setOrphanProfiles] = useState([]);
  const [loadingOrphans, setLoadingOrphans] = useState(false);
  const [linking, setLinking] = useState(false);
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
        case 'registration': {
          const dateA = new Date(a.createdAt || a.registrationDate || 0);
          const dateB = new Date(b.createdAt || b.registrationDate || 0);
          return dateB - dateA; // Più recenti prima
        }
        case 'lastActivity': {
          const activityA = new Date(a.lastActivity || 0);
          const activityB = new Date(b.lastActivity || 0);
          return activityB - activityA; // Più recenti prima
        }
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

  const handleOpenLinkOrphan = async () => {
    try {
      console.log('🔍 [PlayersCRM] Apertura pannello profili orfani', {
        clubId: state?.clubId,
        timestamp: new Date().toISOString()
      });
      
      setLoadingOrphans(true);
      setShowLinkOrphan(true);
      
      // ✅ NUOVO APPROCCIO: Identifica orfani client-side (come PlayerDetails)
      console.log('🔍 [PlayersCRM] Identificazione profili orfani client-side...');
      
      // 1. Carica tutti gli utenti Firebase registrati
      const registeredUsers = await listAllUserProfiles(1000);
      const registeredUids = new Set(registeredUsers.map(u => u.uid));
      
      console.log('📊 [PlayersCRM] Utenti Firebase registrati:', registeredUsers.length);
      
      // 2. Identifica giocatori senza account Firebase collegato
      const orphans = players.filter(player => {
        const linkedUid = player.linkedAccountId || player.linkedFirebaseUid || player.firebaseUid;
        const userId = player.userId;
        
        // È orfano se:
        // - Non ha linkedAccountId/linkedFirebaseUid valido, OPPURE
        // - Ha userId ma non esiste in Firebase Auth
        const hasValidLink = linkedUid && registeredUids.has(linkedUid);
        const userIdExistsInAuth = userId && registeredUids.has(userId);
        
        return !hasValidLink && !userIdExistsInAuth;
      });
      
      console.log('✅ [PlayersCRM] Profili orfani identificati:', {
        total: orphans.length,
        orphans: orphans.slice(0, 5).map(o => ({
          userId: o.userId,
          name: `${o.firstName} ${o.lastName}`,
          email: o.email,
          hasLinkedAccountId: !!o.linkedAccountId
        }))
      });
      
      setOrphanProfiles(orphans);
      
      if (orphans.length === 0) {
        toast.success('✅ Nessun profilo orfano - tutti i giocatori hanno account Firebase!');
      } else {
        toast.info(`📋 Trovati ${orphans.length} profili senza account Firebase`);
      }
      
    } catch (error) {
      console.error('❌ [PlayersCRM] Errore identificazione profili orfani:', {
        error: error.message,
        stack: error.stack,
        clubId: state?.clubId
      });
      toast.error(`Errore: ${error.message || 'Riprova'}`);
    } finally {
      setLoadingOrphans(false);
    }
  };

  const handleLinkOrphan = async (orphanId, firebaseUid, firebaseEmail) => {
    const orphan = orphanProfiles.find(p => p.id === orphanId || p.userId === orphanId);
    
    if (!orphan) return;

    if (!window.confirm(
      `Confermi di voler collegare:\n\n` +
      `Profilo orfano: ${orphan.firstName || orphan.name} (${orphan.email})\n` +
      `→ Utente Firebase: ${firebaseEmail}\n\n` +
      `Questa operazione aggiornerà il campo userId e tutte le reference.`
    )) {
      return;
    }

    try {
      setLinking(true);
      
      // ✅ PATTERN REPLICATO DA PlayerDetails: usa onUpdatePlayer invece di Cloud Function
      await handleUpdatePlayer(orphan.id, {
        isAccountLinked: true,
        linkedAccountId: firebaseUid,
        linkedAccountEmail: firebaseEmail,
      });

      toast.success('Profilo collegato con successo!');
      
      // ✅ Ricarica profili orfani CLIENT-SIDE (come all'apertura)
      const registeredUsers = await listAllUserProfiles(1000);
      const registeredUids = new Set(registeredUsers.map(u => u.uid));
      
      const updatedOrphans = players.filter(player => {
        const linkedUid = player.linkedAccountId || player.linkedFirebaseUid || player.firebaseUid;
        const userId = player.userId;
        const hasValidLink = linkedUid && registeredUids.has(linkedUid);
        const userIdExistsInAuth = userId && registeredUids.has(userId);
        return !hasValidLink && !userIdExistsInAuth;
      });
      
      setOrphanProfiles(updatedOrphans);
      
      if (updatedOrphans.length === 0) {
        setShowLinkOrphan(false);
        toast.success('✅ Tutti i profili sono stati collegati!');
      }

    } catch (error) {
      console.error('Error linking:', error);
      toast.error('Errore: ' + error.message);
    } finally {
      setLinking(false);
    }
  };


  return (
    <>
      <Section title="CRM Giocatori" T={T}>
        {/* Nuova Header Statistiche */}
        <PlayersStatsHeader 
          stats={{
            ...stats,
            tournamentParticipants: filteredPlayers.filter((p) => p.tournamentData?.isParticipant).length
          }}
          activeFiltersCount={activeFiltersCount}
          T={T}
        />

        {/* Barra Azioni */}
        <div className="flex flex-wrap justify-end gap-2 mb-4">
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
                onClick={handleOpenLinkOrphan}
                disabled={loadingOrphans}
                className={`${T.btnSecondary} px-4 py-2 text-sm ${loadingOrphans ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loadingOrphans ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Caricamento...
                  </>
                ) : (
                  <>🔗 Collega Profili</>
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

        {/* Filtri e ricerca */}
        <PlayersFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showAdvancedFilters={showAdvancedFilters}
          setShowAdvancedFilters={setShowAdvancedFilters}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterRegistrationDate={filterRegistrationDate}
          setFilterRegistrationDate={setFilterRegistrationDate}
          filterLastActivity={filterLastActivity}
          setFilterLastActivity={setFilterLastActivity}
          onResetFilters={() => {
            setFilterStatus('all');
            setFilterRegistrationDate('all');
            setFilterLastActivity('all');
            setSearchTerm('');
          }}
          activeFiltersCount={activeFiltersCount}
          T={T}
        />

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
          ) : filteredPlayers.length > 1000 ? (
            // Virtualized grid per molti giocatori (>1000)
            <VirtualizedList
              items={filteredPlayers}
              itemHeight={280 // Altezza stimata del PlayerCard in griglia
              }
              containerHeight={800}
              className="border border-gray-700 rounded-lg"
              T={T}
              renderItem={(player) => (
                <div
                  className="inline-block w-1/5 p-2 align-top"
                  style={{
                    width: 'calc(100% / 5)',
                    boxSizing: 'border-box',
                  }}
                >
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

      {/* Modal Collega Profili Orfani */}
      {showLinkOrphan && (
        <OrphanProfilesLinkingModal
          orphanProfiles={orphanProfiles}
          clubId={state?.clubId}
          onLink={handleLinkOrphan}
          onClose={() => setShowLinkOrphan(false)}
        />
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
