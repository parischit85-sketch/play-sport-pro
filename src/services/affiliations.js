// =============================================
// FILE: src/services/affiliations.js
// FASE 2: Unified Affiliations & Roles System
// =============================================

import { db } from './firebase.js';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

// ==================== CONSTANTS ====================

export const AFFILIATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

export const AFFILIATION_ROLES = {
  MEMBER: 'member',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
};

export const USER_PERMISSIONS = {
  // Basic member permissions
  VIEW_CLUB_INFO: 'view_club_info',
  BOOK_LESSONS: 'book_lessons',
  VIEW_OWN_BOOKINGS: 'view_own_bookings',

  // Instructor permissions
  MANAGE_OWN_LESSONS: 'manage_own_lessons',
  VIEW_STUDENTS: 'view_students',
  MANAGE_AVAILABILITY: 'manage_availability',

  // Admin permissions
  MANAGE_ALL_BOOKINGS: 'manage_all_bookings',
  MANAGE_USERS: 'manage_users',
  MANAGE_INSTRUCTORS: 'manage_instructors',
  MANAGE_CLUB_SETTINGS: 'manage_club_settings',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_PRICES: 'manage_prices',
};

// ==================== ROLE PERMISSIONS MAPPING ====================

const ROLE_PERMISSIONS = {
  [AFFILIATION_ROLES.MEMBER]: [
    USER_PERMISSIONS.VIEW_CLUB_INFO,
    USER_PERMISSIONS.BOOK_LESSONS,
    USER_PERMISSIONS.VIEW_OWN_BOOKINGS,
  ],
  [AFFILIATION_ROLES.INSTRUCTOR]: [
    USER_PERMISSIONS.VIEW_CLUB_INFO,
    USER_PERMISSIONS.BOOK_LESSONS,
    USER_PERMISSIONS.VIEW_OWN_BOOKINGS,
    USER_PERMISSIONS.MANAGE_OWN_LESSONS,
    USER_PERMISSIONS.VIEW_STUDENTS,
    USER_PERMISSIONS.MANAGE_AVAILABILITY,
  ],
  [AFFILIATION_ROLES.ADMIN]: [
    ...Object.values(USER_PERMISSIONS), // Admin has all permissions
  ],
};

// ==================== MAIN FUNCTIONS ====================

/**
 * Get user affiliations with role information
 * OPTION A: Single source of truth - affiliations are now embedded in club user documents
 */
export async function getUserAffiliations(userId) {
  try {
    console.log('🔍 [getUserAffiliations] Getting affiliations for user:', userId);

    // Get all clubs and check if user is in each club's users collection
    const clubsSnap = await getDocs(collection(db, 'clubs'));
    const affiliations = [];

    for (const clubDoc of clubsSnap.docs) {
      const clubId = clubDoc.id;
      const clubData = clubDoc.data();

      // Check if user exists in this club's users collection
      const clubUsersRef = collection(db, 'clubs', clubId, 'users');
      const userQuery = query(clubUsersRef, where('userId', '==', userId));
      const userSnap = await getDocs(userQuery);

      if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        const userData = userDoc.data();

        // Create affiliation object from club user data
        const affiliation = {
          id: userDoc.id,
          userId,
          clubId,
          role: userData.role || AFFILIATION_ROLES.MEMBER,
          status: AFFILIATION_STATUS.APPROVED, // All club users are approved
          requestedAt: userData.addedAt || Timestamp.now(),
          approvedAt: userData.addedAt || Timestamp.now(),
          approvedBy: userData.addedBy || 'system',
          permissions: getRolePermissions(userData.role || AFFILIATION_ROLES.MEMBER),
          version: 1,
          createdAt: userData.addedAt || Timestamp.now(),
          updatedAt: userData.updatedAt || Timestamp.now(),
          // Add club info
          clubName: clubData.name,
          clubInfo: clubData,
        };

        affiliations.push(affiliation);
      }
    }

    console.log('✅ [getUserAffiliations] Found', affiliations.length, 'affiliations');
    return affiliations;
  } catch (error) {
    console.error('❌ Error getting user affiliations:', error);
    throw error;
  }
}

/**
 * Request affiliation (add user to club)
 * OPTION A: Single source of truth - affiliations are created by adding users to clubs/{clubId}/users
 */
export async function requestAffiliation(userId, clubId, requestedRole = AFFILIATION_ROLES.MEMBER) {
  try {
    console.log('📝 [requestAffiliation] Adding user to club:', { userId, clubId, requestedRole });

    // Check if user is already in club
    const existingUser = await getClubUser(userId, clubId);
    if (existingUser) {
      throw new Error('Sei già membro di questo club');
    }

    // Get user data from root collection
    const { getUser } = await import('./users.js');
    const userData = await getUser(userId);
    if (!userData) {
      throw new Error('User not found');
    }

    // Add user to club's users collection
    const clubUsersRef = collection(db, 'clubs', clubId, 'users');
    const clubUserData = {
      userId,
      clubId,
      userEmail: userData.email,
      userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      userPhone: userData.phone || '',
      role: requestedRole,
      status: 'active',
      addedAt: Timestamp.now(),
      addedBy: null, // System added
      notes: '',
      permissions: getRolePermissions(requestedRole),
      version: 1,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(clubUsersRef, clubUserData);

    console.log('✅ [requestAffiliation] User added to club:', docRef.id);
    return {
      id: docRef.id,
      userId,
      clubId,
      role: requestedRole,
      status: AFFILIATION_STATUS.APPROVED,
      requestedAt: Timestamp.now(),
      approvedAt: Timestamp.now(),
      approvedBy: 'system',
      permissions: getRolePermissions(requestedRole),
      version: 1,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  } catch (error) {
    console.error('❌ Error requesting affiliation:', error);
    throw error;
  }
}

// Helper function to get club user
async function getClubUser(userId, clubId) {
  try {
    const clubUsersRef = collection(db, 'clubs', clubId, 'users');
    const q = query(clubUsersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error('Error getting club user:', error);
    return null;
  }
}

/**
 * Approve affiliation (update user role in club)
 * OPTION A: Single source of truth - approval means updating role in clubs/{clubId}/users
 */
export async function approveAffiliation(affiliationId, approverId) {
  try {
    console.log('✅ [approveAffiliation] Updating user role in club:', affiliationId, 'by:', approverId);

    // Find the club user document
    const clubsSnap = await getDocs(collection(db, 'clubs'));

    for (const clubDoc of clubsSnap.docs) {
      const clubId = clubDoc.id;
      const clubUsersRef = collection(db, 'clubs', clubId, 'users');
      const userDoc = await getDoc(doc(clubUsersRef, affiliationId));

      if (userDoc.exists()) {
        // Update the user document with approval info
        await updateDoc(userDoc.ref, {
          status: 'active',
          approvedAt: Timestamp.now(),
          approvedBy: approverId,
          updatedAt: Timestamp.now(),
        });
        console.log('✅ [approveAffiliation] User role updated in club');
        return true;
      }
    }

    throw new Error('Affiliation not found');
  } catch (error) {
    console.error('❌ Error approving affiliation:', error);
    throw error;
  }
}

/**
 * Get club affiliations (for club admins)
 * OPTION A: Single source of truth - affiliations are club users in clubs/{clubId}/users
 */
export async function getClubAffiliations(clubId, status = null) {
  try {
    console.log('🏟️ [getClubAffiliations] Getting users for club:', clubId, 'status:', status);

    const clubUsersRef = collection(db, 'clubs', clubId, 'users');
    let q = query(clubUsersRef, orderBy('addedAt', 'desc'));

    if (status) {
      q = query(clubUsersRef, where('status', '==', status), orderBy('addedAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    const affiliations = [];

    for (const docSnap of snapshot.docs) {
      const data = { id: docSnap.id, ...docSnap.data() };

      // Get user info from root users collection
      try {
        const { getUser } = await import('./users.js');
        const userData = await getUser(data.userId);
        if (userData) {
          data.userName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email;
          data.userEmail = userData.email;
          data.userInfo = userData;
        }
      } catch (error) {
        console.warn('Error loading user info for', data.userId, ':', error);
      }

      // Convert club user data to affiliation format
      affiliations.push({
        id: data.id,
        userId: data.userId,
        clubId,
        role: data.role || AFFILIATION_ROLES.MEMBER,
        status: AFFILIATION_STATUS.APPROVED,
        requestedAt: data.addedAt,
        approvedAt: data.addedAt,
        approvedBy: data.addedBy,
        permissions: getRolePermissions(data.role || AFFILIATION_ROLES.MEMBER),
        userName: data.userName,
        userEmail: data.userEmail,
        userInfo: data.userInfo,
      });
    }

    console.log('✅ [getClubAffiliations] Found', affiliations.length, 'club users');
    return affiliations;
  } catch (error) {
    console.error('❌ Error getting club affiliations:', error);
    throw error;
  }
}

/**
 * Check if user is admin of specific club
 */
export async function isUserClubAdmin(userId, clubId) {
  try {
    const affiliations = await getUserAffiliations(userId);
    const adminAffiliation = affiliations.find(
      (a) =>
        a.clubId === clubId &&
        a.status === AFFILIATION_STATUS.APPROVED &&
        a.role === AFFILIATION_ROLES.ADMIN
    );

    return !!adminAffiliation;
  } catch (error) {
    console.error('❌ Error checking club admin status:', error);
    return false;
  }
}

/**
 * Get user's admin clubs
 */
export async function getUserAdminClubs(userId) {
  try {
    const affiliations = await getUserAffiliations(userId);
    return affiliations.filter(
      (a) => a.status === AFFILIATION_STATUS.APPROVED && a.role === AFFILIATION_ROLES.ADMIN
    );
  } catch (error) {
    console.error('❌ Error getting user admin clubs:', error);
    return [];
  }
}

/**
 * Update affiliation role (admin only)
 * OPTION A: Single source of truth - update role in clubs/{clubId}/users
 */
export async function updateAffiliationRole(affiliationId, newRole, updaterId) {
  try {
    console.log('🔄 [updateAffiliationRole] Updating role to:', newRole, 'for user:', affiliationId);

    // Find the club user document across all clubs
    const clubsSnap = await getDocs(collection(db, 'clubs'));

    for (const clubDoc of clubsSnap.docs) {
      const clubId = clubDoc.id;
      const clubUsersRef = collection(db, 'clubs', clubId, 'users');
      const userDoc = await getDoc(doc(clubUsersRef, affiliationId));

      if (userDoc.exists()) {
        await updateDoc(userDoc.ref, {
          role: newRole,
          permissions: getRolePermissions(newRole),
          updatedAt: Timestamp.now(),
          updatedBy: updaterId,
        });
        console.log('✅ [updateAffiliationRole] Role updated in club');
        return true;
      }
    }

    throw new Error('Affiliation not found');
  } catch (error) {
    console.error('❌ Error updating affiliation role:', error);
    throw error;
  }
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user has specific permission in club
 */
export async function userHasPermission(userId, clubId, permission) {
  try {
    const affiliations = await getUserAffiliations(userId);
    const affiliation = affiliations.find(
      (a) => a.clubId === clubId && a.status === AFFILIATION_STATUS.APPROVED
    );

    if (!affiliation) return false;

    return affiliation.permissions.includes(permission);
  } catch (error) {
    console.error('❌ Error checking user permission:', error);
    return false;
  }
}

// ==================== MIGRATION HELPERS ====================

/**
 * Migrate old affiliations to new system
 * OPTION A: Single source of truth - this function is now handled by the migration script
 * @deprecated Use the migration script 11-migrate-users-to-subcollections.js instead
 */
export async function migrateOldAffiliations() {
  console.warn('⚠️ migrateOldAffiliations is deprecated. Use the migration script instead.');
  console.log('🔄 Please run: node scripts/database-cleanup/11-migrate-users-to-subcollections.js');
  return 0;
}

// ==================== EXPORTS ====================

export default {
  // Main functions
  getUserAffiliations,
  requestAffiliation,
  approveAffiliation,
  getClubAffiliations,

  // Admin functions
  isUserClubAdmin,
  getUserAdminClubs,
  updateAffiliationRole,

  // Permission functions
  getRolePermissions,
  userHasPermission,

  // Migration
  migrateOldAffiliations,

  // Constants
  AFFILIATION_STATUS,
  AFFILIATION_ROLES,
  USER_PERMISSIONS,
};
