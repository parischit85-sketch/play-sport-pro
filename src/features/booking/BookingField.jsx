import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Section from '@ui/Section.jsx';
import Badge from '@ui/Badge.jsx';
import { createDSClasses } from '@lib/design-system.js';
import { floorToSlot, addMinutes, sameDay, overlaps } from '@lib/date.js';
import { computePrice } from '@lib/pricing.js';
import { isSlotAvailable, createBooking, loadBookings, getPublicBookings, setCloudMode, cancelBooking as cancelBookingService } from '@services/bookings.js';
import { loadActiveUserBookings, loadBookingHistory } from '@services/cloud-bookings.js';

function BookingField({ user, T, state, setState }) {
  const ds = createDSClasses(T);
  const cfg = state?.bookingConfig || { slotMinutes: 30, dayStartHour: 8, dayEndHour: 23, defaultDurations: [60,90,120], addons: {} };
  const courtsFromState = Array.isArray(state?.courts) ? state.courts : [];
  
  // Stato UI
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [duration, setDuration] = useState(() => (cfg.defaultDurations?.includes(90) ? 90 : (cfg.defaultDurations?.[0] || 60)));
  const [lighting, setLighting] = useState(false);
  const [heating, setHeating] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [additionalPlayers, setAdditionalPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [expandedBookings, setExpandedBookings] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [showPastBookings, setShowPastBookings] = useState(false);
  
  // Stato dati: usa storage centralizzato per sincronizzare con PrenotazioneCampi
  const [bookings, setBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [activeUserBookings, setActiveUserBookings] = useState([]);
  const [pastUserBookings, setPastUserBookings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Configura modalità cloud quando l'utente cambia
  useEffect(() => {
    // Attiva modalità cloud solo se l'utente è autenticato con Firebase (uid disponibile)
    setCloudMode(Boolean(user?.uid), user);
    // Ricarica le prenotazioni quando cambia la modalità
    const loadInitialBookings = async () => {
      try {
        const publicBookings = await getPublicBookings();
        setBookings(publicBookings);
        
        // Carica anche le prenotazioni dell'utente se autenticato
        if (user) {
          await loadUserBookingsData();
        } else {
          setUserBookings([]);
          setActiveUserBookings([]);
        }
      } catch (error) {
        // Error loading initial bookings
      }
    };
    loadInitialBookings();
  }, [user]);

  // Funzione per caricare le prenotazioni dell'utente
  const loadUserBookingsData = async () => {
    if (!user) {
      setUserBookings([]);
      setActiveUserBookings([]);
      setPastUserBookings([]);
      return;
    }

    try {
      if (user.uid) {
        // Utente autenticato - usa il cloud
        const [activeBookings, pastBookings] = await Promise.all([
          loadActiveUserBookings(user.uid),
          loadBookingHistory(user.uid)
        ]);
        setActiveUserBookings(activeBookings);
        setPastUserBookings(pastBookings);
        setUserBookings([...activeBookings, ...pastBookings]); // Combina tutte
      } else {
        // Fallback locale
        const allBookings = await loadBookings();
        const filtered = allBookings.filter(booking => 
          booking.bookedBy === user.email || 
          booking.bookedBy === user.displayName ||
          (booking.players && booking.players.includes(user.email)) ||
          (booking.players && booking.players.includes(user.displayName))
        );
        
        const now = new Date();
        const active = filtered.filter(booking => {
          const bookingStart = new Date(`${booking.date}T${booking.time}:00`);
          return bookingStart >= now;
        }).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
        
        const past = filtered.filter(booking => {
          const bookingStart = new Date(`${booking.date}T${booking.time}:00`);
          return bookingStart < now;
        }).sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
        
        setUserBookings(filtered);
        setActiveUserBookings(active);
        setPastUserBookings(past);
      }
    } catch (error) {
      // Error loading user bookings
      setUserBookings([]);
      setActiveUserBookings([]);
      setPastUserBookings([]);
    }
  };

  // Stato dati: usa storage centralizzato per sincronizzare con PrenotazioneCampi

  // Proietta le prenotazioni dell'App (state.bookings) in forma pubblica (no PII)
  const projectStateToPublic = (list) => {
    if (!Array.isArray(list)) return [];
    return list.map((b) => {
      const d = new Date(b.start);
      const date = d.toISOString().split('T')[0];
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return {
        id: b.id || `${b.courtId}-${b.start}`,
        courtId: b.courtId,
        courtName: '',
        date,
        time: `${hh}:${mm}`,
        duration: b.duration || 60,
        status: b.status || 'booked',
      };
    });
  };

  // Merge prenotazioni dal servizio (cloud/local) con quelle nello state dell'App
  useEffect(() => {
    let cancelled = false;
    const mergePublicAndApp = async () => {
      try {
        const svc = await getPublicBookings();
        const app = projectStateToPublic(state?.bookings || []);
        const map = new Map();
        for (const b of [...svc, ...app]) map.set(b.id, b);
        if (!cancelled) setBookings(Array.from(map.values()));
      } catch (e) {
        // Error merging public bookings
      }
    };
    mergePublicAndApp();
    return () => { cancelled = true; };
  }, [state?.bookings, state?._rev]);

  // Reset messaggio quando cambia l'utente
  useEffect(() => {
    setMessage(null);
  }, [user]);

  // Auto-seleziona oggi
  useEffect(() => {
    if (!selectedDate) {
      // Usa il fuso orario locale invece di UTC
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setSelectedDate(`${year}-${month}-${day}`);
    }
  }, [selectedDate]);

  // Reset opzioni quando cambia campo (in base a cfg.addons)
  useEffect(() => {
    const addons = cfg?.addons || {};
    if (!addons.lightingEnabled) setLighting(false);
    if (!addons.heatingEnabled) setHeating(false);
  }, [selectedCourt]);

  // Filtra campi disponibili
  const getFilteredCourts = () => {
    return courtsFromState;
  };

  // Verifica disponibilità slot
  const checkSlotAvailability = useCallback((courtId, date, time) => {
    const result = isSlotAvailable(courtId, date, time, duration, bookings);
    
    return result;
  }, [duration, bookings]);

  // Time helpers based on cfg - filtered for availability and past times
  const timeSlots = useMemo(() => {
    if (!selectedDate || !duration) return [];
    
    const res = [];
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), cfg.dayStartHour || 8, 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), cfg.dayEndHour || 23, 0, 0, 0);
    const step = cfg.slotMinutes || 30;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    for (let t = new Date(start); t < end; t = addMinutes(t, step)) {
      const hh = String(t.getHours()).padStart(2, '0');
      const mm = String(t.getMinutes()).padStart(2, '0');
      const timeStr = `${hh}:${mm}`;
      
      // Skip past times if booking for today
      if (selectedDate === today) {
        const slotDateTime = new Date(`${selectedDate}T${timeStr}:00`);
        if (slotDateTime <= now) {
          continue;
        }
      }
      
      // Check if any court is available for this time slot
      const hasAvailableCourt = courtsFromState.some(court => {
        return checkSlotAvailability(court.id, selectedDate, timeStr);
      });
      
      if (hasAvailableCourt) {
        res.push(timeStr);
      }
    }
    return res;
  }, [cfg.dayStartHour, cfg.dayEndHour, cfg.slotMinutes, selectedDate, duration, bookings, courtsFromState, checkSlotAvailability]);

  const availableDays = useMemo(() => {
    const out = [];
    const max = 7; // come PrenotazioneCampi
    for (let i = 0; i < max; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      // Usare il fuso orario locale invece di UTC
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`;
      
      out.push({
        date: localDateStr,
        label: i === 0 ? 'Oggi' : i === 1 ? 'Domani' : d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }),
      });
    }
    return out;
  }, []);

  const datetimeOf = (dateStr, timeStr) => floorToSlot(new Date(`${dateStr}T${timeStr}:00`), cfg.slotMinutes || 30);

  // Gestione giocatori aggiuntivi
  const addPlayer = () => {
    if (newPlayerName.trim() && additionalPlayers.length < 3) { // max 4 giocatori totali (incluso organizzatore)
      setAdditionalPlayers([...additionalPlayers, { 
        id: Date.now(), 
        name: newPlayerName.trim() 
      }]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (playerId) => {
    setAdditionalPlayers(additionalPlayers.filter(p => p.id !== playerId));
  };


  const canCancelBooking = (booking) => {
    const bookingStart = new Date(`${booking.date}T${booking.time}:00`);
    const now = new Date();
    const hoursUntilBooking = (bookingStart - now) / (1000 * 60 * 60);
    
    // Il circolo (admin) può sempre cancellare, gli utenti solo 30h prima
    return state?.user?.isAdmin || hoursUntilBooking >= 30;
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Sei sicuro di voler cancellare questa prenotazione?')) return;
    try {
      await cancelBookingService(bookingId, user);
      // Aggiorna anche lo state dell'App
      if (state && setState) {
        setState(s => ({
          ...s,
          bookings: s.bookings?.filter(b => b.id !== bookingId) || []
        }));
      }
      const updatedPublicBookings = await getPublicBookings();
      setBookings(updatedPublicBookings);
      await loadUserBookingsData();
      setMessage({ type: 'success', text: 'Prenotazione cancellata con successo' });
    } catch (e) {
      // Error canceling booking
      setMessage({ type: 'error', text: 'Impossibile cancellare la prenotazione. Riprova.' });
    }
  };

  const showBookingDetails = (booking) => {
    const court = courtsFromState.find(c => c.id === booking.courtId);
    const details = {
      ...booking,
      courtName: court?.name || booking.courtName || 'Campo',
      courtFeatures: court?.features || [],
      canCancel: canCancelBooking(booking),
      hoursUntil: Math.round((new Date(`${booking.date}T${booking.time}:00`) - new Date()) / (1000 * 60 * 60))
    };
    setSelectedBookingDetails(details);
  };

  const getDisplayedBookings = () => {
    return expandedBookings ? activeUserBookings : activeUserBookings.slice(0, 3);
  };

  // Validazione locale basata su state.courts e bookingConfig
  const validateBookingLocal = (booking, bookingsList) => {
    const errors = [];
    const court = courtsFromState.find(c => c.id === booking.courtId);
    if (!court) errors.push('Campo non valido');

    const allowed = Array.isArray(cfg.defaultDurations) ? cfg.defaultDurations : [60, 90, 120];
    if (!allowed.includes(booking.duration)) errors.push('Durata non valida');

    // Non prenotare nel passato
    const startDt = datetimeOf(booking.date, booking.time);
    if (startDt < new Date()) errors.push('Non puoi prenotare nel passato');

    // Apertura giornaliera
    const open = new Date(startDt); open.setHours(cfg.dayStartHour || 8, 0, 0, 0);
    const close = new Date(startDt); close.setHours(cfg.dayEndHour || 23, 0, 0, 0);
    const endDt = addMinutes(startDt, booking.duration);
    if (!(startDt >= open && endDt <= close)) errors.push('Fuori orario di apertura');

    // Opzioni
    const addons = cfg?.addons || {};
    if (booking.lighting && !addons.lightingEnabled) errors.push('Illuminazione non disponibile');
    if (booking.heating && !addons.heatingEnabled) errors.push('Riscaldamento non disponibile');

    // Sovrapposizioni
    if (!isSlotAvailable(booking.courtId, booking.date, booking.time, booking.duration, bookingsList)) {
      errors.push('Slot non disponibile');
    }
    return errors;
  };

  // Gestisce conferma prenotazione
  const handleBooking = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Devi effettuare il login per prenotare un campo' });
      return;
    }

    if (!selectedDate || !selectedTime || !selectedCourt) {
      setMessage({ type: 'error', text: 'Seleziona data, orario e campo' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
  // Merge pubblico per controllo conflitti real-time (include anche PrenotazioneCampi)
  const publicForConflict = bookings;

  // Controlla nuovamente disponibilità
  if (!isSlotAvailable(selectedCourt.id, selectedDate, selectedTime, duration, publicForConflict)) {
        setMessage({ type: 'error', text: 'Slot non più disponibile. Scegli un altro orario.' });
        setIsSubmitting(false);
        return;
      }

      const bookingData = {
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
        date: selectedDate,
        time: selectedTime,
        duration,
        lighting: !!lighting, // guidato da cfg.addons
        heating: !!heating,
        price: computePrice(
          datetimeOf(selectedDate, selectedTime),
          duration,
          cfg,
          { lighting: !!lighting, heating: !!heating },
          selectedCourt.id,
          courtsFromState
        ),
        userPhone,
        notes,
        players: [user.displayName || user.email, ...additionalPlayers.map(p => p.name)]
      };

  // Valida prenotazione (locale)
  const errors = validateBookingLocal(bookingData, publicForConflict);
      if (errors.length > 0) {
        setMessage({ type: 'error', text: errors.join(', ') });
        setIsSubmitting(false);
        return;
      }

      // Crea prenotazione (servizio cloud/locale)
  const newBooking = await createBooking(bookingData, user);
      
      if (!newBooking) {
        setMessage({ type: 'error', text: 'Errore nel salvare la prenotazione' });
        setIsSubmitting(false);
        return;
      }

      // Aggiorna stato locale e App.state per riflettere subito in "Gestione Campi"
      const freshBookings = await getPublicBookings();
      setBookings(freshBookings);
      
      // Ricarica anche le prenotazioni dell'utente
      await loadUserBookingsData();
      try {
        if (state && setState) {
          const toAppBooking = {
            id: newBooking.id,
            courtId: newBooking.courtId,
            start: new Date(`${newBooking.date}T${newBooking.time}:00`).toISOString(),
            duration: newBooking.duration,
            players: [],
            playerNames: additionalPlayers.map(p => p.name),
            guestNames: additionalPlayers.map(p => p.name),
            price: newBooking.price,
            note: newBooking.notes || '',
            bookedByName: newBooking.bookedBy || '',
            addons: { lighting: !!newBooking.lighting, heating: !!newBooking.heating },
            status: 'booked',
            createdAt: Date.now(),
          };
          setState((s) => ({ ...s, bookings: [...(s.bookings || []), toAppBooking] }));
        }
      } catch { /* no-op */ }
      
      // Reset form (prima salviamo il nome per messaggio)
      const confirmCourtName = selectedCourt?.name || '—';
      setSelectedTime('');
      setSelectedCourt(null);
      setLighting(false);
      setHeating(false);
      setUserPhone('');
      setNotes('');
      setAdditionalPlayers([]);
      setNewPlayerName('');
      
      const savedWhere = newBooking?._storage === 'local' ? ' (salvata in locale per quota cloud)' : '';
      setMessage({ 
        type: 'success', 
        text: `Prenotazione confermata${savedWhere}! Campo ${confirmCourtName} il ${new Date(selectedDate).toLocaleDateString('it-IT')} alle ${selectedTime}` 
      });

    } catch (error) {
      // Booking error
  const isQuota = /quota exceeded|resource-exhausted/i.test(String(error?.message || ''));
  setMessage({ type: 'error', text: isQuota ? 'Quota cloud esaurita: la prenotazione verrà salvata in locale.' : 'Errore durante la prenotazione. Riprova.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = selectedCourt && selectedDate && selectedTime
    ? computePrice(datetimeOf(selectedDate, selectedTime), duration, cfg, { lighting, heating }, selectedCourt.id, courtsFromState)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header e Le mie prenotazioni */}
      <div>
        <h1 className={`${ds.h3} mb-4`}>Prenota Campo</h1>
        
        {/* Le mie prenotazioni */}
        {user ? (
          <div className={`${T.cardBg} ${T.border} ${T.borderMd} p-4 mb-6`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`${ds.h5} flex items-center gap-2`}>
                <span>Prenotazioni Attive</span>
                <Badge variant="default" size="xs" T={T}>{activeUserBookings.length}</Badge>
              </h2>
              
              <div className="flex items-center gap-2">
                {pastUserBookings.length > 0 && (
                  <button
                    onClick={() => setShowPastBookings(true)}
                    className="text-sm px-3 py-1 rounded-md transition-all text-gray-600 hover:text-gray-800 border border-gray-300 hover:bg-gray-50"
                  >
                    Storico ({pastUserBookings.length})
                  </button>
                )}
                
                {activeUserBookings.length > 3 && (
                  <button
                    onClick={() => setExpandedBookings(!expandedBookings)}
                    className={`text-sm px-3 py-1 rounded-md transition-all ${T.primaryBg} ${T.primaryText}`}
                  >
                    {expandedBookings ? 'Mostra meno' : 'Mostra tutte'}
                  </button>
                )}
              </div>
            </div>
            
            {activeUserBookings.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm mb-2">
                  Non hai prenotazioni attive
                </p>
                {pastUserBookings.length > 0 && (
                  <button
                    onClick={() => setShowPastBookings(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Visualizza storico prenotazioni ({pastUserBookings.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {getDisplayedBookings().map((booking) => {
                  const canCancel = canCancelBooking(booking);
                  const court = courtsFromState.find(c => c.id === booking.courtId);
                  
                  return (
                    <div 
                      key={booking.id} 
                      className={`${T.cardBg} ${T.border} p-3 rounded-md cursor-pointer hover:shadow-md transition-all`}
                      onClick={() => showBookingDetails(booking)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {court?.name || booking.courtName || 'Campo'}
                            </span>
                            <Badge variant="primary" size="xs" T={T}>
                              {booking.players?.length || 1} giocatori
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(booking.date).toLocaleDateString('it-IT', { 
                              weekday: 'short', 
                              day: 'numeric', 
                              month: 'short' 
                            })} alle {booking.time} • {booking.duration}min • {booking.price}€
                          </div>
                          {booking.players && booking.players.length > 1 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Con: {booking.players.filter(p => p !== user.email && p !== user.displayName).slice(0, 2).join(', ')}
                              {booking.players.length > 3 && '...'}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
              {canCancel ? (
                            <button
                onClick={() => handleCancelBooking(booking.id)}
                              className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                              title="Cancella prenotazione"
                            >
                              Cancella
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 px-2 py-1">
                              Non cancellabile
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className={`${T.cardBg} ${T.border} ${T.borderMd} p-4 mb-6 text-center`}>
            <p className="text-gray-600 text-sm mb-3">
              Accedi per vedere le tue prenotazioni e prenotare nuovi campi
            </p>
            <p className="text-xs text-gray-500">
              Le prenotazioni possono essere cancellate fino a 30 ore prima dell'orario prenotato
            </p>
          </div>
        )}
      </div>

      {/* Messaggio di stato */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'error' 
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Selezione Giorno */}
      <Section title="Seleziona Giorno" variant="minimal" T={T}>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {availableDays.map((day) => (
            <button
              key={day.date}
              onClick={() => {
                setSelectedDate(day.date);
                setSelectedTime('');
                setSelectedCourt(null);
              }}
              className={`p-3 rounded-lg border text-center transition-all ${
                selectedDate === day.date
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm font-medium'
                  : `${T.cardBg} ${T.border} hover:bg-gray-50`
              }`}
            >
              <div className="text-sm font-medium">{day.label}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Selezione Orario */}
      {selectedDate && (
        <Section title="Seleziona Orario" variant="minimal" T={T}>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => {
                  setSelectedTime(time);
                  setSelectedCourt(null);
                }}
                className={`p-2 rounded-lg border text-center transition-all ${
                  selectedTime === time
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm font-medium'
                    : `${T.cardBg} ${T.border} hover:bg-gray-50`
                }`}
              >
                <div className="text-sm font-medium">{time}</div>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Lista Campi */}
      {selectedDate && selectedTime && (
        <Section title="Campi Disponibili" variant="minimal" T={T}>
          {!getFilteredCourts().length && (
            <div className={`p-4 ${T.cardBg} ${T.border} ${T.borderMd}`}>Nessun campo configurato. Aggiungi campi nella configurazione della lega.</div>
          )}
          <div className="grid gap-3">
            {getFilteredCourts().map((court) => {
              const available = checkSlotAvailability(court.id, selectedDate, selectedTime);
              const isSelected = selectedCourt?.id === court.id;
              
              return (
                <div
                  key={court.id}
                  className={`${T.cardBg} ${T.border} ${T.borderMd} transition-all ${
                    available 
                      ? isSelected
                        ? `${T.primaryBorder} ring-2 ${T.primaryRing}`
                        : 'hover:shadow-md cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  } ${isSelected ? 'p-0' : 'p-4'}`}
                >
                  {/* Header del campo - sempre visibile */}
                  <div 
                    className={`${isSelected ? 'p-4 border-b border-gray-200' : ''}`}
                    onClick={() => available && setSelectedCourt(court)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className={`${ds.h5} mb-1 flex items-center gap-2`}>
                          {court.name}
                          {court.premium && (
                            <Badge variant="warning" size="xs" T={T}>Premium</Badge>
                          )}
                        </h3>
                        {Array.isArray(court.features) && court.features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {court.features.map((feature, index) => (
                              <Badge key={index} variant="default" size="xs" T={T}>
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {selectedDate && selectedTime && (
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-600">
                              {computePrice(datetimeOf(selectedDate, selectedTime), 60, cfg, { lighting:false, heating:false }, court.id, courtsFromState)}€/60min
                            </div>
                            <div className="text-sm text-gray-600">
                              {computePrice(datetimeOf(selectedDate, selectedTime), 90, cfg, { lighting:false, heating:false }, court.id, courtsFromState)}€/90min
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${
                        available 
                          ? 'text-emerald-600' 
                          : 'text-red-600'
                      }`}>
                        {available ? 'Disponibile' : 'Non disponibile'}
                      </span>
                      
                      {isSelected && (
                        <Badge variant="primary" size="sm" T={T}>Selezionato</Badge>
                      )}
                    </div>
                  </div>

                  {/* Sezione espansa per configurazione prenotazione */}
                  {isSelected && (
                    <div className={`${T.cardBg} border-t ${T.border}`}>
                      {/* Configurazione compatta */}
                      <div className="p-4 space-y-3">
                        {/* Durata e Prezzo */}
                        <div>
                          <label className={`${ds.bodySm} block mb-2 font-medium`}>Durata e Prezzo</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(cfg.defaultDurations || [60, 90, 120]).map((dur) => {
                              const price = selectedDate && selectedTime ? computePrice(datetimeOf(selectedDate, selectedTime), dur, cfg, { lighting, heating }, court.id, courtsFromState) : 0;
                              return (
                                <button
                                  key={dur}
                                  onClick={() => setDuration(dur)}
                                  className={`p-2 rounded-md border text-center transition-all text-sm ${
                                    duration === dur
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm font-medium'
                                      : `${T.cardBg} ${T.border} hover:bg-emerald-50`
                                  }`}
                                >
                                  <div className="font-medium">{dur}min</div>
                                  <div className="text-xs text-gray-500">{price}€</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Servizi Extra - Solo se disponibili */}
                        {(cfg.addons?.lightingEnabled || cfg.addons?.heatingEnabled) && (
                          <div>
                            <label className={`${ds.bodySm} block mb-2 font-medium`}>Servizi Extra</label>
                            <div className="flex flex-wrap gap-2">
                              {cfg.addons?.lightingEnabled && (
                                <label className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-all ${
                                  lighting ? `${T.primaryBg}/20 ${T.primaryBorder}` : `${T.cardBg} ${T.border} hover:${T.primaryBg}/10`
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={lighting}
                                    onChange={(e) => setLighting(e.target.checked)}
                                    className="rounded text-sm"
                                  />
                                  <span className="text-sm">Luci (+{cfg.addons?.lightingFee || 0}€)</span>
                                </label>
                              )}
                              {cfg.addons?.heatingEnabled && (
                                <label className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-all ${
                                  heating ? `${T.primaryBg}/20 ${T.primaryBorder}` : `${T.cardBg} ${T.border} hover:${T.primaryBg}/10`
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={heating}
                                    onChange={(e) => setHeating(e.target.checked)}
                                    className="rounded text-sm"
                                  />
                                  <span className="text-sm">Riscaldamento (+{cfg.addons?.heatingFee || 0}€)</span>
                                </label>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Giocatori */}
                        <div>
                          <label className={`${ds.bodySm} block mb-2 font-medium`}>
                            Giocatori ({1 + additionalPlayers.length}/4)
                          </label>
                          
                          {/* Organizzatore */}
                          <div className="mb-2">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-md ${T.cardBg} ${T.border}`}>
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span className="text-sm font-medium">{user?.displayName || user?.email || 'Tu'}</span>
                              <Badge variant="primary" size="xs" T={T}>Organizzatore</Badge>
                            </div>
                          </div>
                          
                          {/* Giocatori aggiuntivi */}
                          {additionalPlayers.length > 0 && (
                            <div className="space-y-1 mb-2">
                              {additionalPlayers.map((player) => (
                                <div key={player.id} className={`flex items-center gap-2 px-3 py-2 rounded-md ${T.cardBg} ${T.border}`}>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm flex-1">{player.name}</span>
                                  <button
                                    onClick={() => removePlayer(player.id)}
                                    className="text-red-500 hover:text-red-700 text-xs p-1"
                                    title="Rimuovi giocatore"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Aggiungi giocatore */}
                          {additionalPlayers.length < 3 && (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                                placeholder="Nome giocatore"
                                className={`flex-1 p-2 text-sm ${T.cardBg} ${T.border} rounded-md focus:outline-none focus:ring-1 ${T.primaryRing}`}
                              />
                              <button
                                onClick={addPlayer}
                                disabled={!newPlayerName.trim()}
                                className={`px-3 py-2 text-sm rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${T.primaryBg} ${T.primaryText}`}
                              >
                                Aggiungi
                              </button>
                            </div>
                          )}
                          
                          {additionalPlayers.length >= 3 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Numero massimo di giocatori raggiunto (4 totali)
                            </p>
                          )}
                        </div>

                        {/* Campi opzionali in una riga */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className={`${ds.bodySm} block mb-1 font-medium`}>Telefono</label>
                            <input
                              type="tel"
                              value={userPhone}
                              onChange={(e) => setUserPhone(e.target.value)}
                              placeholder="333 123 4567"
                              className={`w-full p-2 text-sm ${T.cardBg} ${T.border} rounded-md focus:outline-none focus:ring-1 ${T.primaryRing}`}
                            />
                          </div>
                          <div>
                            <label className={`${ds.bodySm} block mb-1 font-medium`}>Note</label>
                            <input
                              type="text"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Es: doppio misto"
                              className={`w-full p-2 text-sm ${T.cardBg} ${T.border} rounded-md focus:outline-none focus:ring-1 ${T.primaryRing}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Riepilogo compatto e CTA */}
                      <div className={`px-4 pb-4 border-t ${T.border}/50`}>
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Data:</span>
                              <span className="ml-1 font-medium">{new Date(selectedDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Ora:</span>
                              <span className="ml-1 font-medium">{selectedTime}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Durata:</span>
                              <span className="ml-1 font-medium">{duration}min</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Giocatori:</span>
                              <span className="ml-1 font-medium">{1 + additionalPlayers.length}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              {totalPrice}€
                            </div>
                            {(lighting || heating) && (
                              <div className="text-xs text-gray-500">
                                {lighting && 'Luci '}{heating && 'Riscald.'} inclusi
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={handleBooking}
                          disabled={isSubmitting || !user}
                          className={`w-full ${T.btnPrimary} text-center py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                        >
                          {isSubmitting 
                            ? 'Prenotazione in corso...' 
                            : user 
                              ? `Conferma Prenotazione - ${totalPrice}€` 
                              : 'Accedi per Prenotare'
                          }
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Modal storico prenotazioni passate */}
      {showPastBookings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className={`${ds.h4} flex items-center gap-2`}>
                <span>Storico Prenotazioni</span>
                <Badge variant="default" size="sm" T={T}>{pastUserBookings.length}</Badge>
              </h3>
              <button
                onClick={() => setShowPastBookings(false)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>
            
            {pastUserBookings.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                Non hai prenotazioni passate
              </p>
            ) : (
              <div className="space-y-2">
                {pastUserBookings.map((booking) => {
                  const court = courtsFromState.find(c => c.id === booking.courtId);
                  const bookingDate = new Date(`${booking.date}T${booking.time}:00`);
                  const isRecent = (new Date() - bookingDate) / (1000 * 60 * 60 * 24) <= 7; // Ultimi 7 giorni
                  
                  return (
                    <div 
                      key={booking.id} 
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-500 p-3 rounded-md cursor-pointer hover:shadow-md transition-all"
                      onClick={() => showBookingDetails(booking)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {court?.name || booking.courtName || 'Campo'}
                            </span>
                            <Badge variant="default" size="xs" T={T}>
                              {booking.players?.length || 1} giocatori
                            </Badge>
                            <Badge variant="default" size="xs" T={T}>Completata</Badge>
                            {isRecent && (
                              <Badge variant="warning" size="xs" T={T}>Recente</Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {bookingDate.toLocaleDateString('it-IT', { 
                              weekday: 'short', 
                              day: 'numeric', 
                              month: 'short',
                              year: 'numeric'
                            })} alle {booking.time} • {booking.duration}min • {booking.price}€
                          </div>
                          {booking.players && booking.players.length > 1 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Con: {booking.players.filter(p => p !== user.email && p !== user.displayName).slice(0, 3).join(', ')}
                              {booking.players.length > 4 && '...'}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 px-2 py-1">
                          {Math.ceil((new Date() - bookingDate) / (1000 * 60 * 60 * 24))} giorni fa
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowPastBookings(false)}
                className={`px-4 py-2 rounded-md transition-all ${T.primaryBg} ${T.primaryText}`}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal dettagli prenotazione */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className={`${ds.h4}`}>Dettagli Prenotazione</h3>
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Info principale */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-500 p-4 rounded-md">
                <h4 className={`${ds.h6} mb-2`}>{selectedBookingDetails.courtName}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Data:</span>
                    <div className="font-medium">
                      {new Date(selectedBookingDetails.date).toLocaleDateString('it-IT', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Orario:</span>
                    <div className="font-medium">{selectedBookingDetails.time}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Durata:</span>
                    <div className="font-medium">{selectedBookingDetails.duration} minuti</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Prezzo:</span>
                    <div className="font-medium text-emerald-600">{selectedBookingDetails.price}€</div>
                  </div>
                </div>
                
                {selectedBookingDetails.hoursUntil > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Mancano {selectedBookingDetails.hoursUntil} ore
                  </div>
                )}
              </div>

              {/* Giocatori */}
              {selectedBookingDetails.players && selectedBookingDetails.players.length > 0 && (
                <div>
                  <h5 className={`${ds.h6} mb-2`}>Giocatori ({selectedBookingDetails.players.length})</h5>
                  <div className="space-y-1">
                    {selectedBookingDetails.players.map((player, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-500 rounded-md">
                        <div className={`w-2 h-2 rounded-full ${
                          player === user?.email || player === user?.displayName 
                            ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-sm">{player}</span>
                        {(player === user?.email || player === user?.displayName) && (
                          <Badge variant="primary" size="xs" T={T}>Tu</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Servizi extra */}
              {(selectedBookingDetails.lighting || selectedBookingDetails.heating) && (
                <div>
                  <h5 className={`${ds.h6} mb-2`}>Servizi Extra</h5>
                  <div className="flex gap-2">
                    {selectedBookingDetails.lighting && (
                      <Badge variant="warning" size="sm" T={T}>Illuminazione</Badge>
                    )}
                    {selectedBookingDetails.heating && (
                      <Badge variant="info" size="sm" T={T}>Riscaldamento</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Campo features */}
              {selectedBookingDetails.courtFeatures && selectedBookingDetails.courtFeatures.length > 0 && (
                <div>
                  <h5 className={`${ds.h6} mb-2`}>Caratteristiche Campo</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedBookingDetails.courtFeatures.map((feature, index) => (
                      <Badge key={index} variant="default" size="xs" T={T}>{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Note */}
              {selectedBookingDetails.notes && (
                <div>
                  <h5 className={`${ds.h6} mb-2`}>Note</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedBookingDetails.notes}
                  </p>
                </div>
              )}

              {/* Contatto */}
              {selectedBookingDetails.userPhone && (
                <div>
                  <h5 className={`${ds.h6} mb-2`}>Contatto</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedBookingDetails.userPhone}
                  </p>
                </div>
              )}

              {/* Azioni */}
              <div className="flex gap-2 pt-2">
                {selectedBookingDetails.canCancel && selectedBookingDetails.hoursUntil > 0 && (
                  <button
                    onClick={() => {
                      handleCancelBooking(selectedBookingDetails.id);
                      setSelectedBookingDetails(null);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm transition-all"
                  >
                    Cancella Prenotazione
                  </button>
                )}
                <button
                  onClick={() => setSelectedBookingDetails(null)}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-500 py-2 px-4 rounded-md text-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating buttons for mobile booking confirmation - shown outside modals */}
      {selectedCourt && selectedDate && selectedTime && (
        <div className="lg:hidden fixed bottom-24 left-4 right-4 z-[99999]">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedTime('');
                setSelectedCourt(null);
                setLighting(false);
                setHeating(false);
                setUserPhone('');
                setNotes('');
                setAdditionalPlayers([]);
                setNewPlayerName('');
              }}
              className="flex-1 backdrop-blur-md bg-white/90 border border-gray-200/50 text-gray-700 py-3 px-4 rounded-xl font-medium text-sm transition-all shadow-lg hover:bg-white/95"
            >
              Annulla
            </button>
            <button
              onClick={handleBooking}
              disabled={isSubmitting || !user}
              className="flex-1 backdrop-blur-md bg-emerald-600/90 text-white py-3 px-4 rounded-xl font-medium text-sm transition-all shadow-lg hover:bg-emerald-600/95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? 'Prenotando...' 
                : user 
                  ? `Conferma ${totalPrice}€` 
                  : 'Accedi'
              }
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default BookingField;
