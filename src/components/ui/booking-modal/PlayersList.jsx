import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Capacitor } from '@capacitor/core';
import { Contacts } from '@capacitor-community/contacts';
import { getUserByPhone, searchUsers } from '@services/users.js';
import { isMobileNumber } from '@utils/validators/phoneValidator.js';

export default function PlayersList({
  booking,
  isLessonBooking,
  isEditingPlayers,
  editedPlayers,
  setEditedPlayers,
  onToggleEdit,
  hideEditControls = false,
}) {
  // eslint-disable-next-line no-unused-vars
  const [isAdding, setIsAdding] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [manualName, setManualName] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [manualPhone, setManualPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [deviceContacts, setDeviceContacts] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

  // Load recent players on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('psp_recent_players');
      if (saved) {
        setRecentPlayers(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading recent players:', e);
    }
  }, []);

  // Debounced search for PlaySport users inside Modal
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        try {
          const results = await searchUsers(searchTerm);
          // Filter out already added players
          const currentPlayersList = isEditingPlayers ? editedPlayers : booking.players;
          const currentIds = (currentPlayersList || []).map((p) => p.uid || p.id).filter(Boolean);
          const filtered = results.filter((u) => !currentIds.includes(u.uid));

          setSearchResults(filtered);
        } catch (err) {
          console.error('Search error:', err);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchTerm, isEditingPlayers, editedPlayers, booking.players]);

  const addPlayersToRecent = (players) => {
    const playersList = Array.isArray(players) ? players : [players];

    setRecentPlayers((prev) => {
      let updated = [...prev];

      playersList.forEach((player) => {
        const playerToStore = {
          name: player.name,
          email: player.email || '',
          phone: player.phone || '',
          uid: player.uid || null,
          avatar: player.avatar || '',
          isGuest: !!player.isGuest,
        };

        // Remove duplicates
        updated = updated.filter((p) => {
          if (playerToStore.uid && p.uid === playerToStore.uid) return false;
          if (!playerToStore.uid && p.name === playerToStore.name) return false;
          return true;
        });

        // Add to top
        updated.unshift(playerToStore);
      });

      const final = updated.slice(0, 8); // Keep last 8
      localStorage.setItem('psp_recent_players', JSON.stringify(final));
      return final;
    });
  };

  // Debounced search for PlaySport users inside Modal
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        try {
          const results = await searchUsers(searchTerm);
          // Filter out already added players
          const currentPlayersList = isEditingPlayers ? editedPlayers : booking.players;
          const currentIds = (currentPlayersList || []).map((p) => p.uid || p.id).filter(Boolean);
          const filtered = results.filter((u) => !currentIds.includes(u.uid));

          setSearchResults(filtered);
        } catch (err) {
          console.error('Search error:', err);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchTerm, isEditingPlayers, editedPlayers, booking.players]);

  const getPlayerDisplayName = (player) => {
    if (!player) return '';
    if (typeof player === 'string') return player;
    if (typeof player === 'object') {
      return player.name || player.email || '';
    }
    return String(player);
  };

  const handleAddPlayer = (playerData) => {
    addPlayersToRecent(playerData);
    const newPlayers = [...editedPlayers];
    newPlayers.push({
      ...playerData,
      id: playerData.uid || Date.now(),
    });
    setEditedPlayers(newPlayers);
    setIsAdding(false);
    setManualName('');
    setManualPhone('');
    setSearchResults([]);
    setShowContactModal(false);
    setSearchTerm('');
  };

  // eslint-disable-next-line no-unused-vars
  const handleContactPick = () => {
    setShowContactModal(true);
    setSearchTerm('');
  };

  const handleNativeContactPick = async () => {
    setIsSearching(true);
    // Don't close modal immediately, wait for result
    try {
      // 1. Try Web Contact Picker API (Android Chrome / PWA)
      if ('contacts' in navigator && 'ContactsManager' in window) {
        const props = ['name', 'tel'];
        const opts = { multiple: true }; // Allow selecting multiple contacts

        const contacts = await navigator.contacts.select(props, opts);

        if (contacts && contacts.length > 0) {
          await processSelectedContacts(
            contacts.map((c) => ({
              name: c.name ? c.name[0] : 'Sconosciuto',
              phone: c.tel ? c.tel[0] : '',
            }))
          );
        }
      }
      // 2. Try Capacitor Plugin (Native iOS/Android)
      else if (Capacitor.isNativePlatform()) {
        const permission = await Contacts.requestPermissions();
        if (permission.contacts === 'granted') {
          // Use pickContact for single selection flow which is standard on native
          const result = await Contacts.pickContact({
            projection: {
              name: true,
              phones: true,
            },
          });

          if (result && result.contact) {
            const c = result.contact;
            const phone = c.phones && c.phones.length > 0 ? c.phones[0].number : '';
            const name = c.displayName || (c.name ? c.name.display || c.name.given : 'Sconosciuto');

            await processSelectedContacts([{ name, phone }]);
          }
        }
      } else {
        // Fallback to manual input
        setIsAdding(true);
      }
    } catch (error) {
      console.error('Error picking contact:', error);
      // Fallback to manual input on error
      setIsAdding(true);
    } finally {
      setIsSearching(false);
    }
  };

  const processSelectedContacts = async (contactsList) => {
    const processedPlayers = [];

    for (const contact of contactsList) {
      const { name, phone } = contact;

      if (phone) {
        // Filter out non-mobile numbers
        if (!isMobileNumber(phone)) {
          console.log(`Skipping non-mobile number: ${phone}`);
          continue;
        }

        const existingUser = await getUserByPhone(phone);
        if (existingUser) {
          processedPlayers.push({
            name: existingUser.displayName || existingUser.firstName || name,
            email: existingUser.email,
            phone: existingUser.phone,
            uid: existingUser.uid,
            avatar: existingUser.avatar,
            isGuest: false,
          });
        } else {
          processedPlayers.push({
            name: name,
            phone: phone,
            isGuest: true,
          });
        }
      }
    }

    // Add all processed players respecting the limit
    const currentCount = (isEditingPlayers ? editedPlayers : booking.players).length;
    const remainingSlots = 4 - currentCount; // Assuming max 4 players

    const playersToAdd = processedPlayers.slice(0, remainingSlots);

    if (playersToAdd.length > 0) {
      // Add to recents
      addPlayersToRecent(playersToAdd);

      const newPlayers = [
        ...editedPlayers,
        ...playersToAdd.map((p) => ({
          ...p,
          id: p.uid || Date.now() + Math.random(),
        })),
      ];
      setEditedPlayers(newPlayers);
      setIsAdding(false);
      setShowContactModal(false); // Close modal on success
    }
  };

  const handleOpenAddPlayer = () => {
    setShowContactModal(true);

    // Auto-open picker ONLY on Native App (not PWA/Web)
    if (Capacitor.isNativePlatform()) {
      handleNativeContactPick();
    }
  };

  // Render logic
  const currentPlayers = isEditingPlayers ? editedPlayers : booking.players;
  const maxPlayers = 4;
  const slots = Array.from({ length: maxPlayers });

  // Sort recent players alphabetically and filter by search
  const filteredRecentPlayers = [...recentPlayers]
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .filter((p) => !searchTerm || (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  // Filter device contacts
  const filteredDeviceContacts = deviceContacts.filter(
    (c) => !searchTerm || (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-4 shadow-lg shadow-gray-900/20 relative">
      {/* Custom Contact Picker Modal - Full Screen Portal */}
      {showContactModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-gray-900 flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-gray-800/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-white">Aggiungi Giocatore</h3>
                <span className="text-xs text-gray-400">Seleziona dalla lista o cerca</span>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-gray-900/95 border-b border-gray-800 sticky top-[60px] z-10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cerca nome, telefono o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pl-11 text-base text-white focus:border-blue-500 outline-none placeholder-gray-500 shadow-sm"
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                />
                <div className="absolute left-3.5 top-3.5 text-gray-500 text-lg">🔍</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
              {/* PlaySport Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <div className="px-1 text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <span>Risultati Globali</span>
                    <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[10px]">
                      {searchResults.length}
                    </span>
                  </div>
                  <div className="bg-gray-800/30 rounded-2xl overflow-hidden border border-gray-800">
                    {searchResults.map((user, idx) => (
                      <button
                        key={user.uid}
                        onClick={() =>
                          handleAddPlayer({
                            name: user.displayName || user.firstName,
                            email: user.email,
                            phone: user.phone,
                            uid: user.uid,
                            avatar: user.avatar,
                            isGuest: false,
                          })
                        }
                        className={`w-full flex items-center gap-4 p-3 hover:bg-gray-800 transition-colors text-left group ${
                          idx !== searchResults.length - 1 ? 'border-b border-gray-800/50' : ''
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-sm text-blue-400 font-bold shrink-0 ring-2 ring-blue-500/10">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.displayName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            (user.displayName || user.firstName || '?').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-base text-white font-medium truncate">
                            {user.displayName || user.firstName}
                          </div>
                          <div className="text-sm text-gray-400 truncate">
                            {user.email || user.phone}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <img src="/play-sport-pro_icon_only.svg" alt="PS" className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Players Section */}
              {filteredRecentPlayers.length > 0 && (
                <div className="space-y-2">
                  <div className="px-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Giocatori Recenti
                  </div>
                  <div className="bg-gray-800/30 rounded-2xl overflow-hidden border border-gray-800">
                    {filteredRecentPlayers.map((player, idx) => (
                      <button
                        key={player.uid || idx}
                        onClick={() => handleAddPlayer(player)}
                        className={`w-full flex items-center gap-4 p-3 hover:bg-gray-800 transition-colors text-left group ${
                          idx !== filteredRecentPlayers.length - 1
                            ? 'border-b border-gray-800/50'
                            : ''
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ring-2 ${
                            player.isGuest
                              ? 'bg-gray-700 ring-gray-600'
                              : 'bg-blue-600 ring-blue-500/30'
                          } relative`}
                        >
                          {player.avatar ? (
                            <img
                              src={player.avatar}
                              alt={player.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-sm font-bold">
                              {(player.name || '?').charAt(0).toUpperCase()}
                            </span>
                          )}
                          {!player.isGuest && (
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full border border-gray-800 p-[2px] w-4 h-4 flex items-center justify-center shadow-sm">
                              <img
                                src="/play-sport-pro_icon_only.svg"
                                alt="PS"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-base text-white font-medium truncate">
                            {player.name}
                          </div>
                          <div className="text-sm text-gray-400 truncate">
                            {player.phone || player.email}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-500/20">
                          <span className="text-blue-400 opacity-0 group-hover:opacity-100 text-xl leading-none">
                            +
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Device Contacts Section (Native Only) */}
              {filteredDeviceContacts.length > 0 && (
                <div className="space-y-2">
                  <div className="px-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Rubrica Telefono
                  </div>
                  <div className="bg-gray-800/30 rounded-2xl overflow-hidden border border-gray-800">
                    {filteredDeviceContacts.map((contact, idx) => (
                      <button
                        key={contact.id || idx}
                        onClick={() =>
                          handleAddPlayer({
                            name: contact.name,
                            phone: contact.phone,
                            isGuest: true,
                          })
                        }
                        className={`w-full flex items-center gap-4 p-3 hover:bg-gray-800 transition-colors text-left group ${
                          idx !== filteredDeviceContacts.length - 1
                            ? 'border-b border-gray-800/50'
                            : ''
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shadow-sm ring-2 ring-gray-600 relative">
                          <span className="text-white text-sm font-bold">
                            {(contact.name || '?').charAt(0).toUpperCase()}
                          </span>
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full border border-gray-800 p-[2px] w-4 h-4 flex items-center justify-center shadow-sm">
                            <span className="text-[8px] text-white">📞</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-base text-white font-medium truncate">
                            {contact.name}
                          </div>
                          <div className="text-sm text-gray-400 truncate">{contact.phone}</div>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-500/20">
                          <span className="text-blue-400 opacity-0 group-hover:opacity-100 text-xl leading-none">
                            +
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Add Option (if searching) */}
              {searchTerm.length > 0 && searchResults.length === 0 && (
                <div className="space-y-2">
                  <div className="px-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Nuovo Giocatore
                  </div>
                  <button
                    onClick={() =>
                      handleAddPlayer({
                        name: searchTerm,
                        isGuest: true,
                      })
                    }
                    className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-2xl border border-dashed border-gray-700 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-white text-xl">+</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-base text-white font-medium">
                        Aggiungi &quot;{searchTerm}&quot;
                      </div>
                      <div className="text-sm text-gray-400">Crea come ospite temporaneo</div>
                    </div>
                  </button>
                </div>
              )}

              {/* Device Contacts Section */}
              <div className="pt-2">
                <div className="px-1 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Altre Opzioni
                </div>
                <button
                  onClick={handleNativeContactPick}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-gray-800 to-gray-800/50 hover:from-gray-700 hover:to-gray-700/50 border border-gray-700 rounded-2xl transition-all text-left group shadow-lg"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center group-hover:bg-gray-600 transition-colors border border-gray-600">
                    <span className="text-2xl">📒</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-base text-gray-100 font-bold">Apri Rubrica Telefono</div>
                    <div className="text-sm text-gray-400">
                      Seleziona dai contatti del dispositivo
                    </div>
                  </div>
                  <div className="text-gray-500 group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </button>
                <p className="text-xs text-gray-500 px-2 mt-3 text-center">
                  Verranno importati solo i contatti con numero di cellulare valido.
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}

      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
          {isLessonBooking
            ? 'Dettagli Lezione'
            : `Giocatori (${currentPlayers?.length || 1}/${maxPlayers})`}
        </div>
        {!isLessonBooking && !hideEditControls && (
          <button
            onClick={onToggleEdit}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors bg-blue-500/10 px-2 py-1 rounded-lg"
          >
            {isEditingPlayers ? 'Fine' : 'Modifica'}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* Organizer / Player 1 */}
        <div className="p-3 bg-gradient-to-r from-blue-900/20 to-blue-800/20 backdrop-blur-sm rounded-xl border border-blue-500/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-500/20">
              <span className="text-white text-xs">👑</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-100">
                {currentPlayers && currentPlayers[0]
                  ? getPlayerDisplayName(currentPlayers[0])
                  : booking.userName || 'Organizzatore'}
              </div>
              <div className="text-[10px] text-blue-400 font-medium uppercase tracking-wide">
                Organizzatore
              </div>
            </div>
          </div>
        </div>

        {/* Other Players */}
        {slots.slice(1).map((_, index) => {
          const player = currentPlayers && currentPlayers[index + 1];
          const isSlotEmpty = !player;

          // Only show add UI for the immediate next slot
          // index 0 corresponds to slot 2 (player index 1)
          // if currentPlayers.length is 1, we want index 0 to show UI.
          const showAddUI = isSlotEmpty && index + 1 === currentPlayers.length;

          if (isSlotEmpty) {
            if (!isEditingPlayers) {
              // View mode: Empty slot
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-gray-800/30 rounded-xl px-3 py-2.5 border border-dashed border-gray-700/50"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-700/30 flex items-center justify-center">
                    <span className="text-gray-600 text-xs">{index + 2}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Slot libero</div>
                </div>
              );
            } else {
              // Edit mode
              if (showAddUI) {
                return (
                  <div key={index}>
                    <button
                      onClick={handleOpenAddPlayer}
                      disabled={isSearching}
                      className="w-full flex items-center gap-3 bg-blue-500/5 hover:bg-blue-500/10 rounded-xl px-3 py-2.5 border border-dashed border-blue-500/30 hover:border-blue-400/50 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                        <span className="text-blue-400 group-hover:text-blue-300 text-lg">+</span>
                      </div>
                      <div className="text-xs text-blue-400 group-hover:text-blue-300 font-medium">
                        {isSearching ? 'Ricerca...' : 'Aggiungi Giocatore'}
                      </div>
                    </button>
                  </div>
                );
              } else {
                // Future empty slot
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-gray-800/20 rounded-xl px-3 py-2.5 border border-dashed border-gray-700/30 opacity-40"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-700/20 flex items-center justify-center">
                      <span className="text-gray-600 text-xs">{index + 2}</span>
                    </div>
                    <div className="text-xs text-gray-600 italic">Slot successivo</div>
                  </div>
                );
              }
            }
          } else {
            // Player exists in slot
            return (
              <div
                key={index}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border shadow-sm group relative ${
                  player.isGuest
                    ? 'bg-gray-700/40 border-gray-600/20'
                    : 'bg-blue-900/20 border-blue-500/20'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ring-1 ${
                    player.isGuest
                      ? 'bg-gradient-to-br from-gray-600 to-gray-700 ring-white/10'
                      : 'bg-gradient-to-br from-blue-500 to-blue-600 ring-blue-400/30'
                  }`}
                >
                  {player.avatar ? (
                    <img
                      src={player.avatar}
                      alt={getPlayerDisplayName(player)}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xs font-bold">
                      {getPlayerDisplayName(player).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div
                      className={`text-sm font-medium truncate ${player.isGuest ? 'text-gray-200' : 'text-blue-100'}`}
                    >
                      {getPlayerDisplayName(player)}
                    </div>
                    {!player.isGuest && (
                      <img
                        src="/play-sport-pro_icon_only.svg"
                        alt="PlaySport"
                        className="w-4 h-4 object-contain drop-shadow-sm"
                      />
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {player.phone || player.email || `Giocatore ${index + 2}`}
                    {player.isGuest && ' (Ospite)'}
                  </div>
                </div>
                {isEditingPlayers && (
                  <button
                    onClick={() => {
                      const newPlayers = [...editedPlayers];
                      newPlayers.splice(index + 1, 1);
                      setEditedPlayers(newPlayers);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
