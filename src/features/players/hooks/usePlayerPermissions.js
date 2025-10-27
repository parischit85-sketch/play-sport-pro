/* eslint linebreak-style: 0 */
import { useMemo } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useClub } from '@contexts/ClubContext';

/**
 * usePlayerPermissions - Hook per gestire permessi utente su operazioni player
 * UPDATED: 2025-10-22 - Added club-specific role support
 * Ritorna oggetto con permessi based on user role:
 * - admin: tutti i permessi
 * - club-admin: permessi su club players
 * - user: solo visualizzazione
 * @param {Object} player - Player object (opzionale per check generici)
 * @returns {Object} Permissions object
 */
export const usePlayerPermissions = (player = null) => {
  // Support multiple shapes from AuthContext (legacy/current/tests)
  const auth = useAuth();
  const {
    user: authUser,
    currentUser,
    userProfile,
    profile: legacyProfile,
    userRole: authUserRole,
    userClubRoles: clubRoles,
  } = auth || {};

  const user = authUser || currentUser || null;

  const normalizedProfile = useMemo(() => {
    // Prefer explicit profile objects; fallback to currentUser for tests that pass role there
    const raw = userProfile || legacyProfile || currentUser || {};
    const roleStr = (() => {
      // Highest priority: explicit userRole coming from AuthContext (stable source in app)
      if (authUserRole) return String(authUserRole).toLowerCase().replace(/_/g, '-');
      if (raw.role) return String(raw.role).toLowerCase();
      if (raw.isAdmin) return 'admin';
      if (raw.isClubAdmin) return 'club-admin';
      return 'user';
    })();
    return { ...raw, role: roleStr };
  }, [userProfile, legacyProfile, currentUser, authUserRole]);
  // Prefer hook API (mockable in tests) with test-safe fallback from useClub
  const { clubId: contextClubId = null } = useClub() || {};
  const clubId = contextClubId;

  // To keep memoization stable across renders in tests (which can recreate objects),
  // depend only on primitive keys instead of whole objects where possible.
  const clubRoleValue = clubId && clubRoles ? String(clubRoles[clubId] || '') : '';

  const permissions = useMemo(() => {
    // No user = no permissions
    if (!normalizedProfile) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canLinkAccount: false,
        canUnlinkAccount: false,
        canViewSensitiveData: false,
        canExportData: false,
        canActivateDeactivate: false,
        canManageWallet: false,
        canManageCertificates: false,
        canManageNotes: false,
        isAdmin: false,
        isClubAdmin: false,
        isReadOnly: true,
      };
    }

  // Resolve roles: do not let clubRole override global admin
  const rawRole = (normalizedProfile.role || 'user').toLowerCase();
  const normalizedClubRole = String(clubRoleValue || '').toLowerCase().replace(/_/g, '-');
  const isAdminRole = rawRole === 'admin' || rawRole === 'super-admin' || rawRole === 'super_admin' || normalizedProfile.isAdmin === true;
  // Club admin if explicitly flagged on profile or via clubRoles for current club
  const isClubAdminRole = !isAdminRole && (rawRole === 'club-admin' || normalizedClubRole === 'club-admin' || normalizedClubRole === 'admin');
  const isUser = !isAdminRole && !isClubAdminRole;

    // Check if player belongs to user's club (per club-admin)
    // Note: Players loaded from ClubContext often don't have clubId field
    // Treat missing clubId as belonging to the current club context
  const isOwnClubPlayer = !!(
    player && (
      // If both ids present, compare; if player's clubId missing, assume current club (lenient for context-loaded players)
      (player.clubId && clubId ? player.clubId === clubId : clubId ? true : false)
    )
  );

    // GLOBAL ADMIN: tutti i permessi ovunque
    if (isAdminRole) {
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        canLinkAccount: true,
        canUnlinkAccount: true,
        canViewSensitiveData: true,
        canExportData: true,
        canActivateDeactivate: true,
        canManageWallet: true,
        canManageCertificates: true,
        canManageNotes: true,
        isAdmin: true,
        isClubAdmin: false,
        isReadOnly: false,
      };
    }

    // CLUB-ADMIN: permessi su players del proprio club
    if (isClubAdminRole && isOwnClubPlayer) {
      return {
        canView: true,
        canEdit: true,
        canDelete: false, // Solo admin può eliminare
        canLinkAccount: true,
        canUnlinkAccount: true,
        canViewSensitiveData: true,
        canExportData: true,
        canActivateDeactivate: true,
        canManageWallet: true,
        canManageCertificates: true,
        canManageNotes: true,
        isAdmin: false,
        isClubAdmin: true,
        isReadOnly: false,
      };
    }

    // CLUB-ADMIN ma player di altro club: solo view
    if (isClubAdminRole && !isOwnClubPlayer) {
      return {
        canView: true,
        canEdit: false,
        canDelete: false,
        canLinkAccount: false,
        canUnlinkAccount: false,
        canViewSensitiveData: false,
        canExportData: false,
        canActivateDeactivate: false,
        canManageWallet: false,
        canManageCertificates: false,
        canManageNotes: false,
        isAdmin: false,
        isClubAdmin: true,
        isReadOnly: true,
      };
    }

    // USER: solo visualizzazione (per vedere propri dati se player è linked al proprio account)
  const isOwnPlayer = !!(player && user && (player.linkedAccountId === user.uid || player.linkedUserId === user.uid));

    if (isUser && isOwnPlayer) {
      return {
        canView: true,
        canEdit: false,
        canDelete: false,
        canLinkAccount: false,
        canUnlinkAccount: false,
        canViewSensitiveData: true, // Può vedere i propri dati
        canExportData: true, // Può esportare i propri dati (GDPR)
        canActivateDeactivate: false,
        canManageWallet: false,
        canManageCertificates: false,
        canManageNotes: false,
        isAdmin: false,
        isClubAdmin: false,
        isReadOnly: true,
      };
    }

    // USER: player non proprio = no access
    if (isUser) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canLinkAccount: false,
        canUnlinkAccount: false,
        canViewSensitiveData: false,
        canExportData: false,
        canActivateDeactivate: false,
        canManageWallet: false,
        canManageCertificates: false,
        canManageNotes: false,
        isAdmin: false,
        isClubAdmin: false,
        isReadOnly: true,
      };
    }

    // Default: no permissions
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canLinkAccount: false,
      canUnlinkAccount: false,
      canViewSensitiveData: false,
      canExportData: false,
      canActivateDeactivate: false,
      canManageWallet: false,
      canManageCertificates: false,
      canManageNotes: false,
      isAdmin: false,
      isClubAdmin: false,
      isReadOnly: true,
    };
  }, [user?.uid, normalizedProfile.role, normalizedProfile.isAdmin, player && player.id, player && player.clubId, player && (player.linkedAccountId || player.linkedUserId), clubId, clubRoleValue]);

  return permissions;
};

/**
 * Helper: Check if user can perform ANY action on players
 */
export const useCanManagePlayers = () => {
  const { profile } = useAuth();
  
  return useMemo(() => {
    if (!profile) return false;
    return profile.role === 'admin' || profile.role === 'club-admin';
  }, [profile]);
};

/**
 * Helper: Get user's permission level
 */
export const usePermissionLevel = () => {
  const { profile } = useAuth();
  
  return useMemo(() => {
    if (!profile) return 'none';
    if (profile.role === 'admin') return 'admin';
    if (profile.role === 'club-admin') return 'club-admin';
    if (profile.role === 'user') return 'user';
    return 'none';
  }, [profile]);
};

export default usePlayerPermissions;
