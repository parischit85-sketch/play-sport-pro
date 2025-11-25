import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Capacitor } from '@capacitor/core';
import { Contacts } from '@capacitor-community/contacts';
import { getUserByPhone } from '@services/users.js';
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
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactsPermission, setContactsPermission] = useState('prompt');
  const [debugError, setDebugError] = useState('');
  const [matchedContacts, setMatchedContacts] = useState({}); // Map phone -> userData

  const [searchTerm, setSearchTerm] = useState('');

  // Check if filtered contacts are registered users
  useEffect(() => {
    const checkContactsRegistration = async () => {
      if (!searchTerm || filteredDeviceContacts.length === 0) return;
      
      // Only check top 10 results to avoid spamming DB
      const contactsToCheck = filteredDeviceContacts.slice(0, 10);
      const newMatches = { ...matchedContacts };
      let hasUpdates = false;

      await Promise.all(
        contactsToCheck.map(async (contact) => {
          // Skip if already checked
          if (newMatches[contact.phone]) return;

          try {
            const user = await getUserByPhone(contact.phone);
            if (user) {
              newMatches[contact.phone] = user;
              hasUpdates = true;
            } else {
              // Mark as checked but not found (null) to avoid re-checking
              newMatches[contact.phone] = null;
              hasUpdates = true;
            }
          } catch (err) {
            console.warn('Error checking contact:', contact.phone, err);
          }
        })
      );

      if (hasUpdates) {
        setMatchedContacts(newMatches);
      }
    };

    const timer = setTimeout(checkContactsRegistration, 500); // Debounce check
    return () => clearTimeout(timer);
  }, [searchTerm, deviceContacts]); // Re-run when search or contacts change

  const fetchContacts = async () => {
    setDebugError('');
    setIsLoadingContacts(true);

    // ---------------------------------------------------------
    // 1. LOCAL DEV / BROWSER MODE (Mock Data)
    // ---------------------------------------------------------
    if (!Capacitor.isNativePlatform()) {
      console.log('Browser detected: Loading mock contacts...');
      setTimeout(() => {
        setDeviceContacts([
          { id: 'mock1', name: 'Contatto Test 1', phone: '333 1111111' },
          { id: 'mock2', name: 'Mario Rossi', phone: '+39 333 2222222' },
          { id: 'mock3', name: 'Luigi Verdi', phone: '3333333333' },
          { id: 'mock4', name: 'Mamma', phone: '333 4444444' },
        ]);
        setContactsPermission('granted');
        setIsLoadingContacts(false);
      }, 800);
      return;
    }

    // ---------------------------------------------------------
    // 2. NATIVE DEVICE MODE
    // ---------------------------------------------------------
    try {
      // Attempt direct fetch first
      const result = await Contacts.getContacts({
        projection: {
          name: true,
          phones: true,
        },
      });

      setContactsPermission('granted');
      
      if (result && result.contacts) {
        const mappedContacts = result.contacts
          .filter((c) => c.phones && c.phones.length > 0)
          .map((c) => ({
            id: c.contactId || String(Date.now() + Math.random()),
            name: c.displayName || (c.name ? c.name.display || c.name.given : 'Sconosciuto'),
            phone: c.phones[0].number,
          }));
        
        setDeviceContacts(mappedContacts);
      }
    } catch (err) {
      console.warn('Direct fetch failed, requesting permissions...', err);
      
      // Fallback: Request permissions explicitly
      try {
        const perm = await Contacts.requestPermissions();
        setContactsPermission(perm.contacts);

        if (perm.contacts === 'granted') {
          const result = await Contacts.getContacts({
            projection: {
              name: true,
              phones: true,
            },
          });
          
          if (result && result.contacts) {
            const mappedContacts = result.contacts
              .filter((c) => c.phones && c.phones.length > 0)
              .map((c) => ({
                id: c.contactId || String(Date.now() + Math.random()),
                name: c.displayName || (c.name ? c.name.display || c.name.given : 'Sconosciuto'),
                phone: c.phones[0].number,
              }));
            
            setDeviceContacts(mappedContacts);
          }
        } else {
          setDebugError('Permesso negato dall\'utente');
        }
      } catch (permErr) {
        console.error('Permission flow error:', permErr);
        setDebugError(`Err: ${permErr.message || JSON.stringify(permErr)}`);
      }
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Load device contacts when modal opens
  useEffect(() => {
    if (showContactModal) {
      fetchContacts();
    }
  }, [showContactModal]);

  // Load recent players on mount and refresh their status
  useEffect(() => {
    const loadAndRefreshRecentPlayers = async () => {
      try {
        const saved = localStorage.getItem('psp_recent_players');
        if (saved) {
          const players = JSON.parse(saved);
          let hasUpdates = false;

          // Check for guests that might have registered
          const updatedPlayers = await Promise.all(
            players.map(async (p) => {
              // Only check if guest and has phone
              if (p.isGuest && p.phone) {
                try {
                  const user = await getUserByPhone(p.phone);
                  if (user) {
                    hasUpdates = true;
                    return {
                      name: user.displayName || user.firstName || p.name,
                      email: user.email || p.email,
                      phone: user.phone || p.phone,
                      uid: user.uid,
                      avatar: user.avatar || p.avatar,
                      isGuest: false,
                    };
                  }
                } catch (err) {
                  console.warn('Error checking user status:', err);
                }
              }
              return p;
            })
          );

          setRecentPlayers(updatedPlayers);

          if (hasUpdates) {
            localStorage.setItem('psp_recent_players', JSON.stringify(updatedPlayers));
          }
        }
      } catch (e) {
        console.error('Error loading recent players:', e);
      }
    };

    loadAndRefreshRecentPlayers();
  }, []);

  // Debounced search for PlaySport users inside Modal - REMOVED
  /*
  useEffect(() => {
     // ... removed global search ...
  }, []);
  */

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

  // Debounced search for PlaySport users inside Modal - REMOVED
  /*
  useEffect(() => {
     // ... removed global search ...
  }, []);
  */

  const handleRemoveRecent = (e, playerToRemove) => {
    e.stopPropagation();
    setRecentPlayers((prev) => {
      const updated = prev.filter((p) => {
        if (playerToRemove.uid && p.uid === playerToRemove.uid) return false;
        if (!playerToRemove.uid && p.name === playerToRemove.name) return false;
        return true;
      });
      localStorage.setItem('psp_recent_players', JSON.stringify(updated));
      return updated;
    });
  };

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
    try {
      // Native Platform Logic
      if (Capacitor.isNativePlatform()) {
        try {
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

            if (phone) {
              await processSelectedContacts([{ name, phone }]);
            } else {
              // If picked contact has no phone, show modal to let them search/add manually
              setShowContactModal(true);
            }
          }
        } catch (pickError) {
          console.warn('Pick contact failed or cancelled:', pickError);
          // Just show the modal if picker fails/cancels
          setShowContactModal(true);
        }
      } 
      // Web/PWA Logic
      else if ('contacts' in navigator && 'ContactsManager' in window) {
        const props = ['name', 'tel'];
        const opts = { multiple: true };

        const contacts = await navigator.contacts.select(props, opts);

        if (contacts && contacts.length > 0) {
          await processSelectedContacts(
            contacts.map((c) => ({
              name: c.name ? c.name[0] : 'Sconosciuto',
              phone: c.tel ? c.tel[0] : '',
            }))
          );
        }
      } else {
        // Fallback to manual input
        setShowContactModal(true);
      }
    } catch (error) {
      console.error('Error picking contact:', error);
      setShowContactModal(true);
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
    // Native picker auto-open removed to favor integrated search
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
  const filteredDeviceContacts = deviceContacts.filter((c) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = (c.name || '').toLowerCase().includes(searchLower);
    
    // Aggressive phone matching: strip all non-digits
    const phoneClean = (c.phone || '').replace(/\D/g, '');
    const searchClean = searchTerm.replace(/\D/g, '');
    
    // Only match phone if user typed at least 3 digits
    const phoneMatch = searchClean.length >= 3 && phoneClean.includes(searchClean);
    
    return nameMatch || phoneMatch;
  });

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
              {/* PlaySport Search Results - REMOVED as per user request */}

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
                        <div className="flex items-center gap-1">
                          <div
                            onClick={(e) => handleRemoveRecent(e, player)}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors z-10"
                            title="Rimuovi dai recenti"
                          >
                            ✕
                          </div>
                          <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-500/20">
                            <span className="text-blue-400 opacity-0 group-hover:opacity-100 text-xl leading-none">
                              +
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Device Contacts Section */}
              {isLoadingContacts && (
                <div className="p-4 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Caricamento rubrica...
                </div>
              )}

              {!isLoadingContacts && contactsPermission !== 'granted' && Capacitor.isNativePlatform() && (
                <div className="p-4 text-center">
                  <p className="text-gray-400 text-sm mb-2">
                    Permesso contatti necessario per la ricerca
                  </p>
                  <button
                    onClick={fetchContacts}
                    className="text-blue-400 text-sm font-bold hover:underline px-4 py-2 bg-blue-500/10 rounded-lg"
                  >
                    Abilita Accesso / Riprova
                  </button>
                </div>
              )}

              {/* Debug Error Display */}
              {debugError && (
                <div className="mx-4 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="text-xs font-bold text-red-400 mb-1">Errore Contatti:</div>
                  <div className="text-[10px] text-red-300 font-mono break-all">
                    {debugError}
                  </div>
                </div>
              )}

              {filteredDeviceContacts.length > 0 && (
                <div className="space-y-2">
                  <div className="px-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Rubrica Telefono
                  </div>
                  <div className="bg-gray-800/30 rounded-2xl overflow-hidden border border-gray-800">
                    {filteredDeviceContacts.map((contact, idx) => {
                      const matchedUser = matchedContacts[contact.phone];
                      
                      return (
                        <button
                          key={contact.id || idx}
                          onClick={() =>
                            handleAddPlayer(
                              matchedUser
                                ? {
                                    name: matchedUser.displayName || matchedUser.firstName || contact.name,
                                    email: matchedUser.email,
                                    phone: matchedUser.phone,
                                    uid: matchedUser.uid,
                                    avatar: matchedUser.avatar,
                                    isGuest: false,
                                  }
                                : {
                                    name: contact.name,
                                    phone: contact.phone,
                                    isGuest: true,
                                  }
                            )
                          }
                          className={`w-full flex items-center gap-4 p-3 hover:bg-gray-800 transition-colors text-left group ${
                            idx !== filteredDeviceContacts.length - 1
                              ? 'border-b border-gray-800/50'
                              : ''
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ring-2 relative ${
                            matchedUser ? 'bg-blue-500/20 ring-blue-500/30' : 'bg-gray-700 ring-gray-600'
                          }`}>
                            {matchedUser && matchedUser.avatar ? (
                              <img
                                src={matchedUser.avatar}
                                alt={matchedUser.displayName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className={`text-sm font-bold ${matchedUser ? 'text-blue-400' : 'text-white'}`}>
                                {(contact.name || '?').charAt(0).toUpperCase()}
                              </span>
                            )}
                            
                            {/* Badge Icon */}
                            <div className={`absolute -bottom-1 -right-1 rounded-full border border-gray-800 p-[2px] w-4 h-4 flex items-center justify-center shadow-sm ${
                              matchedUser ? 'bg-blue-500' : 'bg-green-500'
                            }`}>
                              {matchedUser ? (
                                <img src="/play-sport-pro_icon_only.svg" alt="PS" className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-[8px] text-white">📞</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className={`text-base font-medium truncate ${matchedUser ? 'text-blue-100' : 'text-white'}`}>
                                {contact.name}
                              </div>
                              {matchedUser && (
                                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20">
                                  Registrato
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 truncate">
                              {matchedUser ? matchedUser.displayName : contact.phone}
                            </div>
                          </div>
                          
                          <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-500/20">
                            <span className="text-blue-400 opacity-0 group-hover:opacity-100 text-xl leading-none">
                              +
                            </span>
                          </div>
                        </button>
                      );
                    })}
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
              {/* Removed 'Open Contacts' button as requested, integrated into search */}
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
