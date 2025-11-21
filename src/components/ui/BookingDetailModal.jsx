import React, { useState, useEffect } from 'react';
import Modal from '@ui/Modal.jsx';
import { BOOKING_CONFIG } from '@services/bookings.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@services/firebase.js';

// Import new sub-components
import ClubInfoCard from './booking-modal/ClubInfoCard';
import BookingHeader from './booking-modal/BookingHeader';
import PlayersList from './booking-modal/PlayersList';
import ActionButtons from './booking-modal/ActionButtons';

export default function BookingDetailModal({
  booking,
  isOpen,
  onClose,
  state,
  T,
  onShare,
  onCancel,
  onEdit,
  onReview,
}) {
  const [isEditingPlayers, setIsEditingPlayers] = useState(false);
  const [editedPlayers, setEditedPlayers] = useState(booking?.players || []);
  const [clubInfo, setClubInfo] = useState(null);

  // Load club info
  useEffect(() => {
    const loadClubInfo = async () => {
      if (booking?.clubId) {
        try {
          const clubDoc = await getDoc(doc(db, 'clubs', booking.clubId));
          if (clubDoc.exists()) {
            setClubInfo({ id: clubDoc.id, ...clubDoc.data() });
          }
        } catch (error) {
          console.error('Error loading club info:', error);
        }
      }
    };
    loadClubInfo();
  }, [booking?.clubId]);

  // Reset edited players when booking changes or modal opens
  useEffect(() => {
    if (booking?.players) {
      setEditedPlayers(booking.players);
    }
  }, [booking]);

  if (!booking) return null;

  // Determine booking type
  const isLessonBooking =
    booking.instructorId || booking.isLessonBooking || booking.type === 'lesson';

  // Get court info
  const courts = state?.courts || BOOKING_CONFIG.courts;
  const court = courts?.find((c) => c.id === booking.courtId);

  // Date calculations
  const bookingDate = new Date(booking.date);
  const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
  const now = new Date();

  const isToday = bookingDate.toDateString() === new Date().toDateString();
  const isTomorrow = bookingDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
  const isPast = bookingDateTime < now;
  const isUpcoming =
    bookingDateTime > now && bookingDateTime <= new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Cancellation/Edit rules
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
  const canCancel = hoursUntilBooking > 30;
  const canEdit = !isPast;

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
      year: 'numeric',
    });
  }

  // Handlers
  const handleSaveChanges = () => {
    if (onEdit) {
      // Pass the rich player objects. The service layer should handle
      // extracting UIDs or names as needed for the backend.
      const bookingToUpdate = { ...booking, players: editedPlayers };
      onEdit(bookingToUpdate);
    }
    setIsEditingPlayers(false);
  };

  const handleCancelEdit = () => {
    setEditedPlayers(booking.players || []);
    setIsEditingPlayers(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dettaglio Prenotazione" T={T} size="md">
      <div className="space-y-4">
        {/* Club Info */}
        <ClubInfoCard clubInfo={clubInfo} />

        {/* Header */}
        <BookingHeader
          booking={booking}
          court={court}
          isLessonBooking={isLessonBooking}
          dateLabel={dateLabel}
          isPast={isPast}
          isToday={isToday}
          isUpcoming={isUpcoming}
          T={T}
        />

        {/* Players List */}
        <PlayersList
          booking={booking}
          isLessonBooking={isLessonBooking}
          isEditingPlayers={isEditingPlayers}
          editedPlayers={editedPlayers}
          setEditedPlayers={setEditedPlayers}
          onToggleEdit={() => setIsEditingPlayers(!isEditingPlayers)}
        />

        {/* Action Buttons */}
        <ActionButtons
          booking={booking}
          isPast={isPast}
          canEdit={canEdit}
          isLessonBooking={isLessonBooking}
          isEditing={isEditingPlayers}
          onToggleEdit={() => setIsEditingPlayers(true)}
          onSave={handleSaveChanges}
          onCancelEdit={handleCancelEdit}
          onShare={onShare}
          onCancelBooking={onCancel}
          onReview={onReview}
          canCancel={canCancel}
          clubInfo={clubInfo}
        />
      </div>
    </Modal>
  );
}
