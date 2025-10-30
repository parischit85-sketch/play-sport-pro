// =============================================
// FILE: src/features/players/components/PlayerDetails.jsx
// Vista dettagliata del giocatore con tab multiple
// REFACTORED: 2025-10-15 - Slim container con useReducer
// FASE 2: 2025-10-16 - Added permissions & security
// =============================================

import React, { useMemo, useReducer, useEffect, useCallback, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listAllUserProfiles } from '@services/auth.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { computeClubRanking } from '@lib/ranking-club.js';

// Hooks
import { usePlayerPermissions } from '../hooks/usePlayerPermissions';
import { useNotifications } from '../../../contexts/NotificationContext'; // FASE 2: Global notifications

// Componenti refactored (sempre caricati - necessari per initial render)
import PlayerDetailsHeader from './PlayerDetails/PlayerDetailsHeader';
import PlayerAccountLinking from './PlayerDetails/PlayerAccountLinking';
import PlayerEditMode from './PlayerDetails/PlayerEditMode';
import PlayerOverviewTab from './PlayerDetails/PlayerOverviewTab';
import PlayerDataExport from './PlayerDetails/PlayerDataExport'; // FASE 2: GDPR Export
import PlayerDataDelete from './PlayerDetails/PlayerDataDelete'; // FASE 2: GDPR Delete
import PlayerInfoPanel from './PlayerDetails/PlayerInfoPanel'; // FASE 3: Info Panel

// 🎯 FASE 2: Code Splitting - Lazy load dei tab per ridurre bundle size
const PlayerNotes = lazy(() => import('./PlayerNotes'));
const PlayerWallet = lazy(() => import('./PlayerWallet'));
const PlayerCommunications = lazy(() => import('./PlayerCommunications'));
const PlayerBookingHistory = lazy(() => import('./PlayerBookingHistory'));
const PlayerTournamentTab = lazy(() => import('./PlayerTournamentTab'));
const PlayerMedicalTab = lazy(() => import('./PlayerMedicalTab'));

// Reducer
import playerDetailsReducer, {
  createInitialState,
  ACTIONS,
} from './PlayerDetails/reducers/playerDetailsReducer';

export default function PlayerDetails({ player, onUpdate, onClose, T }) {
  // Provide a safe default theme classes object when not passed (tests often omit it)
  const theme = T || {
    border: 'border-gray-200 dark:border-gray-700',
    text: 'text-gray-800 dark:text-gray-200',
    muted: 'text-gray-500 dark:text-gray-400',
  };
  const { clubId, players, matches, leaderboard } = useClub();
  // In integration tests, component may render outside a Router. Provide a safe fallback.
  let searchParams;
  let setSearchParams;
  try {
    [searchParams, setSearchParams] = useSearchParams();
  } catch (e) {
    const noop = () => {};
    searchParams = new URLSearchParams();
    setSearchParams = noop;
  }

  // 🔒 Permissions check (FASE 2 - Security)
  const permissions = usePlayerPermissions(player);

  // 🎨 Notifications (FASE 2 - UX): Toast + ConfirmDialog
  const { showSuccess, showError, confirm } = useNotifications();

  // 🎯 State management con useReducer (sostituisce 15+ useState)
  const [state, dispatch] = useReducer(playerDetailsReducer, createInitialState(player));

  // Note: ESC handling is managed by the parent Modal for consistency across the app

  // 🏆 Calcola il ranking reale dalle partite
  const playerWithRealRating = useMemo(() => {
    if (!clubId || !player) return player;

    const tournamentPlayers = players.filter(
      (p) => p.tournamentData?.isParticipant === true && p.tournamentData?.isActive === true
    );

    const rankingData = computeClubRanking(tournamentPlayers, matches, clubId, {
      leaderboardMap: leaderboard,
    });
    const calculatedPlayer = rankingData.players.find((p) => p.id === player.id);

    if (calculatedPlayer) {
      return { ...player, rating: calculatedPlayer.rating };
    }

    return player;
  }, [player, players, matches, clubId, leaderboard]);

  // 🔧 URL tab parameter handling
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tabParam });
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('tab');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // 📋 Account linking helpers
  const linkedEmailsSet = useMemo(
    () =>
      new Set(
        (players || [])
          .filter((p) => p.id !== player.id && (p.isAccountLinked || p.linkedAccountEmail))
          .map((p) => (p.linkedAccountEmail || '').toLowerCase())
          .filter(Boolean)
      ),
    [players, player.id]
  );

  const linkedIdsSet = useMemo(
    () =>
      new Set(
        (players || [])
          .filter((p) => p.id !== player.id && (p.isAccountLinked || p.linkedAccountId))
          .map((p) => p.linkedAccountId)
          .filter(Boolean)
      ),
    [players, player.id]
  );

  // 🔄 Handlers with useCallback
  const handleToggleEditMode = useCallback(async () => {
    if (!state.isEditMode) {
      // Entering edit mode
      dispatch({ type: ACTIONS.TOGGLE_EDIT_MODE, payload: { player } });
    } else {
      // Exiting edit mode - check unsaved changes
      if (state.isDirty) {
        const confirmed = await confirm({
          title: 'Modifiche non salvate',
          message: 'Hai modifiche non salvate. Sei sicuro di voler uscire senza salvare?',
          variant: 'warning',
          confirmText: 'Esci senza salvare',
          cancelText: 'Continua a modificare',
        });

        if (!confirmed) {
          return;
        }
      }
      dispatch({ type: ACTIONS.CANCEL_EDIT });
    }
  }, [state.isEditMode, state.isDirty, player, confirm]);

  const handleSaveEdit = useCallback(async () => {
    // Validate
    const errors = {};
    const { editFormData } = state;

    if (!editFormData.firstName?.trim()) errors.firstName = 'Nome richiesto';
    if (!editFormData.lastName?.trim()) errors.lastName = 'Cognome richiesto';
    if (editFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = 'Email non valida';
    }
    if (editFormData.phone && !/^[\d\s+\-()]+$/.test(editFormData.phone)) {
      errors.phone = 'Numero di telefono non valido';
    }

    if (Object.keys(errors).length > 0) {
      dispatch({ type: ACTIONS.SET_FORM_ERRORS, payload: errors });
      return;
    }

    // Save
    dispatch({ type: ACTIONS.SET_LOADING, payload: { saving: true } });

    try {
      const { baseRating, rating, ...filteredData } = editFormData;
      const playerData = {
        ...filteredData,
        name: `${editFormData.firstName} ${editFormData.lastName}`.trim(),
        updatedAt: new Date().toISOString(),
      };

      await onUpdate(playerData);
      showSuccess('Modifiche salvate con successo');
      setTimeout(() => {
        dispatch({ type: ACTIONS.CANCEL_EDIT });
      }, 1000);
    } catch (error) {
      showError(`Errore: ${error.message}`);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { saving: false } });
    }
  }, [state.editFormData, onUpdate]);

  const handleToggleStatus = useCallback(async () => {
    const action = player.isActive ? 'disattivare' : 'attivare';

    const confirmed = await confirm({
      title: `${player.isActive ? 'Disattiva' : 'Attiva'} giocatore`,
      message: `Sei sicuro di voler ${action} "${player.firstName} ${player.lastName}"?`,
      variant: player.isActive ? 'warning' : 'success',
      confirmText: player.isActive ? 'Disattiva' : 'Attiva',
    });

    if (!confirmed) return;

    try {
      await onUpdate({ isActive: !player.isActive });
      showSuccess(`Giocatore ${!player.isActive ? 'attivato' : 'disattivato'} con successo`);
    } catch (error) {
      showError(`Errore: ${error.message}`);
    }
  }, [
    player.isActive,
    player.firstName,
    player.lastName,
    onUpdate,
    confirm,
    showSuccess,
    showError,
  ]);

  const handleLinkAccount = useCallback(
    async (account) => {
      if (!account?.uid || !account?.email) return;

      dispatch({ type: ACTIONS.SET_LOADING, payload: { linking: true } });

      try {
        await onUpdate({
          isAccountLinked: true,
          linkedAccountId: account.uid,
          linkedAccountEmail: account.email,
        });

        showSuccess('Account collegato con successo');
        dispatch({ type: ACTIONS.CANCEL_LINKING });
      } catch (error) {
        showError(`Errore: ${error.message}`);
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: { linking: false } });
      }
    },
    [onUpdate]
  );

  const handleUnlinkAccount = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Scollega account',
      message: `Sei sicuro di voler scollegare l'account "${player.linkedAccountEmail}"?`,
      variant: 'warning',
      confirmText: 'Scollega',
      cancelText: 'Annulla',
    });

    if (!confirmed) return;

    dispatch({ type: ACTIONS.SET_LOADING, payload: { unlinking: true } });

    try {
      await onUpdate({
        isAccountLinked: false,
        linkedAccountId: null,
        linkedAccountEmail: null,
      });

      showSuccess('Account scollegato con successo');
    } catch (error) {
      showError(`Errore: ${error.message}`);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { unlinking: false } });
    }
  }, [onUpdate, player.linkedAccountEmail, confirm, showSuccess, showError]);

  const openAccountsPicker = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: { loadingAccounts: true } });

    try {
      const res = await listAllUserProfiles(500);
      dispatch({ type: ACTIONS.SET_ACCOUNTS, payload: res || [] });
      dispatch({ type: ACTIONS.START_LINKING });
    } catch (error) {
      showError(`Errore caricamento account: ${error.message}`);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { loadingAccounts: false } });
    }
  }, [showError]);

  // 🎨 Tabs configuration con counter dinamici
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      description: 'Dati principali',
    },
    {
      id: 'tournament',
      label: 'Torneo',
      icon: '🏆',
      description: 'Classifica e match',
      counter: player.tournamentData?.isParticipant ? '✓' : null,
    },
    {
      id: 'bookings',
      label: 'Prenotazioni',
      icon: '📅',
      description: 'Storico campi',
      counter: player.bookingHistory?.length || 0,
    },
    {
      id: 'wallet',
      label: 'Portafoglio',
      icon: '💰',
      description: 'Credito e transazioni',
      counter: `€${(player.wallet?.balance || 0).toFixed(2)}`,
    },
    {
      id: 'medical',
      label: 'Certificati',
      icon: '🏥',
      description: 'Documenti medici',
      counter: player.medicalCertificate?.status === 'valid' ? '✓' : '⚠️',
    },
    {
      id: 'notes',
      label: 'Note',
      icon: '📝',
      description: 'Note private',
      counter: player.notes?.length || 0,
    },
    {
      id: 'communications',
      label: 'Email',
      icon: '📧',
      description: 'Storico comunicazioni',
      counter: player.communications?.length || 0,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* 🔒 Read-Only Warning (FASE 2 - Security) */}
      {permissions.isReadOnly && (
        <div className="mx-2 sm:mx-4 my-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border border-amber-300 dark:border-amber-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-200 dark:bg-amber-800/50 rounded-full flex items-center justify-center">
              <span className="text-amber-700 dark:text-amber-300 text-lg">🔒</span>
            </div>
            <div>
              <p className="text-amber-900 dark:text-amber-200 font-semibold text-sm">
                Modalità Solo Lettura
              </p>
              <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
                Non hai i permessi per modificare questi dati
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <PlayerDetailsHeader
        player={player}
        playerWithRealRating={playerWithRealRating}
        isEditMode={state.isEditMode}
        isSaving={state.loading.saving}
        permissions={permissions}
        onToggleEditMode={handleToggleEditMode}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleToggleEditMode}
        onToggleStatus={handleToggleStatus}
        onClose={onClose}
        T={theme}
      />

      {/* Account Linking Section */}
      {permissions.canLinkAccount && (
        <div className="px-4 sm:px-6 py-4">
          <PlayerAccountLinking
            player={player}
            isLinking={state.linking.isOpen}
            linkEmail={state.linking.email}
            accountSearch={state.linking.search}
            accounts={state.linking.accounts}
            linkedEmailsSet={linkedEmailsSet}
            linkedIdsSet={linkedIdsSet}
            loadingAccounts={state.loading.loadingAccounts}
            loadingLink={state.loading.linking}
            loadingUnlink={state.loading.unlinking}
            permissions={permissions}
            onOpenPicker={openAccountsPicker}
            onClosePicker={() => dispatch({ type: ACTIONS.CANCEL_LINKING })}
            onSearchChange={(value) =>
              dispatch({ type: ACTIONS.SET_ACCOUNT_SEARCH, payload: value })
            }
            onEmailChange={(value) => dispatch({ type: ACTIONS.SET_LINK_EMAIL, payload: value })}
            onLinkAccount={handleLinkAccount}
            onUnlinkAccount={handleUnlinkAccount}
            T={theme}
          />
        </div>
      )}

      {/* HORIZONTAL TABS NAVIGATION */}
      <div
        className={`border-b ${theme.border} bg-gray-50 dark:bg-gray-800/50 px-4 sm:px-6 sticky top-0 z-10`}
      >
        <nav className="flex gap-2 overflow-x-auto scrollbar-thin" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tab.id });
              }}
              className={`
                group relative px-4 py-3 whitespace-nowrap
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                ${
                  state.activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : `${theme.text} hover:text-blue-600 dark:hover:text-blue-400`
                }
              `}
              role="tab"
              aria-selected={state.activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-xl transition-transform duration-200 ${
                    state.activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                >
                  {tab.icon}
                </span>
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.counter !== undefined && tab.counter !== null && tab.counter !== 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      state.activeTab === tab.id
                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {tab.counter}
                  </span>
                )}
              </div>
              {state.activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* LAYOUT: Content + Info Panel */}
      <div className="flex relative">
        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 min-h-[400px]">
            {state.activeTab === 'overview' && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                {state.isEditMode ? (
                  <PlayerEditMode state={state} dispatch={dispatch} T={theme} />
                ) : (
                  <div className="space-y-6">
                    <PlayerOverviewTab
                      player={player}
                      playerWithRealRating={playerWithRealRating}
                      T={theme}
                    />
                    <PlayerDataExport
                      player={player}
                      permissions={permissions}
                      additionalData={{}}
                      T={theme}
                    />
                    <PlayerDataDelete
                      player={player}
                      permissions={permissions}
                      onDeleted={onClose}
                      T={theme}
                    />
                  </div>
                )}
              </div>
            )}

            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64 animate-in fade-in duration-300">
                  <div className="text-center">
                    <div
                      className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 ${theme.text}`}
                    ></div>
                    <p className={`mt-4 ${theme.muted} text-sm font-medium`}>Caricamento...</p>
                  </div>
                </div>
              }
            >
              {state.activeTab === 'tournament' && (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  <PlayerTournamentTab
                    player={player}
                    clubId={clubId}
                    onUpdate={onUpdate}
                    T={theme}
                  />
                </div>
              )}

              {state.activeTab === 'bookings' && (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  <PlayerBookingHistory player={player} T={theme} />
                </div>
              )}

              {state.activeTab === 'wallet' && (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  <PlayerWallet player={player} onUpdate={onUpdate} T={theme} />
                </div>
              )}

              {state.activeTab === 'medical' && (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  <PlayerMedicalTab player={player} onUpdate={onUpdate} T={theme} />
                </div>
              )}

              {state.activeTab === 'notes' && (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  <PlayerNotes player={player} onUpdate={onUpdate} T={theme} />
                </div>
              )}

              {state.activeTab === 'communications' && (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  <PlayerCommunications player={player} T={theme} />
                </div>
              )}
            </Suspense>
          </div>
        </div>

        {/* FASE 3: INFO PANEL - Right Side (Desktop Only) */}
        <PlayerInfoPanel player={player} T={theme} />
      </div>
    </div>
  );
}
