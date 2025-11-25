// =============================================
// FILE: src/contexts/AuthContext.jsx
// =============================================
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuth, getUserProfile, logout } from '@services/auth.jsx';
// import { setSentryUser, clearSentryUser, trackError, trackUserAction } from "../lib/sentry.js";
import { trackAuth, setUserId, setUserProperties } from '../lib/analytics.js';
import { initialize as initializeBookingService } from '@services/unified-booking-service.js';

// Constants for user roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin', // Super Admin (tu - fornitore servizio PlaySport)
  CLUB_ADMIN: 'club_admin', // Amministratore di circolo (gestore club)
  INSTRUCTOR: 'instructor', // Istruttore/Maestro
  USER: 'user', // Utente finale (giocatori/clienti)
};

// Constants for affiliation status
export const AFFILIATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Multi-tenant state
  const [currentClub, setCurrentClub] = useState(null);
  const [userAffiliations, setUserAffiliations] = useState([]);
  const [userRole, setUserRole] = useState(USER_ROLES.USER);
  const [userClubRoles, setUserClubRoles] = useState({}); // { clubId: 'club_admin' | 'instructor' }

  // Determine user role based on profile and claims
  const determineUserRole = (profile, customClaims = {}, firebaseUser = null) => {
    // Super Admin check first (special admin flag)
    if (firebaseUser?.isSpecialAdmin || profile?.isSpecialAdmin) {
      return USER_ROLES.SUPER_ADMIN;
    }

    // Check profile role for Super Admin
    if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || profile?.role === 'admin') {
      return USER_ROLES.SUPER_ADMIN;
    }

    // Check profile role for Club Admin
    if (profile?.role === 'club-admin') {
      return USER_ROLES.CLUB_ADMIN;
    }

    // Check custom claims
    if (customClaims.role === 'club_admin') {
      return USER_ROLES.CLUB_ADMIN;
    }

    if (customClaims.role === 'instructor') {
      return USER_ROLES.INSTRUCTOR;
    }

    // Default to user
    return USER_ROLES.USER;
  };

  // Load user club memberships (replaces affiliations)
  const loadUserAffiliations = async (userId) => {
    if (!userId) return;
    try {
      // 🆕 NEW: Load clubs where user is a member instead of affiliations
      const { getUserClubMemberships } = await import('@services/club-users.js');

      let memberships = [];
      try {
        // This would load all clubs where the user is in the users collection
        memberships = (await getUserClubMemberships(userId)) || [];
        setUserAffiliations(memberships); // Keep same state name for compatibility
      } catch (e) {
        console.error('❌ Error loading club memberships:', e);
        setUserAffiliations([]);
      }

      // Extract club roles from memberships
      let clubRoles = {};
      memberships.forEach((membership) => {
        if (membership.role && membership.status === 'active') {
          clubRoles[membership.clubId] = membership.role;
        }
      });
      setUserClubRoles(clubRoles || {});

      // Auto-set club for CLUB_ADMIN users
      const clubAdminRoles = Object.entries(clubRoles || {}).filter(
        ([_clubId, role]) => role === 'club_admin'
      );

      if (clubAdminRoles.length === 1) {
        // Se l'utente è CLUB_ADMIN di un solo club, impostalo automaticamente
        const [_clubId] = clubAdminRoles[0];
        setCurrentClub(_clubId);
        localStorage.setItem('currentClub', _clubId);
      } else {
        // No single club admin role found, checking localStorage
        // Restore current club da localStorage se valido
        const savedClubId = localStorage.getItem('currentClub');
        if (savedClubId) {
          const validMembership = memberships.find(
            (m) => m.clubId === savedClubId && m.status === 'active'
          );
          if (validMembership) {
            setCurrentClub(savedClubId);
          } else {
            localStorage.removeItem('currentClub');
          }
        }
      }
    } catch (err) {
      console.error('❌ Error loading user memberships:', err);
      setUserAffiliations([]);
      setUserClubRoles({});
    }
  };

  // Switch to a specific club
  const switchToClub = async (clubId) => {
    const membership = userAffiliations.find((m) => m.clubId === clubId && m.status === 'active');

    if (!membership) {
      throw new Error('Non sei membro di questo club o la membership non è attiva');
    }

    setCurrentClub(clubId);
    localStorage.setItem('currentClub', clubId);
  };

  // Exit current club (return to main dashboard)
  const exitClub = () => {
    setCurrentClub(null);
    localStorage.removeItem('currentClub');
  };

  // Check if user has permission for specific role in current club
  const hasRole = React.useCallback(
    (role, clubId = currentClub) => {
      if (userRole === USER_ROLES.SUPER_ADMIN) return true; // Super admin has all permissions
      if (userRole === role) return true; // User has global role

      // Check club-specific roles from userClubRoles
      if (clubId && userClubRoles[clubId] === role) return true;

      // For club admin role, also check memberships
      if (role === USER_ROLES.CLUB_ADMIN && clubId) {
        // Check if user has admin membership for this club
        const adminMembership = userAffiliations.find(
          (m) =>
            m.clubId === clubId &&
            m.status === 'active' &&
            (m.role === 'admin' || m.role === 'club_admin')
        );
        if (adminMembership) return true;
      }

      return false;
    },
    [userRole, userClubRoles, userAffiliations, currentClub]
  );

  // Check if user is club admin for specific club
  const isClubAdmin = React.useCallback(
    (clubId = currentClub) => {
      if (userRole === USER_ROLES.SUPER_ADMIN) {
        return true; // Super admin is always club admin
      }

      // Check userClubRoles first
      if (clubId && userClubRoles[clubId] === USER_ROLES.CLUB_ADMIN) {
        return true;
      }

      // Check memberships for admin role
      if (clubId) {
        const adminMembership = userAffiliations.find(
          (m) =>
            m.clubId === clubId &&
            m.status === 'active' &&
            (m.role === 'club_admin' || m.role === 'admin')
        );

        if (adminMembership) {
          return true;
        }
      }

      return false;
    },
    [userRole, userClubRoles, userAffiliations, currentClub]
  );

  // Check if user is instructor for specific club
  const isInstructor = React.useCallback(
    (clubId = currentClub) => {
      return hasRole(USER_ROLES.INSTRUCTOR, clubId);
    },
    [hasRole, currentClub]
  );

  // Get user role for specific club
  const getRoleForClub = (clubId = currentClub) => {
    if (userRole === USER_ROLES.SUPER_ADMIN) return USER_ROLES.SUPER_ADMIN;
    if (clubId && userClubRoles[clubId]) return userClubRoles[clubId];
    return USER_ROLES.USER;
  };

  // Check if user is member of a specific club
  const isAffiliatedTo = (clubId) => {
    return userAffiliations.some((m) => m.clubId === clubId && m.status === 'active');
  };

  // Force super admin role (for development/testing)
  const forceAdminRole = () => {
    setUserRole(USER_ROLES.SUPER_ADMIN);
  };

  useEffect(() => {
    const unsubscribe = onAuth(async (firebaseUser) => {
      try {
        // Debug log removed

        setLoading(true);
        setError(null);

        // Se c'è un firebaseUser, usa quello
        if (firebaseUser) {
          // Processing Firebase user

          // Handle special admin login
          if (firebaseUser?.isSpecialAdmin) {
            // Save admin session to localStorage
            localStorage.setItem('adminSession', JSON.stringify(firebaseUser));

            try {
              const profile = await getUserProfile(firebaseUser.uid);
              console.log('🔍 [AuthContext] Admin profile loaded:', {
                userId: firebaseUser.uid,
                email: firebaseUser.email,
                skipEmailVerification: profile?.skipEmailVerification,
                profile,
              });
              setUserProfile(profile);

              // Merge profile data with Firebase user (include skipEmailVerification)
              const enrichedUser = {
                ...firebaseUser,
                skipEmailVerification: profile?.skipEmailVerification || false,
              };
              console.log('✅ [AuthContext] Admin enriched user:', {
                uid: enrichedUser.uid,
                email: enrichedUser.email,
                skipEmailVerification: enrichedUser.skipEmailVerification,
              });
              setUser(enrichedUser);
            } catch (error) {
              console.error('❌ Error loading admin profile:', error);
              setUser(firebaseUser);
            }

            setUserRole(USER_ROLES.SUPER_ADMIN);
            setUserAffiliations([]);
            setUserClubRoles({});
            setCurrentClub(null);
            setError(null);
            setLoading(false);

            // Initialize booking service with cloud storage for admin
            try {
              initializeBookingService({ cloudEnabled: true, user: firebaseUser });
            } catch (error) {
              console.warn('⚠️ Failed to initialize booking service for admin:', error);
            }

            // Set Google Analytics user context for admin
            setUserId(firebaseUser.uid);
            setUserProperties({
              user_type: 'admin',
              email: firebaseUser.email,
            });
            trackAuth.loginSuccess('admin', firebaseUser.uid);

            return;
          }

          // Handle normal user
          let profile = {};
          try {
            // Tenta di ottenere il profilo esistente o crearne uno nuovo
            const { createUserProfileIfNeeded } = await import('@services/auth.jsx');
            profile = await createUserProfileIfNeeded(firebaseUser);
            console.log('🔍 [AuthContext] User profile loaded:', {
              userId: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              skipEmailVerification: profile?.skipEmailVerification,
            });
            console.log('🔍 [AuthContext] Full profile object:', profile);

            // 🔍 DEBUG: Verifica ruolo e permessi
            console.log('🔍🔍🔍 [DEBUG] User Role and Permissions:', {
              role: profile?.role,
              clubId: profile?.clubId,
              isAdmin: profile?.role === 'admin',
              isClubAdmin: profile?.role === 'club_admin',
              isInstructor: profile?.role === 'instructor',
              hasRole: !!profile?.role,
              profileKeys: Object.keys(profile || {}),
            });

            // 🔧 FIX: Add missing role field for legacy users
            if (!profile?.role && profile?.globalRole === 'user') {
              console.log('⚠️ [AuthContext] User missing role field, adding default...');
              try {
                const { doc, updateDoc } = await import('firebase/firestore');
                const { db } = await import('@services/firebase');
                const userRef = doc(db, 'users', firebaseUser.uid);
                await updateDoc(userRef, { role: 'user' });
                profile.role = 'user'; // Update local profile
                console.log('✅ [AuthContext] Role field added successfully');
              } catch (roleError) {
                console.warn('⚠️ [AuthContext] Could not add role field:', roleError.message);
                // Non blocca il login, l'utente può comunque procedere
              }
            }

            setUserProfile(profile);

            // Merge profile data with Firebase user (include skipEmailVerification)
            const enrichedUser = {
              ...firebaseUser,
              skipEmailVerification: profile?.skipEmailVerification || false,
            };
            console.log('✅ [AuthContext] User enriched user:', {
              uid: enrichedUser.uid,
              email: enrichedUser.email,
              emailVerified: enrichedUser.emailVerified,
              skipEmailVerification: enrichedUser.skipEmailVerification,
            });
            console.log('✅ [AuthContext] Full enriched user object:', enrichedUser);
            setUser(enrichedUser);

            // Set Google Analytics user context
            setUserId(firebaseUser.uid);
            setUserProperties({
              user_type: userRole,
              email: firebaseUser.email,
              has_profile: !!profile?.firstName,
            });
            trackAuth.loginSuccess('auto', firebaseUser.uid);
          } catch (error) {
            console.error('❌ Error loading/creating user profile:', error);

            // In caso di errore, crea un profilo di base dall'utente Firebase
            const fallbackProfile = {
              email: firebaseUser.email,
              firstName: firebaseUser.displayName?.split(' ')?.[0] || '',
              lastName: firebaseUser.displayName?.split(' ')?.[1] || '',
              needsCompletion: true,
            };
            setUserProfile(fallbackProfile);

            // Set Google Analytics user context for fallback
            setUserId(firebaseUser.uid);
            setUserProperties({
              user_type: 'user',
              email: firebaseUser.email,
              fallback_profile: true,
            });
          }

          // Determine user role
          const customClaims = firebaseUser.customClaims || {};
          const role = determineUserRole(profile, customClaims, firebaseUser);
          setUserRole(role);

          // Initialize booking service with cloud storage enabled for authenticated users
          try {
            initializeBookingService({ cloudEnabled: true, user: firebaseUser });
          } catch (error) {
            console.warn('⚠️ Failed to initialize booking service:', error);
          }

          // Load memberships for non-super-admin users
          if (role !== USER_ROLES.SUPER_ADMIN) {
            await loadUserAffiliations(firebaseUser.uid);
          }

          // ⚠️ NOTE: Push subscription is handled by AutoPushSubscription component
          // to avoid duplicate subscriptions on every auth state change
        } else {
          // Track logout in Google Analytics
          trackAuth.logout();

          // Pulisci sempre le sessioni non valide quando non c'è un utente Firebase
          let hadStaleSession = false;
          try {
            const savedAdminSession = localStorage.getItem('adminSession');
            if (savedAdminSession) {
              localStorage.removeItem('adminSession');
              hadStaleSession = true;
            }
            const currentClub = localStorage.getItem('currentClub');
            if (currentClub) {
              localStorage.removeItem('currentClub');
              hadStaleSession = true;
            }
          } catch (e) {
            console.error('❌ Error clearing stale session:', e);
          }

          // Se avevamo sessioni non valide, forza un refresh per evitare stati inconsistenti
          if (hadStaleSession) {
            window.location.reload();
            return;
          }

          // No user found, clear state
          setUser(null);
          setUserProfile(null);
          setUserRole(USER_ROLES.USER);
          setUserAffiliations([]);
          setUserClubRoles({});
          setCurrentClub(null);

          // Disable cloud storage when user logs out
          try {
            initializeBookingService({ cloudEnabled: false, user: null });
          } catch (error) {
            console.warn('⚠️ Failed to disable booking service cloud storage:', error);
          }
        }

        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('❌ Auth error:', err);

        setError(err);
        setUserProfile(null);
        setUserRole(USER_ROLES.USER);
        setUserAffiliations([]);
        setUserClubRoles({});
        setCurrentClub(null);

        // Track auth error in Google Analytics
        trackAuth.loginFailed('auto', err.code || 'unknown_error');

        // Pulisci le sessioni non valide anche in caso di errore
        try {
          localStorage.removeItem('adminSession');
          localStorage.removeItem('currentClub');
        } catch (e) {
          console.error('❌ Error clearing localStorage on auth error:', e);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userRole]);

  const isAuthenticated = !!user;
  const isProfileComplete = userProfile?.firstName && userProfile?.phone;

  const value = {
    // Original auth state
    user,
    userProfile,
    setUserProfile,
    loading,
    error,
    isAuthenticated,
    isProfileComplete,

    // Multi-tenant functionality
    currentClub,
    setCurrentClub,
    userAffiliations,
    setUserAffiliations,
    userRole,
    userClubRoles,

    // Actions
    switchToClub,
    exitClub,
    logout,
    loadUserAffiliations: () => loadUserAffiliations(user?.uid), // Keep name for compatibility
    forceAdminRole, // For development/testing

    // Helper functions
    hasRole,
    isClubAdmin,
    isInstructor,
    isAffiliatedTo,
    getRoleForClub,
    getFirstAdminClub: React.useCallback(() => {
      const adminMembership = userAffiliations.find(
        (m) => m.status === 'active' && (m.role === 'admin' || m.role === 'club_admin')
      );
      return adminMembership ? adminMembership.clubId : null;
    }, [userAffiliations]),

    // Force reload user data (useful after promotion/demotion)
    reloadUserData: async () => {
      if (user?.uid) {
        // Reload memberships
        await loadUserAffiliations(user.uid);

        // Reload user profile with forced cache bypass
        try {
          const { getUserProfile } = await import('@services/auth.jsx');
          const freshProfile = await getUserProfile(user.uid, true); // Force cache bypass
          setUserProfile(freshProfile);
        } catch (error) {
          console.error('❌ Error reloading user profile:', error);
        }
      }
    },

    // Constants for easy access
    USER_ROLES,
    AFFILIATION_STATUS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
