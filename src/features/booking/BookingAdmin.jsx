import React, { useState, useEffect } from 'react';
import Section from '@ui/Section.jsx';
import Badge from '@ui/Badge.jsx';
import Modal from '@ui/Modal.jsx';
import { createDSClasses } from '@lib/design-system.js';
import {
  BOOKING_CONFIG,
  getTimeSlots,
  getAvailableDays,
  isSlotAvailable,
  calculatePrice,
  validateBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  loadBookings,
  saveBookings,
  getAdminBookings,
  BOOKING_STATUS
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
  }, [bookings, selectedDate, statusFilter, courtFilter]);

  const loadBookingsData = () => {
    const allBookings = getAdminBookings();
    setBookings(allBookings);
  };

  const applyFilters = () => {
    let filtered = [...bookings];
    
    if (selectedDate) {
      filtered = filtered.filter(b => b.date === selectedDate);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    if (courtFilter !== 'all') {
      filtered = filtered.filter(b => b.courtId === courtFilter);
    }
    
    // Ordina per data e ora
    filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
    
    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Sei sicuro di voler cancellare questa prenotazione?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const cancelled = cancelBooking(bookingId, user);
      if (cancelled) {
        loadBookingsData();
        setMessage({ type: 'success', text: 'Prenotazione cancellata con successo' });
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
        setMessage({ type: 'success', text: 'Prenotazione aggiornata con successo' });
      } else {
        setMessage({ type: 'error', text: 'Errore nell\'aggiornamento' });
      }
    } catch (error) {
      console.error('Errore aggiornamento:', error);
      setMessage({ type: 'error', text: 'Errore durante l\'aggiornamento' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      [BOOKING_STATUS.CONFIRMED]: 'success',
      [BOOKING_STATUS.CANCELLED]: 'danger',
      [BOOKING_STATUS.PENDING]: 'warning'
    };
    
    const labels = {
      [BOOKING_STATUS.CONFIRMED]: 'Confermata',
      [BOOKING_STATUS.CANCELLED]: 'Cancellata',
      [BOOKING_STATUS.PENDING]: 'In attesa'
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
        <button
          onClick={() => setShowCreateModal(true)}
          className={`${T.btnPrimary} px-4 py-2`}
        >
          Nuova Prenotazione
        </button>
      </div>

      {/* Messaggio di stato */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'error' 
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200'
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border border-emerald-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Filtri */}
      <Section title="Filtri" variant="minimal" T={T}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Filtro Data */}
          <div>
            <label className={`${ds.bodySm} block mb-2`}>Data</label>
            <select
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
            <label className={`${ds.bodySm} block mb-2`}>Stato</label>
            <select
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
            <label className={`${ds.bodySm} block mb-2`}>Campo</label>
            <select
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
          <div className="text-center py-8 text-gray-500">
            Nessuna prenotazione trovata
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className={`${T.cardBg} ${T.border} ${T.borderMd} p-4`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Info Principali */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`${ds.h5}`}>{booking.courtName}</h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Data:</span>
                        <div className="font-medium">
                          {new Date(booking.date).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Orario:</span>
                        <div className="font-medium">{booking.time} ({booking.duration}min)</div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Cliente:</span>
                        <div className="font-medium">{booking.bookedBy}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Prezzo:</span>
                        <div className="font-medium text-emerald-600 dark:text-emerald-400">
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
                              <span className="text-gray-500 dark:text-gray-400">Email:</span>
                              <div>{booking.userEmail}</div>
                            </div>
                          )}
                          {booking.userPhone && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Telefono:</span>
                              <div>{booking.userPhone}</div>
                            </div>
                          )}
                          {booking.notes && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Note:</span>
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
                          <Badge variant="warning" size="xs" T={T}>Illuminazione</Badge>
                        )}
                        {booking.heating && (
                          <Badge variant="info" size="xs" T={T}>Riscaldamento</Badge>
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
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
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
      time: '',
      duration: 60,
      lighting: false,
      heating: false,
      bookedBy: '',
      userEmail: '',
      userPhone: '',
      notes: '',
      status: BOOKING_STATUS.CONFIRMED
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const selectedCourt = BOOKING_CONFIG.courts.find(c => c.id === formData.courtId);
  const totalPrice = selectedCourt ? calculatePrice(selectedCourt, formData.duration, formData.lighting, formData.heating) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={booking ? 'Modifica Prenotazione' : 'Nuova Prenotazione'}
      size="lg"
      T={T}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Campo */}
          <div>
            <label className={`${ds.bodySm} block mb-1`}>Campo</label>
            <select
              value={formData.courtId}
              onChange={(e) => setFormData({...formData, courtId: e.target.value})}
              className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing}`}
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
            <label className={`${ds.bodySm} block mb-1`}>Data</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing}`}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Orario */}
          <div>
            <label className={`${ds.bodySm} block mb-1`}>Orario</label>
            <select
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing}`}
              required
            >
              <option value="">Seleziona orario</option>
              {getTimeSlots().map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* Durata */}
          <div>
            <label className={`${ds.bodySm} block mb-1`}>Durata</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
              className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing}`}
            >
              {BOOKING_CONFIG.rules.allowedDurations.map((dur) => (
                <option key={dur} value={dur}>
                  {dur} minuti
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cliente */}
        <div>
          <label className={`${ds.bodySm} block mb-1`}>Nome Cliente</label>
          <input
            type="text"
            value={formData.bookedBy}
            onChange={(e) => setFormData({...formData, bookedBy: e.target.value})}
            className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing}`}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className={`${ds.bodySm} block mb-1`}>Email</label>
            <input
              type="email"
              value={formData.userEmail}
              onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
              className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing}`}
            />
          </div>

          {/* Telefono */}
          <div>
            <label className={`${ds.bodySm} block mb-1`}>Telefono</label>
            <input
              type="tel"
              value={formData.userPhone}
              onChange={(e) => setFormData({...formData, userPhone: e.target.value})}
              className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing}`}
            />
          </div>
        </div>

        {/* Servizi Extra */}
        {selectedCourt && (
          <div>
            <label className={`${ds.bodySm} block mb-2`}>Servizi Extra</label>
            <div className="space-y-2">
              {selectedCourt.hasLighting && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.lighting}
                    onChange={(e) => setFormData({...formData, lighting: e.target.checked})}
                  />
                  <span>Illuminazione (+{BOOKING_CONFIG.pricing.lighting}€)</span>
                </label>
              )}
              {selectedCourt.hasHeating && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.heating}
                    onChange={(e) => setFormData({...formData, heating: e.target.checked})}
                  />
                  <span>Riscaldamento (+{BOOKING_CONFIG.pricing.heating}€)</span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Note */}
        <div>
          <label className={`${ds.bodySm} block mb-1`}>Note</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={3}
            className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 ${T.primaryRing}`}
          />
        </div>

        {/* Prezzo */}
        {selectedCourt && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center">
              <span className={ds.bodySm}>Prezzo Totale:</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {totalPrice}€
              </span>
            </div>
          </div>
        )}

        {/* Azioni */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`${T.btnSecondary} px-4 py-2 flex-1`}
          >
            Annulla
          </button>
          <button
            type="submit"
            className={`${T.btnPrimary} px-4 py-2 flex-1`}
          >
            {booking ? 'Aggiorna' : 'Crea'} Prenotazione
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default BookingAdmin;
