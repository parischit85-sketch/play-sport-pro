// =============================================
// FILE: src/pages/BookingPage.jsx
// =============================================
import React from 'react';
import { themeTokens } from '@lib/theme.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useLeague } from '@contexts/LeagueContext.jsx';
import ModernBookingInterface from '@features/booking/ModernBookingInterface.jsx';

export default function BookingPage() {
  const { user } = useAuth();
  const { state, setState } = useLeague();
  const T = React.useMemo(() => themeTokens(), []);

  return (
    <ModernBookingInterface
      T={T}
      user={user}
      state={state}
      setState={setState}
    />
  );
}
