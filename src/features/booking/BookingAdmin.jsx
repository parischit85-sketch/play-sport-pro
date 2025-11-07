import React, { useState, useEffect, useCallback } from 'react';
import Section from '@ui/Section.jsx';
import Badge from '@ui/Badge.jsx';
import Modal from '@ui/Modal.jsx';
import { createDSClasses } from '@lib/design-system.js';
import {
  BOOKING_CONFIG,
  getAvailableDays,
  isSlotAvailable,
  calculatePrice,
  calculateLessonPrice,
  validateBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  loadBookings,
  saveBookings,
  getAdminBookings,
  BOOKING_STATUS,
} from '@services/bookings.js';

function BookingAdmin({ user, T }) {
  const ds = createDSClasses(T);

  // Stato dati
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courtFilter, setCourtFilter] = useState('all');

  // Stato UI
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Carica prenotazioni
  useEffect(() => {
    loadBookingsData();
  }, []);

  // Filtra prenotazioni quando cambiano i filtri
  useEffect(() => {
    applyFilters();
  }, [bookings, selectedDate, statusFilter, courtFilter, applyFilters]);

  const loadBookingsData = () => {
    const allBookings = getAdminBookings();
    setBookings(allBookings);
  };

  const applyFilters = useCallback(() => {
    let filtered = [...bookings];

    if (selectedDate) {
      filtered = filtered.filter((b) => b.date === selectedDate);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    if (courtFilter !== 'all') {
      filtered = filtered.filter((b) => b.courtId === courtFilter);
    }

    // Ordina per data e ora
    filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    setFilteredBookings(filtered);
  }, [bookings, selectedDate, statusFilter, courtFilter]);

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Sei sicuro di voler cancellare questa prenotazione?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const cancelled = cancelBooking(bookingId, user);
      if (cancelled) {
        loadBookingsData();
        setMessage({
          type: 'success',
          text: 'Prenotazione cancellata con successo',
        });
      } else {
        setMessage({ type: 'error', text: 'Errore nella cancellazione' });
      }
    } catch (error) {
      console.error('Errore cancellazione:', error);
      setMessage({ type: 'error', text: 'Errore durante la cancellazione' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBooking = async (bookingId, updates) => {
    setIsSubmitting(true);
    try {
      const updated = updateBooking(bookingId, updates, user);
      if (updated) {
        loadBookingsData();
        setEditingBooking(null);
        setMessage({
          type: 'success',
          text: 'Prenotazione aggiornata con successo',
        });
      } else {
        setMessage({ type: 'error', text: "Errore nell'aggiornamento" });
      }
    } catch (error) {
      console.error('Errore aggiornamento:', error);
      setMessage({ type: 'error', text: "Errore durante l'aggiornamento" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      [BOOKING_STATUS.CONFIRMED]: 'success',
      [BOOKING_STATUS.CANCELLED]: 'danger',
      [BOOKING_STATUS.PENDING]: 'warning',
    };

    const labels = {
      [BOOKING_STATUS.CONFIRMED]: 'Confermata',
      [BOOKING_STATUS.CANCELLED]: 'Cancellata',
      [BOOKING_STATUS.PENDING]: 'In attesa',
    };

    return (
      <Badge variant={variants[status]} size="sm" T={T}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`${ds.h3} mb-2`}>Gestione Prenotazioni</h1>
          <p className={ds.bodySm}>Visualizza e gestisci tutte le prenotazioni campi</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className={`${T.btnPrimary} px-4 py-2`}>
          Nuova Prenotazione
        </button>
      </div>

      {/* Messaggio di stato */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'error'
              ? `${ds.error} bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800`
              : `${ds.success} bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800`
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filtri */}
      <Section title="Filtri" variant="minimal" T={T}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Filtro Data */}
          <div>
            <label htmlFor="filter-date" className={`${ds.bodySm} block mb-2`}>Data</label>
            <select
              id="filter-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing}`}
            >
              <option value="">Tutte le date</option>
              {getAvailableDays().map((day) => (
                <option key={day.date} value={day.date}>
                  {day.label} ({day.date})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Stato */}
          <div>
            <label htmlFor="filter-status" className={`${ds.bodySm} block mb-2`}>Stato</label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing}`}
            >
              <option value="all">Tutti gli stati</option>
              <option value={BOOKING_STATUS.CONFIRMED}>Confermate</option>
              <option value={BOOKING_STATUS.CANCELLED}>Cancellate</option>
              <option value={BOOKING_STATUS.PENDING}>In attesa</option>
            </select>
          </div>

          {/* Filtro Campo */}
          <div>
            <label htmlFor="filter-court" className={`${ds.bodySm} block mb-2`}>Campo</label>
            <select
              id="filter-court"
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing}`}
            >
              <option value="all">Tutti i campi</option>
              {BOOKING_CONFIG.courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* Lista Prenotazioni */}
      <Section title={`Prenotazioni (${filteredBookings.length})`} variant="minimal" T={T}>
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nessuna prenotazione trovata</div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className={`${T.cardBg} ${T.border} ${T.borderMd} p-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Info Principali */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`${ds.h5}`}>{booking.courtName}</h3>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Data:</span>
                        <div className="font-medium">
                          {new Date(booking.date).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Orario:</span>
                        <div className="font-medium">
                          {booking.time} ({booking.duration}min)
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Cliente:</span>
                        <div className="font-medium">{booking.bookedBy}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Prezzo:</span>
                        <div className={`font-medium ${ds.textAccent}`}>
                          {booking.price}€
                        </div>
                      </div>
                    </div>

                    {/* Dettagli Aggiuntivi */}
                    {(booking.userEmail || booking.userPhone || booking.notes) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          {booking.userEmail && (
                            <div>
                              <span className="text-gray-400">Email:</span>
                              <div>{booking.userEmail}</div>
                            </div>
                          )}
                          {booking.userPhone && (
                            <div>
                              <span className="text-gray-400">Telefono:</span>
                              <div>{booking.userPhone}</div>
                            </div>
                          )}
                          {booking.notes && (
                            <div>
                              <span className="text-gray-400">Note:</span>
                              <div>{booking.notes}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Servizi Extra */}
                    {(booking.lighting || booking.heating) && (
                      <div className="flex gap-2 mt-2">
                        {booking.lighting && (
                          <Badge variant="warning" size="xs" T={T}>
                            Illuminazione
                          </Badge>
                        )}
                        {booking.heating && (
                          <Badge variant="info" size="xs" T={T}>
                            Riscaldamento
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Azioni */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingBooking(booking)}
                      className={`${T.btnSecondary} px-3 py-1 text-sm`}
                      disabled={isSubmitting}
                    >
                      Modifica
                    </button>
                    {booking.status === BOOKING_STATUS.CONFIRMED && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors dark:bg-red-900/20 dark:text-red-200 dark:hover:bg-red-800"
                        disabled={isSubmitting}
                      >
                        Cancella
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Modal Creazione/Modifica */}
      {(showCreateModal || editingBooking) && (
        <BookingModal
          booking={editingBooking}
          isOpen={true}
          onClose={() => {
            setShowCreateModal(false);
            setEditingBooking(null);
          }}
          onSave={(bookingData) => {
            if (editingBooking) {
              handleUpdateBooking(editingBooking.id, bookingData);
            } else {
              // Implementa creazione manuale
              // TODO: Implementare logica di creazione manuale
            }
          }}
          T={T}
          ds={ds}
        />
      )}
    </div>
  );
}

// Modal per creazione/modifica prenotazioni
function BookingModal({ booking, isOpen, onClose, onSave, T, ds }) {
  const [formData, setFormData] = useState(
    booking || {
      courtId: '',
      date: '',
      time: '08:00',
      duration: 60,
      lighting: false,
      heating: false,
      bookedBy: '',
      userEmail: '',
      userPhone: '',
      notes: '',
      isLessonBooking: false,
      participants: 1,
      status: BOOKING_STATUS.CONFIRMED,
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Helper per estrarre ore e minuti in modo sicuro
  const getHour = () => {
    const parts = (formData.time || '08:00').split(':');
    return parts[0] || '08';
  };

  const getMinute = () => {
    const parts = (formData.time || '08:00').split(':');
    return parts[1] || '00';
  };

  const selectedCourt = BOOKING_CONFIG.courts.find((c) => c.id === formData.courtId);
  const courtPrice = selectedCourt
    ? calculatePrice(selectedCourt, formData.duration, formData.lighting, formData.heating)
    : 0;
  // Lezione: calculateLessonPrice restituisce già il totale della lezione
  // Recupera eventuale instructor legato (non abbiamo elenco qui: placeholder per futura integrazione)
  // In questo contesto potremmo avere booking.instructorId; per creazione non è ancora selezionato: mantenere null
  const relatedInstructor = null; // TODO: collegare a lista istruttori se disponibile in admin
  const lessonPrice = formData.isLessonBooking
    ? calculateLessonPrice({
        duration: formData.duration,
        participants: formData.participants,
        lighting: formData.lighting,
        heating: formData.heating,
        court: selectedCourt,
        instructor: relatedInstructor,
      })
    : 0;
  const totalPrice = formData.isLessonBooking ? lessonPrice : courtPrice;
  const perParticipant = formData.isLessonBooking
    ? lessonPrice && formData.participants
      ? lessonPrice / Math.max(1, formData.participants)
      : null
    : totalPrice
      ? totalPrice / 4
      : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={booking ? 'Modifica Prenotazione' : 'Nuova Prenotazione'}
      size="lg"
      T={T}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sezione: Informazioni Prenotazione */}
        <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
          <h4 className={`${ds.h6} mb-4 flex items-center gap-2`}>
            <svg className={`w-5 h-5 ${ds.info}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Informazioni Prenotazione
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Campo */}
            <div>
              <label className={`${ds.bodySm} block mb-2 font-medium`}>Campo</label>
              <select
                value={formData.courtId}
                onChange={(e) => setFormData({ ...formData, courtId: e.target.value })}
                className={`w-full p-3 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing} rounded-lg`}
                required
              >
                <option value="">Seleziona campo</option>
                {BOOKING_CONFIG.courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div>
              <label className={`${ds.bodySm} block mb-2 font-medium`}>Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full p-3 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing} rounded-lg`}
                required
              />
            </div>

            {/* Orario */}
            <div>
              <label className={`${ds.bodySm} block mb-2 font-medium`}>Orario</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`text-xs ${T.subtext} mb-1 block`}>Ora</label>
                  <select
                    value={getHour()}
                    onChange={(e) => {
                      const hour = e.target.value;
                      const minute = getMinute();
                      setFormData({ ...formData, time: `${hour}:${minute}` });
                    }}
                    className={`w-full p-3 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing} rounded-lg`}
                    required
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = String(i).padStart(2, '0');
                      return (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className={`text-xs ${T.subtext} mb-1 block`}>Minuti</label>
                  <select
                    value={getMinute()}
                    onChange={(e) => {
                      const hour = getHour();
                      const minute = e.target.value;
                      setFormData({ ...formData, time: `${hour}:${minute}` });
                    }}
                    className={`w-full p-3 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing} rounded-lg`}
                    required
                  >
                    <option value="00">00</option>
                    <option value="30">30</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Durata */}
            <div>
              <label className={`${ds.bodySm} block mb-2 font-medium`}>Durata</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className={`w-full p-3 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing} rounded-lg`}
              >
                {BOOKING_CONFIG.rules.allowedDurations.map((dur) => (
                  <option key={dur} value={dur}>
                    {dur} minuti
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo prenotazione */}
          <div className="mt-4">
            <label className={`${ds.bodySm} block mb-2 font-medium`}>Tipo Prenotazione</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="bookingType"
                  value="court"
                  checked={!formData.isLessonBooking}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isLessonBooking: e.target.value === 'lesson',
                    })
                  }
                  className={`${ds.info} focus:ring-blue-500`}
                />
                <span className={ds.bodySm}>Campo</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="bookingType"
                  value="lesson"
                  checked={formData.isLessonBooking}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isLessonBooking: e.target.value === 'lesson',
                    })
                  }
                  className={`${ds.info} focus:ring-blue-500`}
                />
                <span className={ds.bodySm}>Lezione</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sezione: Dettagli Cliente */}
        <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
          <h4 className={`${ds.h6} mb-4 flex items-center gap-2`}>
            <svg className={`w-5 h-5 ${ds.success}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Dettagli Cliente
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cliente */}
            <div>
              <label className={`${ds.bodySm} block mb-2 font-medium`}>Nome Cliente</label>
              <input
                type="text"
                value={formData.bookedBy}
                onChange={(e) => setFormData({ ...formData, bookedBy: e.target.value })}
                className={`w-full p-3 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing} rounded-lg`}
                placeholder="Nome e cognome"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className={`${ds.bodySm} block mb-2 font-medium`}>Email</label>
              <input
                type="email"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                className={`w-full p-3 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing} rounded-lg`}
                placeholder="cliente@email.com"
              />
            </div>

            {/* Telefono */}
            <div>
              <label className={`${ds.bodySm} block mb-2 font-medium`}>Telefono</label>
              <input
                type="tel"
                value={formData.userPhone}
                onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                className={`w-full p-3 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing} rounded-lg`}
                placeholder="+39 123 456 7890"
              />
            </div>

            {/* Partecipanti (solo per lezioni) */}
            {formData.isLessonBooking && (
              <div>
                <label className={`${ds.bodySm} block mb-2 font-medium`}>Partecipanti</label>
                <select
                  value={formData.participants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      participants: parseInt(e.target.value),
                    })
                  }
                  className={`w-full p-3 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing} rounded-lg`}
                >
                  {[1, 2, 3, 4].map((p) => (
                    <option key={p} value={p}>
                      {p} {p === 1 ? 'partecipante' : 'partecipanti'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Sezione: Extra e Opzioni */}
        {selectedCourt && (
          <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
            <h4 className={`${ds.h6} mb-4 flex items-center gap-2`}>
              <svg className={`w-5 h-5 ${ds.info}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Extra e Opzioni
            </h4>

            <div className="space-y-3">
              {selectedCourt.hasLighting && (
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.lighting}
                    onChange={(e) => setFormData({ ...formData, lighting: e.target.checked })}
                    className={`w-4 h-4 ${ds.info} bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600`}
                  />
                  <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 ${ds.warning}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className={ds.bodySm}>Illuminazione (+{BOOKING_CONFIG.pricing.lighting}€)</span>
                  </div>
                </label>
              )}
              {selectedCourt.hasHeating && (
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.heating}
                    onChange={(e) => setFormData({ ...formData, heating: e.target.checked })}
                    className={`w-4 h-4 ${ds.info} bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600`}
                  />
                  <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 ${ds.warning}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                    </svg>
                    <span className={ds.bodySm}>Riscaldamento (+{BOOKING_CONFIG.pricing.heating}€)</span>
                  </div>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Sezione: Note */}
        <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
          <h4 className={`${ds.h6} mb-4 flex items-center gap-2`}>
            <svg className={`w-5 h-5 ${ds.warning}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Note
          </h4>

          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className={`w-full p-3 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing} rounded-lg resize-none`}
            placeholder="Aggiungi eventuali note per questa prenotazione..."
          />
        </div>

        {/* Sezione: Riepilogo Prezzo */}
        {selectedCourt && (
          <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
            <h4 className={`${ds.h6} mb-4 flex items-center gap-2`}>
              <svg className={`w-5 h-5 ${ds.success}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Riepilogo Prezzo
            </h4>

            <div className={`${ds.bgSecondary} rounded-lg p-4 border ${T.border}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`${ds.bodySm} font-medium`}>
                  {formData.isLessonBooking ? 'Totale Lezione' : 'Prezzo Campo'}
                </span>
                <span className={`text-2xl font-bold ${ds.textAccent}`}>
                  {totalPrice}€
                </span>
              </div>

              {perParticipant != null && (
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    {formData.isLessonBooking ? 'Costo per partecipante:' : 'Costo per giocatore (su 4):'}
                  </span>
                  <span className="font-medium">{perParticipant.toFixed(2)}€</span>
                </div>
              )}

              {(formData.lighting || formData.heating) && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    {formData.lighting && (
                      <div className="flex justify-between">
                        <span>Illuminazione:</span>
                        <span>+{BOOKING_CONFIG.pricing.lighting}€</span>
                      </div>
                    )}
                    {formData.heating && (
                      <div className="flex justify-between">
                        <span>Riscaldamento:</span>
                        <span>+{BOOKING_CONFIG.pricing.heating}€</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Azioni */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onClose} className={`${T.btnSecondary} px-6 py-3 flex-1 rounded-lg font-medium`}>
            Annulla
          </button>
          <button type="submit" className={`${T.btnPrimary} px-6 py-3 flex-1 rounded-lg font-medium`}>
            {booking ? 'Aggiorna' : 'Crea'} Prenotazione
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default BookingAdmin;
