// =============================================
// FILE: src/pages/LessonBookingPage.jsx
// Page per la prenotazione delle lezioni
// =============================================
import React from 'react';
import { themeTokens } from '@lib/theme.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { useUI } from '@contexts/UIContext.jsx';
import LessonBookingInterface from '@features/lessons/LessonBookingInterface.jsx';
import ClubSelectionForBooking from '@components/booking/ClubSelectionForBooking.jsx';

export default function LessonBookingPage() {
  const { user, isClubAdmin } = useAuth();
  const { clubId, hasClub } = useClub();
  const { clubMode } = useUI();
  const T = React.useMemo(() => themeTokens(), []);

  // Se non c'è un circolo selezionato, mostra la selezione del circolo
  if (!hasClub || !clubId) {
    return <ClubSelectionForBooking bookingType="lezione" T={T} />;
  }

  // Gli admin di club possono sempre accedere, anche senza clubMode attivato
  const effectiveClubMode = clubMode || isClubAdmin(clubId);

  // Se c'è un circolo selezionato, mostra l'interfaccia di prenotazione normale
  return (
    <LessonBookingInterface
      T={T}
      user={user}
      state={null}
      setState={() => {}}
      clubMode={effectiveClubMode}
      clubId={clubId}
    />
  );
}

