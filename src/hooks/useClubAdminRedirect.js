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
    if (location.pathname !== '/dashboard') {
      return;
    }

    // Se siamo già nella dashboard admin di un club, non reindirizzare
    if (location.pathname.includes('/club/') && location.pathname.includes('/admin/dashboard')) {
      return;
    }

    // Primo controllo: verifica userClubRoles
    let clubAdminRoles = [];
    if (userClubRoles && Object.keys(userClubRoles).length > 0) {
      clubAdminRoles = Object.entries(userClubRoles).filter(
        ([clubId, roles]) => {
          // Gestisci sia stringhe che array
          if (Array.isArray(roles)) {
            return roles.includes('CLUB_ADMIN') || roles.includes('club_admin');
          }
          return roles === 'CLUB_ADMIN' || roles === 'club_admin';
        }
      );
    }

    // Secondo controllo: verifica userRole globale per club_admin
    if (clubAdminRoles.length === 0 && userRole === 'club_admin') {
      
      // Prova a trovare il club dal currentClub o localStorage
      let clubId = currentClub?.id;
      if (!clubId) {
        try {
          const storedClubId = localStorage.getItem('currentClub');
          if (storedClubId && storedClubId !== 'null' && storedClubId !== 'undefined') {
            clubId = storedClubId;
          }
        } catch (error) {
          // Silent error handling
        }
      }
      
      // Se abbiamo un club e l'utente è club_admin, assumiamo sia admin di quel club
      if (clubId) {
        clubAdminRoles = [[clubId, 'CLUB_ADMIN']];
      }
    }

    // Terzo controllo: fallback finale per sporting-cat SE l'utente ha effettivamente permessi admin
    if (clubAdminRoles.length === 0) {
      if (userRole === 'super_admin' || userRole === 'club_admin') {
        clubAdminRoles = [['sporting-cat', 'CLUB_ADMIN']];
      }
    }

    // Se l'utente è admin di esattamente un club, reindirizza
    if (clubAdminRoles.length === 1) {
      const [clubId, role] = clubAdminRoles[0];
      
      // Controllo di sicurezza: assicurati che clubId sia valido
      if (!clubId || clubId === 'undefined' || clubId === 'null') {
        return;
      }
      
      const adminDashboardPath = `/club/${clubId}/admin/dashboard`;
      
      // Usa un piccolo delay per assicurarsi che il DOM sia pronto
      setTimeout(() => {
        navigate(adminDashboardPath, { replace: true });
      }, 100);
    }
  }, [user, userRole, userClubRoles, currentClub, loading, location.pathname, navigate]);
}
