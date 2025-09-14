// =============================================
// FILE: src/pages/LessonBookingPage.jsx
// Page per la prenotazione delle lezioni
// =============================================
import React from "react";
import { themeTokens } from "@lib/theme.js";
import { useAuth } from "@contexts/AuthContext.jsx";
import { useLeague } from "@contexts/LeagueContext.jsx";
import { useUI } from "@contexts/UIContext.jsx";
import LessonBookingInterface from "@features/lessons/LessonBookingInterface.jsx";

export default function LessonBookingPage() {
  const { user } = useAuth();
  const { state, setState } = useLeague();
  const { clubMode } = useUI();
  const T = React.useMemo(() => themeTokens(), []);

  return (
    <LessonBookingInterface
      T={T}
      user={user}
      state={state}
      setState={setState}
      clubMode={clubMode}
    />
  );
}
