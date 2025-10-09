// =============================================
// FILE: src/hooks/useClubAdminRedirect.js
// =============================================
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * Hook che gestisce il redirect automatico per i CLUB_ADMIN
 * Se un utente è CLUB_ADMIN di un solo club, viene automaticamente
 * reindirizzato alla dashboard amministrativa del club
 */
export function useClubAdminRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, userClubRoles, currentClub, loading } = useAuth();

  useEffect(() => {
    // Se stiamo ancora caricando, aspettiamo
    if (loading) {
      return;
    }

    // Se non abbiamo un utente, non fare nulla
    if (!user) {
      return;
    }

    // Solo reindirizza se siamo esattamente sulla dashboard principale
    // Se siamo già su qualsiasi altra route, non fare nulla
    if (location.pathname !== '/dashboard') {
      return;
    }

    // Determina il clubId da reindirizzare
    let targetClubId = null;

    // METODO 1: Controlla userClubRoles (più affidabile)
    if (userClubRoles && Object.keys(userClubRoles).length > 0) {
      const clubAdminEntries = Object.entries(userClubRoles).filter(([clubId, roles]) => {
        // Gestisci sia stringhe che array
        if (Array.isArray(roles)) {
          return roles.includes('CLUB_ADMIN') || roles.includes('club_admin');
        }
        return roles === 'CLUB_ADMIN' || roles === 'club_admin';
      });

      // Se l'utente è admin di esattamente un club, usa quello
      if (clubAdminEntries.length === 1) {
        targetClubId = clubAdminEntries[0][0];
      }
    }

    // METODO 2: Se userClubRoles è vuoto ma userRole è club_admin, usa currentClub
    if (!targetClubId && userRole === 'club_admin') {
      // currentClub è direttamente il clubId (stringa), non un oggetto
      if (currentClub) {
        targetClubId = currentClub;
      }
      // Fallback: localStorage
      else {
        try {
          const storedClubId = localStorage.getItem('currentClub');
          if (storedClubId && storedClubId !== 'null' && storedClubId !== 'undefined') {
            targetClubId = storedClubId;
          }
        } catch (error) {
          console.error('[useClubAdminRedirect] Error reading localStorage:', error);
        }
      }
    }

    // Se abbiamo trovato un club valido, reindirizza
    if (targetClubId && targetClubId !== 'undefined' && targetClubId !== 'null') {
      // Trova lo slug del club (dobbiamo caricare il club per ottenere lo slug)
      // Per ora usiamo direttamente il clubId come slug
      const adminDashboardPath = `/club/${targetClubId}/admin/dashboard`;

      console.log('[useClubAdminRedirect] Redirecting club_admin to:', adminDashboardPath);
      
      // Naviga immediatamente senza timeout per evitare loop
      navigate(adminDashboardPath, { replace: true });
    } else if (userRole === 'club_admin') {
      // Se l'utente è club_admin ma non abbiamo trovato il club, c'è un problema di dati
      console.warn('[useClubAdminRedirect] User is club_admin but no club found:', {
        userId: user.uid,
        userRole,
        userClubRoles,
        currentClub
      });
    }
  }, [user, userRole, userClubRoles, currentClub, loading, location.pathname, navigate]);
}
