// =============================================
// FILE: src/pages/ProfilePage.jsx
// =============================================
import React from "react";
import { themeTokens } from "@lib/theme.js";
import { useUI } from "@contexts/UIContext.jsx";
import { useClub } from '@contexts/ClubContext.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';
import Profile from "@features/profile/Profile.jsx";
import ClubAdminProfile from "@features/profile/ClubAdminProfile.jsx";

export default function ProfilePage() {
  const T = React.useMemo(() => themeTokens(), []);
  const { players, matches, clubId, club } = useClub();
  const { clubMode, setClubMode } = useUI();
  const { isClubAdmin, userAffiliations } = useAuth();

  // Se l'utente è un admin di club, mostra il profilo specifico per club
  let actualClubId = clubId;
  let actualClub = club;
  const isAdmin = isClubAdmin(clubId);
  
  // Se non abbiamo clubId dal context ma siamo admin, cerchiamo il club
  if (isAdmin && !actualClubId) {
    const adminAffiliation = (userAffiliations || []).find(a => 
      a.status === 'approved' && (a.role === 'admin' || a.isClubAdmin === true)
    );
    if (adminAffiliation) {
      actualClubId = adminAffiliation.clubId;
    }
  }

  if (isAdmin && actualClubId) {
    return (
      <ClubAdminProfile 
        T={T}
        club={actualClub}
        clubId={actualClubId}
        clubMode={clubMode}
        setClubMode={setClubMode}
      />
    );
  }

  // Altrimenti mostra il profilo utente normale
  return (
    <Profile
      T={T}
      state={{ players, matches }}
      setState={() => {}}
      derived={{ players, matches }}
      leagueId={null}
      setLeagueId={() => {}}
      clubMode={clubMode}
      setClubMode={setClubMode}
    />
  );
}
