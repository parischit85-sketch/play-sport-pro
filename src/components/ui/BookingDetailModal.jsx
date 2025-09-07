// =============================================
// FILE: src/components/ui/BookingDetailModal.jsx
// =============================================
import React, { useState } from 'react';
import Modal from '@ui/Modal.jsx';
import Badge from '@ui/Badge.jsx';
import { BOOKING_CONFIG } from '@services/bookings.js';

export default function BookingDetailModal({ 
  booking, 
  isOpen, 
  onClose, 
  state, 
  T,
  onShare,
  onCancel,
  onEdit,
  onReview 
}) {
  const [isEditingPlayers, setIsEditingPlayers] = useState(false);
  const [editedPlayers, setEditedPlayers] = useState(booking?.players || []);
  const [newPlayerName, setNewPlayerName] = useState('');
  
  if (!booking) return null;

  // Usa i campi da state se disponibili, altrimenti da BOOKING_CONFIG
  const courts = state?.courts || BOOKING_CONFIG.courts;
  const court = courts?.find(c => c.id === booking.courtId);
  
  const bookingDate = new Date(booking.date);
  const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
  const now = new Date();
  
  const isToday = bookingDate.toDateString() === new Date().toDateString();
  const isTomorrow = bookingDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
  const isPast = bookingDateTime < now;
  const isUpcoming = bookingDateTime > now && bookingDateTime <= new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  // Calcola se la cancellazione è possibile (30 ore prima)
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
  const canCancel = hoursUntilBooking > 30;
  const canEdit = !isPast; // Può modificare solo se non è passata

  // Helper function per ottenere il nome visualizzabile di un giocatore
  const getPlayerDisplayName = (player) => {
    if (!player) return '';
    if (typeof player === 'string') return player;
    if (typeof player === 'object') {
      return player.name || player.email || '';
    }
    return String(player);
  };

  // Funzioni per l'editing
  const handleSaveChanges = () => {
    if (onEdit && editedPlayers !== booking.players) {
      onEdit({ ...booking, players: editedPlayers });
    }
    setIsEditingPlayers(false);
  };

  const handleCancelEdit = () => {
    setEditedPlayers(booking.players);
    setIsEditingPlayers(false);
  };

  const handleToggleEdit = () => {
    if (isEditingPlayers) {
      handleSaveChanges();
    } else {
      setIsEditingPlayers(true);
    }
  };

  let dateLabel;
  if (isPast) {
    dateLabel = 'Passata';
  } else if (isToday) {
    dateLabel = 'Oggi';
  } else if (isTomorrow) {
    dateLabel = 'Domani';
  } else {
    dateLabel = bookingDate.toLocaleDateString('it-IT', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  }

  // Calcola il tempo rimanente
  const timeUntilBooking = bookingDateTime - now;
  const hoursUntil = Math.floor(timeUntilBooking / (1000 * 60 * 60));
  const minutesUntil = Math.floor((timeUntilBooking % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Dettaglio Prenotazione"
      T={T}
      size="md"
    >
      <div className="space-y-4">
        {/* Header compatto */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🏟️</span>
              </div>
              <div>
                <h2 className="font-bold text-lg">{court?.name || `Campo ${booking.courtId}`}</h2>
                <div className="text-white/80 text-sm">{dateLabel} • {booking.time}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">€{booking.price || 'N/A'}</div>
              <div className="text-white/80 text-xs">{booking.duration || 60}min</div>
            </div>
          </div>
          
          {/* Status badges compatti */}
          <div className="flex flex-wrap gap-1">
            {isPast && <Badge variant="secondary" size="xs" T={T}>Completata</Badge>}
            {isToday && !isPast && <Badge variant="warning" size="xs" T={T}>Oggi</Badge>}
            {isUpcoming && <Badge variant="success" size="xs" T={T}>Prossima</Badge>}
            {booking.confirmed && <Badge variant="primary" size="xs" T={T}>Confermata</Badge>}
          </div>
        </div>

        {/* Informazioni essenziali in grid compatta */}
        <div className="grid grid-cols-2 gap-3">
          {/* Data e tempo */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">📅 DATA E ORARIO</div>
            <div className="font-medium text-sm">{dateLabel}</div>
            <div className="text-sm text-gray-600">{booking.time} ({booking.duration || 60}min)</div>
            {!isPast && timeUntilBooking > 0 && (
              <div className="text-xs text-blue-600 mt-1">
                {hoursUntil > 0 && `${hoursUntil}h `}{minutesUntil}min rimanenti
              </div>
            )}
          </div>

          {/* Campo */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">🏟️ CAMPO</div>
            <div className="font-medium text-sm">{court?.name || `Campo ${booking.courtId}`}</div>
            {court?.features && (
              <div className="text-xs text-gray-600">{court.features.join(' • ')}</div>
            )}
          </div>
        </div>

        {/* Giocatori - Con stile della conferma prenotazione quando in editing */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-3">👥 GIOCATORI ({booking.players?.length || 1}/4)</div>
          
          <div className="space-y-2">
            {/* Organizzatore - Sempre visibile con stile blu */}
            <div className="p-3 bg-blue-50 rounded-xl border-l-4 border-blue-500">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">👑</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {(() => {
                      const currentPlayers = isEditingPlayers ? editedPlayers : booking.players;
                      if (currentPlayers && currentPlayers[0]) {
                        return getPlayerDisplayName(currentPlayers[0]);
                      }
                      return booking.userName || booking.userEmail || 'Organizzatore';
                    })()}
                  </div>
                  <div className="text-xs text-blue-600 font-medium">
                    Organizzatore • Giocatore 1
                    {booking.userEmail && (
                      <span className="block text-blue-600 mt-0.5">{booking.userEmail}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Altri giocatori */}
            {isEditingPlayers ? (
              /* Modalità editing - Stile come conferma prenotazione */
              <div className="space-y-2">
                {/* Giocatori esistenti (modificabili) */}
                {editedPlayers && editedPlayers.length > 1 && 
                  editedPlayers.slice(1).map((participant, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">👤</span>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={getPlayerDisplayName(participant)}
                          onChange={(e) => {
                            const newPlayers = [...editedPlayers];
                            if (typeof participant === 'object') {
                              newPlayers[index + 1] = { ...participant, name: e.target.value };
                            } else {
                              newPlayers[index + 1] = e.target.value;
                            }
                            setEditedPlayers(newPlayers);
                          }}
                          className="w-full text-sm font-medium text-gray-900 bg-transparent border-b border-gray-300 focus:border-green-500 outline-none pb-1"
                          placeholder="Nome giocatore"
                        />
                        <div className="text-xs text-gray-500">Giocatore {index + 2}</div>
                      </div>
                      <button
                        onClick={() => {
                          const newPlayers = [...editedPlayers];
                          newPlayers.splice(index + 1, 1);
                          setEditedPlayers(newPlayers);
                        }}
                        className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <span className="text-sm">✕</span>
                      </button>
                    </div>
                  ))
                }
                
                {/* Aggiungi nuovo giocatore */}
                {editedPlayers.length < 4 && (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const newPlayers = editedPlayers ? [...editedPlayers] : [booking.userName || booking.userEmail || 'Organizzatore'];
                          if (newPlayerName.trim()) {
                            newPlayers.push({ name: newPlayerName.trim(), id: Date.now() });
                            setEditedPlayers(newPlayers);
                            setNewPlayerName('');
                          }
                        }
                      }}
                      placeholder="Nome nuovo giocatore"
                      className="flex-1 p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const newPlayers = editedPlayers ? [...editedPlayers] : [booking.userName || booking.userEmail || 'Organizzatore'];
                        if (newPlayerName.trim()) {
                          newPlayers.push({ name: newPlayerName.trim(), id: Date.now() });
                          setEditedPlayers(newPlayers);
                          setNewPlayerName('');
                        }
                      }}
                      disabled={!newPlayerName.trim()}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                      Aggiungi
                    </button>
                  </div>
                )}
                
                {/* Pulsanti di controllo editing */}
                <div className="flex gap-3 mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={handleSaveChanges}
                    className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    💾 Salva Modifiche
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-500 text-white py-2.5 px-4 rounded-xl text-sm font-medium hover:bg-gray-600 transition-colors"
                  >
                    ❌ Annulla
                  </button>
                </div>
              </div>
            ) : (
              /* Modalità visualizzazione normale */
              <>
                {booking.players && booking.players.length > 1 && 
                  booking.players.slice(1).map((participant, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white rounded px-2 py-1 border">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{index + 2}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {getPlayerDisplayName(participant)}
                        </div>
                        <div className="text-xs text-gray-500">Giocatore {index + 2}</div>
                      </div>
                    </div>
                  ))
                }

                {/* Slot liberi - Solo in modalità visualizzazione */}
                {(() => {
                  const currentPlayers = booking.players?.length || 1;
                  const slotsLiberi = 4 - currentPlayers;
                  
                  return slotsLiberi > 0 && Array.from({ length: slotsLiberi }).map((_, index) => (
                    <div key={`empty-${index}`} className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1 border-dashed border">
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">?</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 italic">Slot libero</div>
                        <div className="text-xs text-gray-400">Giocatore {currentPlayers + index + 1}</div>
                      </div>
                    </div>
                  ));
                })()}
              </>
            )}
          </div>
        </div>

        {/* Prezzo */}
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-xs text-green-700 mb-1">💰 PREZZO</div>
          <div className="flex justify-between items-center">
            <div className="font-bold text-green-900">€{booking.price || 'N/A'}</div>
            {booking.confirmed ? (
              <span className="text-green-600">✅ Pagato</span>
            ) : (
              <span className="text-gray-600">💳 Da confermare</span>
            )}
          </div>
        </div>

        {/* Note compatte (solo se presenti) */}
        {booking.notes && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-700 font-medium mb-1">📝 NOTE</div>
            <p className="text-sm text-gray-700">{booking.notes}</p>
          </div>
        )}

        {/* Informazioni essenziali compatte */}
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="text-xs text-yellow-800 font-medium mb-1">ℹ️ PROMEMORIA</div>
          <div className="text-xs text-gray-700 space-y-0.5">
            <div>• Arriva 10 min prima</div>
            <div>• Porta racchette e palline</div>
            {court?.phone && <div>• Tel: <span className="font-medium">{court.phone}</span></div>}
          </div>
        </div>

        {/* Azioni compatte */}
        <div className="space-y-2">
          {!isPast && canEdit && (
            <button 
              onClick={handleToggleEdit}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
            >
              {isEditingPlayers ? '💾 Salva Modifiche' : '✏️ Modifica Giocatori'}
            </button>
          )}
          
          {/* Messaggio se non si può modificare */}
          {!isPast && !canEdit && (
            <div className="w-full bg-gray-100 text-gray-600 py-2.5 px-3 rounded-lg text-sm text-center">
              ⏰ Modifiche disponibili fino a 30 ore prima
            </div>
          )}
          
          <div className="flex gap-2">
            {!isPast ? (
              <>
                <button 
                  onClick={() => onShare && onShare(booking)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  📧 Condividi
                </button>
                {canCancel ? (
                  <button 
                    onClick={() => onCancel && onCancel(booking)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    🚫 Cancella
                  </button>
                ) : (
                  <div className="flex-1 bg-gray-300 text-gray-600 py-2.5 px-3 rounded-lg text-sm text-center">
                    ⏰ Non cancellabile (meno di 30h)
                  </div>
                )}
              </>
            ) : (
              <button 
                onClick={() => onReview && onReview(booking)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
              >
                ⭐ Lascia Recensione
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
