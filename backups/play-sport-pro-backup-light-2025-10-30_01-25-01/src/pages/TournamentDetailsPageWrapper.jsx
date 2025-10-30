/**
 * Tournament Details Page Wrapper
 * Wrapper component that passes clubId to TournamentDetailsPage
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import TournamentDetailsPage from '@features/tournaments/components/TournamentDetailsPage.jsx';

export default function TournamentDetailsPageWrapper() {
  const { clubId } = useParams();

  return <TournamentDetailsPage clubId={clubId} />;
}

