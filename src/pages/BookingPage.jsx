// =============================================
// FILE: src/pages/BookingPage.jsx
// =============================================
import React from 'react';
import { themeTokens } from '@lib/theme.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import ModernBookingInterface from '@features/booking/ModernBookingInterface.jsx';
import ClubSelectionForBooking from '@components/booking/ClubSelectionForBooking.jsx';

export default function BookingPage() {
  const { user } = useAuth();
  const { clubId, hasClub } = useClub();
  const T = React.useMemo(() => themeTokens(), []);

  // Se non c'è un circolo selezionato, mostra la selezione del circolo
  if (!hasClub || !clubId) {
    return <ClubSelectionForBooking bookingType="campo" T={T} />;
  }

  // Se c'è un circolo selezionato, mostra l'interfaccia di prenotazione normale
  return (
    <ModernBookingInterface T={T} user={user} state={null} setState={() => {}} clubId={clubId} />
  );
}
