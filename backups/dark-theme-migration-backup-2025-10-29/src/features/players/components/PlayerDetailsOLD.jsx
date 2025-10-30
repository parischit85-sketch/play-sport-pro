// =============================================
// FILE: src/features/players/components/PlayerDetails.jsx
// Vista dettagliata del giocatore con tab multiple
// Updated: 2025-10-13 - Fixed React key warnings
// =============================================

import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listAllUserProfiles } from '@services/auth.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { DEFAULT_RATING } from '@lib/ids.js';
import { computeClubRanking } from '@lib/ranking-club.js';
import { PLAYER_CATEGORIES } from '../types/playerTypes.js';
import PlayerNotes from './PlayerNotes';
import PlayerWallet from './PlayerWallet';
import PlayerCommunications from './PlayerCommunications';
import PlayerBookingHistory from './PlayerBookingHistory';
import PlayerTournamentTab from './PlayerTournamentTab';
import PlayerMedicalTab from './PlayerMedicalTab';

export default function PlayerDetails({ player, onUpdate, _onClose, T }) {
  console.log(
    '👤 [PlayerDetails] Rendering with player:',
    player?.id,
    'tournamentData:',
    player?.tournamentData
  );

  const { clubId, players, matches } = useClub();
  const [searchParams, setSearchParams] = useSearchParams();

  // 🎯 Calcola il ranking reale dalle partite (come in Classifica e Stats)
  const playerWithRealRating = useMemo(() => {
    if (!clubId || !player) return player;

    // 🏆 FILTRO CAMPIONATO: Solo giocatori che partecipano attivamente
    const tournamentPlayers = players.filter(
      (p) => p.tournamentData?.isParticipant === true && p.tournamentData?.isActive === true
    );

    // Calcola il ranking per TUTTI i giocatori del torneo (non solo questo)
    const rankingData = computeClubRanking(tournamentPlayers, matches, clubId);
    const calculatedPlayer = rankingData.players.find((p) => p.id === player.id);

    if (calculatedPlayer) {
      console.log(
        '🎯 [PlayerDetails] Real rating calculated:',
        calculatedPlayer.rating,
        'vs profile rating:',
        player.rating
      );
      return { ...player, rating: calculatedPlayer.rating };
    }

    return player;
  }, [player, players, matches, clubId]);

  const [activeTab, setActiveTab] = useState('overview');
  const [linking, setLinking] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [accountSearch, setAccountSearch] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const { players: clubPlayers } = useClub();

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Initialize edit form data when player changes or edit mode is activated
  useEffect(() => {
    if (player && isEditMode) {
      const enhancedPlayer = { ...player };

      // Se firstName e lastName non sono presenti ma c'è name, li separiamo
      if (!enhancedPlayer.firstName && !enhancedPlayer.lastName && enhancedPlayer.name) {
        const nameParts = enhancedPlayer.name.trim().split(' ');
        enhancedPlayer.firstName = nameParts[0] || '';
        enhancedPlayer.lastName = nameParts.slice(1).join(' ') || '';
      }

      setEditFormData({ ...enhancedPlayer });
      setEditErrors({});
    }
  }, [player, isEditMode]);

  // Handle edit form changes
  const handleEditChange = (field, value) => {
    setEditFormData((prev) => {
      let newData;

      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        newData = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        };
      } else {
        newData = { ...prev, [field]: value };
      }

      // Initialize instructor data when category is set to INSTRUCTOR
      if (field === 'category' && value === PLAYER_CATEGORIES.INSTRUCTOR) {
        newData.instructorData = {
          isInstructor: true,
          color: '#3B82F6',
          specialties: [],
          hourlyRate: 0,
          priceSingle: 0,
          priceCouple: 0,
          priceThree: 0,
          priceMatchLesson: 0,
          bio: '',
          certifications: [],
          ...newData.instructorData,
        };
      }

      return newData;
    });

    // Clear error when user starts typing
    if (editErrors[field]) {
      setEditErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const newErrors = {};

    if (!editFormData.firstName?.trim()) {
      newErrors.firstName = 'Nome richiesto';
    }
    if (!editFormData.lastName?.trim()) {
      newErrors.lastName = 'Cognome richiesto';
    }
    if (editFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      newErrors.email = 'Email non valida';
    }
    if (editFormData.phone && !/^[\d\s+\-()]+$/.test(editFormData.phone)) {
      newErrors.phone = 'Numero di telefono non valido';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save edit changes
  const handleSaveEdit = () => {
    if (!validateEditForm()) return;

    // Rimuoviamo baseRating e rating per evitare conflitti con il sistema di ranking del campionato
    const { baseRating, rating, ...filteredData } = editFormData;

    const playerData = {
      ...filteredData,
      name: `${editFormData.firstName} ${editFormData.lastName}`.trim(),
      updatedAt: new Date().toISOString(),
    };

    onUpdate(playerData);
    setIsEditMode(false);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFormData({});
    setEditErrors({});
  };

  // 🔧 Leggi il parametro 'tab' dalla URL e apri la tab corrispondente
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
      // Rimuovi il parametro 'tab' dalla URL dopo averlo letto
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('tab');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const linkedEmailsSet = useMemo(
    () =>
      new Set(
        (clubPlayers || [])
          .filter((p) => p.id !== player.id && (p.isAccountLinked || p.linkedAccountEmail))
          .map((p) => (p.linkedAccountEmail || '').toLowerCase())
          .filter(Boolean)
      ),
    [clubPlayers, player.id]
  );
  const linkedIdsSet = useMemo(
    () =>
      new Set(
        (clubPlayers || [])
          .filter((p) => p.id !== player.id && (p.isAccountLinked || p.linkedAccountId))
          .map((p) => p.linkedAccountId)
          .filter(Boolean)
      ),
    [clubPlayers, player.id]
  );

  const unlinkedAccounts = useMemo(() => {
    return (accounts || []).filter((acc) => {
      const email = (acc.email || '').toLowerCase();
      const uid = acc.uid;
      if (!email) return false;
      if (uid && linkedIdsSet.has(uid)) return false;
      return !linkedEmailsSet.has(email);
    });
  }, [accounts, linkedEmailsSet, linkedIdsSet]);

  const filteredAccounts = useMemo(() => {
    const q = accountSearch.trim().toLowerCase();
    if (!q) return unlinkedAccounts;
    return unlinkedAccounts.filter((acc) => {
      return (
        (acc.email || '').toLowerCase().includes(q) ||
        (acc.firstName || '').toLowerCase().includes(q) ||
        (acc.lastName || '').toLowerCase().includes(q)
      );
    });
  }, [unlinkedAccounts, accountSearch]);

  const openAccountsPicker = async () => {
    try {
      setLoadingAccounts(true);
      const res = await listAllUserProfiles(500);
      setAccounts(res || []);
      setAccountSearch('');
      setLinking(true);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case PLAYER_CATEGORIES.MEMBER:
        return 'Membro';
      case PLAYER_CATEGORIES.VIP:
        return 'VIP';
      case PLAYER_CATEGORIES.GUEST:
        return 'Ospite';
      case PLAYER_CATEGORIES.NON_MEMBER:
        return 'Non Membro';
      default:
        return 'N/A';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case PLAYER_CATEGORIES.MEMBER:
        return 'text-green-600 dark:text-green-400';
      case PLAYER_CATEGORIES.VIP:
        return 'text-purple-600 dark:text-purple-400';
      case PLAYER_CATEGORIES.GUEST:
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleLinkAccount = () => {
    if (!linkEmail.trim()) return;

    onUpdate({
      linkedAccountEmail: linkEmail.trim(),
      isAccountLinked: true,
      updatedAt: new Date().toISOString(),
    });

    setLinking(false);
    setLinkEmail('');
  };

  const handleUnlinkAccount = async () => {
    if (!confirm("Sei sicuro di voler scollegare l'account da questo giocatore?")) {
      return;
    }

    try {
      // Scollega dal profilo globale se esiste linkedAccountId
      if (player.linkedAccountId) {
        const { unlinkUserFromClub } = await import('@services/auth.jsx');
        await unlinkUserFromClub(player.linkedAccountId, 'current-club-id', player.id); // TODO: passare clubId corretto
      }

      // Aggiorna il giocatore locale
      onUpdate({
        linkedAccountId: null,
        linkedAccountEmail: null,
        isAccountLinked: false,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error unlinking account:', error);
      alert('Errore durante lo scollegamento. Riprova.');
    }
  };

  const toggleActiveStatus = () => {
    onUpdate({
      isActive: !player.isActive,
      updatedAt: new Date().toISOString(),
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const tabs = [
    { id: 'overview', label: '👤 Panoramica', icon: '👤' },
    { id: 'tournament', label: '🏆 Campionato', icon: '🏆' },
    { id: 'medical', label: '🏥 Certificato Medico', icon: '🏥' },
    { id: 'notes', label: '📝 Note', icon: '📝' },
    { id: 'wallet', label: '💰 Wallet', icon: '💰' },
    { id: 'bookings', label: '📅 Prenotazioni', icon: '📅' },
    { id: 'communications', label: '✉️ Comunicazioni', icon: '✉️' },
  ];

  return (
    <div className="space-y-6">
      {/* Header con info principali */}
      <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
        <div className="flex flex-col xl:flex-row xl:items-start gap-8">
          {/* Avatar e info base */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {player.name ? player.name.charAt(0).toUpperCase() : '?'}
            </div>

            <div>
              <h2 className={`text-2xl font-bold ${T.text} mb-2`}>
                {player.name ||
                  `${player.firstName || ''} ${player.lastName || ''}`.trim() ||
                  'Nome non disponibile'}
              </h2>

              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 ${getCategoryColor(player.category)}`}
                >
                  {getCategoryLabel(player.category)}
                </span>

                {!player.isActive && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                    Inattivo
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {player.email && (
                  <div className="flex items-center gap-2">
                    <span>📧</span>
                    <span>{player.email}</span>
                  </div>
                )}
                {player.phone && (
                  <div className="flex items-center gap-2">
                    <span>📱</span>
                    <span>{player.phone}</span>
                  </div>
                )}
                {player.dateOfBirth && (
                  <div className="flex items-center gap-2">
                    <span>🎂</span>
                    <span>
                      {new Date(player.dateOfBirth).toLocaleDateString('it-IT')}
                      {calculateAge(player.dateOfBirth) &&
                        ` (${calculateAge(player.dateOfBirth)} anni)`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats e azioni */}
          <div className="flex-1 xl:text-right">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                {player.tournamentData?.isParticipant && player.tournamentData?.isActive ? (
                  <>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {Number(playerWithRealRating.rating || DEFAULT_RATING).toFixed(0)}
                    </div>
                    <div className={`text-xs ${T.subtext}`}>Ranking Attuale</div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-400 dark:text-gray-600">-</div>
                    <div className={`text-xs ${T.subtext}`}>Non partecipa</div>
                  </>
                )}
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  €{(player.wallet?.balance || 0).toFixed(2)}
                </div>
                <div className={`text-xs ${T.subtext}`}>Credito</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {player.bookingHistory?.length || 0}
                </div>
                <div className={`text-xs ${T.subtext}`}>Prenotazioni</div>
              </div>
            </div>

            {/* Azioni rapide */}
            <div className="flex gap-2 justify-end">
              {!isEditMode ? (
                <>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className={`${T.btnSecondary} px-3 py-1 text-sm`}
                  >
                    ✏️ Modifica
                  </button>
                  <button
                    onClick={toggleActiveStatus}
                    className={`px-3 py-1 text-sm rounded ${
                      player.isActive
                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    }`}
                  >
                    {player.isActive ? '⏸️ Disattiva' : '▶️ Attiva'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className={`${T.btnSecondary} px-3 py-1 text-sm`}
                  >
                    ❌ Annulla
                  </button>
                  <button onClick={handleSaveEdit} className={`${T.btnPrimary} px-3 py-1 text-sm`}>
                    💾 Salva
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Account linking */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${T.text}`}>Account Collegato:</span>
              {player.isAccountLinked ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-500">🔗</span>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {player.linkedAccountEmail}
                  </span>
                  <button
                    onClick={handleUnlinkAccount}
                    className="text-xs text-red-500 hover:text-red-700 ml-2"
                  >
                    Scollega
                  </button>
                </div>
              ) : (
                <span className={`text-sm ${T.subtext}`}>Nessun account collegato</span>
              )}
            </div>

            {!player.isAccountLinked && (
              <div className="flex flex-col gap-2 w-full max-w-xl">
                {!linking ? (
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={openAccountsPicker}
                      className={`${T.btnSecondary} px-4 py-2 text-sm`}
                      disabled={loadingAccounts}
                    >
                      {loadingAccounts ? 'Carico…' : '🔎 Cerca account'}
                    </button>
                    <button
                      onClick={() => setLinking(true)}
                      className={`${T.btnSecondary} px-4 py-2 text-sm`}
                    >
                      🔗 Collega via email
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Ricerca accounts */}
                    {accounts.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={accountSearch}
                            onChange={(e) => setAccountSearch(e.target.value)}
                            placeholder="Cerca per nome o email…"
                            className={`${T.input} text-sm flex-1`}
                          />
                          <button
                            onClick={() => setAccounts([])}
                            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                          >
                            Chiudi elenco
                          </button>
                        </div>
                        <div
                          className={`${T.cardBg} ${T.border} rounded-lg max-h-64 overflow-auto`}
                        >
                          {filteredAccounts.length === 0 ? (
                            <div className={`p-3 text-sm ${T.subtext}`}>
                              Nessun account disponibile
                            </div>
                          ) : (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                              {filteredAccounts.map((acc) => (
                                <li key={acc.uid} className="p-3 flex items-center justify-between">
                                  <div className="min-w-0">
                                    <div className={`${T.text} font-medium truncate`}>
                                      {acc.firstName || acc.lastName
                                        ? `${acc.firstName || ''} ${acc.lastName || ''}`.trim()
                                        : acc.email || 'Senza nome'}
                                    </div>
                                    <div className={`text-xs ${T.subtext} truncate`}>
                                      {acc.email}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const email = acc.email || '';
                                      if (!email) return;
                                      onUpdate({
                                        linkedAccountId: acc.uid,
                                        linkedAccountEmail: email,
                                        isAccountLinked: true,
                                        updatedAt: new Date().toISOString(),
                                      });
                                      setLinking(false);
                                      setAccounts([]);
                                      setAccountSearch('');
                                      setLinkEmail('');
                                    }}
                                    className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded ml-3 flex-shrink-0"
                                  >
                                    Collega
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={linkEmail}
                          onChange={(e) => setLinkEmail(e.target.value)}
                          placeholder="email@esempio.com"
                          className={`${T.input} text-sm`}
                        />
                        <button
                          onClick={handleLinkAccount}
                          className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded"
                        >
                          Collega
                        </button>
                        <button
                          onClick={() => {
                            setLinking(false);
                            setLinkEmail('');
                          }}
                          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                        >
                          Annulla
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-lg">{tab.icon}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dati di contatto */}
            <div className={`${T.cardBg} ${T.border} rounded-xl p-4`}>
              <h3 className={`font-semibold ${T.text} mb-4 flex items-center gap-2`}>� Contatti</h3>

              {isEditMode ? (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${T.text} mb-1`}>Email</label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => handleEditChange('email', e.target.value)}
                      className={`${T.input} w-full ${editErrors.email ? 'border-red-500' : ''}`}
                      placeholder="email@esempio.com"
                    />
                    {editErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{editErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${T.text} mb-1`}>Telefono</label>
                    <input
                      type="tel"
                      value={editFormData.phone || ''}
                      onChange={(e) => handleEditChange('phone', e.target.value)}
                      className={`${T.input} w-full ${editErrors.phone ? 'border-red-500' : ''}`}
                      placeholder="+39 123 456 7890"
                    />
                    {editErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{editErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className={`font-medium ${T.text}`}>Indirizzo</h4>

                    <input
                      type="text"
                      value={editFormData.address?.street || ''}
                      onChange={(e) => handleEditChange('address.street', e.target.value)}
                      className={`${T.input} w-full`}
                      placeholder="Via, numero civico"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={editFormData.address?.city || ''}
                        onChange={(e) => handleEditChange('address.city', e.target.value)}
                        className={`${T.input} w-full`}
                        placeholder="Città"
                      />
                      <input
                        type="text"
                        value={editFormData.address?.province || ''}
                        onChange={(e) => handleEditChange('address.province', e.target.value)}
                        className={`${T.input} w-full`}
                        placeholder="Provincia"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={editFormData.address?.postalCode || ''}
                        onChange={(e) => handleEditChange('address.postalCode', e.target.value)}
                        className={`${T.input} w-full`}
                        placeholder="CAP"
                      />
                      <input
                        type="text"
                        value={editFormData.address?.country || 'Italia'}
                        onChange={(e) => handleEditChange('address.country', e.target.value)}
                        className={`${T.input} w-full`}
                        placeholder="Paese"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className={T.subtext}>Email:</span>
                    <span className={T.text}>{player.email || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className={T.subtext}>Telefono:</span>
                    <span className={T.text}>{player.phone || 'N/A'}</span>
                  </div>

                  {player.address && (
                    <div className="flex justify-between">
                      <span className={T.subtext}>Indirizzo:</span>
                      <span className={`${T.text} text-right`}>
                        {[
                          player.address.street,
                          player.address.city,
                          player.address.province,
                          player.address.postalCode,
                        ]
                          .filter(Boolean)
                          .join(', ') || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Dati sportivi */}
            <div className={`${T.cardBg} ${T.border} rounded-xl p-4`}>
              <h3 className={`font-semibold ${T.text} mb-4 flex items-center gap-2`}>
                🏃 Dati Sportivi
              </h3>

              {isEditMode ? (
                <div className="space-y-4">
                  <div>
                    <label className={`flex items-center gap-2 ${T.text}`}>
                      <input
                        type="checkbox"
                        checked={editFormData.isActive !== false}
                        onChange={(e) => handleEditChange('isActive', e.target.checked)}
                        className="rounded"
                      />
                      Giocatore attivo
                    </label>
                    <p className={`text-xs ${T.subtext} mt-1`}>
                      I giocatori inattivi non appaiono nelle selezioni per i match
                    </p>
                  </div>

                  <div>
                    <label className={`flex items-center gap-2 ${T.text}`}>
                      <input
                        type="checkbox"
                        checked={editFormData.tournamentData?.isParticipant !== false}
                        onChange={(e) =>
                          handleEditChange('tournamentData.isParticipant', e.target.checked)
                        }
                        className="rounded"
                      />
                      Partecipa al Campionato
                    </label>
                    <p className={`text-xs ${T.subtext} mt-1`}>
                      I giocatori che non partecipano al campionato non appaiono nelle classifiche
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  {player.tournamentData?.isParticipant && player.tournamentData?.isActive ? (
                    <>
                      <div className="flex justify-between">
                        <span className={T.subtext}>🎯 Ranking Iniziale:</span>
                        <span className="text-orange-600 dark:text-orange-400 font-semibold">
                          {player.tournamentData.initialRanking || DEFAULT_RATING}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={T.subtext}>🏆 Ranking Attuale:</span>
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                          {Number(playerWithRealRating.rating || DEFAULT_RATING).toFixed(0)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={T.subtext}>📊 Progressione:</span>
                        <span
                          className={
                            (playerWithRealRating.rating || 0) >
                            (player.tournamentData.initialRanking || 0)
                              ? 'text-green-600 dark:text-green-400 font-semibold'
                              : (playerWithRealRating.rating || 0) <
                                  (player.tournamentData.initialRanking || 0)
                                ? 'text-red-600 dark:text-red-400 font-semibold'
                                : T.text
                          }
                        >
                          {(playerWithRealRating.rating || 0) -
                            (player.tournamentData.initialRanking || 0) >
                          0
                            ? '+'
                            : ''}
                          {(playerWithRealRating.rating || 0) -
                            (player.tournamentData.initialRanking || 0)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <span className={`text-sm ${T.subtext}`}>
                        Giocatore non partecipa al campionato
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className={T.subtext}>Stato:</span>
                    <span
                      className={
                        player.isActive
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {player.isActive ? 'Attivo' : 'Inattivo'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className={T.subtext}>Partite giocate:</span>
                    <span className={T.text}>{player.matchHistory?.length || 0}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className={T.subtext}>Ultima attività:</span>
                    <span className={T.text}>{formatDate(player.lastActivity)}</span>
                  </div>
                </div>
              )}
            </div>{' '}
            {/* Tag e note rapide */}
            <div className={`${T.cardBg} ${T.border} rounded-xl p-4 lg:col-span-2`}>
              <h3 className={`font-semibold ${T.text} mb-4 flex items-center gap-2`}>
                🏷️ Tag e Preferenze
              </h3>

              {isEditMode ? (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${T.text} mb-1`}>
                      Tag (separati da virgola)
                    </label>
                    <input
                      type="text"
                      value={editFormData.tags?.join(', ') || ''}
                      onChange={(e) =>
                        handleEditChange(
                          'tags',
                          e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean)
                        )
                      }
                      className={`${T.input} w-full`}
                      placeholder="principiante, mattiniero, competitivo"
                    />
                    <p className={`text-xs ${T.subtext} mt-1`}>
                      I tag aiutano a categorizzare e filtrare i giocatori
                    </p>
                  </div>

                  <div>
                    <h4 className={`font-medium ${T.text} mb-3`}>Preferenze di Comunicazione</h4>
                    <div className="space-y-3">
                      <label className={`flex items-center gap-2 ${T.text}`}>
                        <input
                          type="checkbox"
                          checked={editFormData.communicationPreferences?.email !== false}
                          onChange={(e) =>
                            handleEditChange('communicationPreferences.email', e.target.checked)
                          }
                          className="rounded"
                        />
                        Ricevi email
                      </label>

                      <label className={`flex items-center gap-2 ${T.text}`}>
                        <input
                          type="checkbox"
                          checked={editFormData.communicationPreferences?.sms === true}
                          onChange={(e) =>
                            handleEditChange('communicationPreferences.sms', e.target.checked)
                          }
                          className="rounded"
                        />
                        Ricevi SMS
                      </label>

                      <label className={`flex items-center gap-2 ${T.text}`}>
                        <input
                          type="checkbox"
                          checked={editFormData.communicationPreferences?.whatsapp === true}
                          onChange={(e) =>
                            handleEditChange('communicationPreferences.whatsapp', e.target.checked)
                          }
                          className="rounded"
                        />
                        Ricevi WhatsApp
                      </label>

                      <label className={`flex items-center gap-2 ${T.text}`}>
                        <input
                          type="checkbox"
                          checked={editFormData.communicationPreferences?.notifications !== false}
                          onChange={(e) =>
                            handleEditChange(
                              'communicationPreferences.notifications',
                              e.target.checked
                            )
                          }
                          className="rounded"
                        />
                        Ricevi notifiche push
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className={`text-sm ${T.subtext} block mb-2`}>Tag:</span>
                    <div className="flex flex-wrap gap-2">
                      {player.tags && player.tags.length > 0 ? (
                        player.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className={`text-sm ${T.subtext}`}>Nessun tag assegnato</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className={`text-sm ${T.subtext} block mb-2`}>
                      Preferenze comunicazione:
                    </span>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span
                        className={`flex items-center gap-1 ${
                          player.communicationPreferences?.email
                            ? 'text-green-600 dark:text-green-400'
                            : T.subtext
                        }`}
                      >
                        📧 Email: {player.communicationPreferences?.email ? 'Sì' : 'No'}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          player.communicationPreferences?.sms
                            ? 'text-green-600 dark:text-green-400'
                            : T.subtext
                        }`}
                      >
                        📱 SMS: {player.communicationPreferences?.sms ? 'Sì' : 'No'}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          player.communicationPreferences?.whatsapp
                            ? 'text-green-600 dark:text-green-400'
                            : T.subtext
                        }`}
                      >
                        📞 WhatsApp: {player.communicationPreferences?.whatsapp ? 'Sì' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tournament' && (
          <PlayerTournamentTab player={player} onUpdate={onUpdate} T={T} />
        )}

        {activeTab === 'medical' && <PlayerMedicalTab player={player} onUpdate={onUpdate} T={T} />}

        {activeTab === 'notes' && <PlayerNotes player={player} onUpdate={onUpdate} T={T} />}

        {activeTab === 'wallet' && <PlayerWallet player={player} onUpdate={onUpdate} T={T} />}

        {activeTab === 'bookings' && <PlayerBookingHistory player={player} T={T} />}

        {activeTab === 'communications' && (
          <PlayerCommunications player={player} onUpdate={onUpdate} T={T} />
        )}
      </div>
    </div>
  );
}
