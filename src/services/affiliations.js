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
 */
export async function getUserAffiliations(userId) {
  try {
    const affiliationsRef = collection(db, 'affiliations');
    const q = query(
      affiliationsRef,
      where('userId', '==', userId)
      // TODO: Re-enable orderBy after creating Firestore index
      // orderBy('requestedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const affiliations = [];

    for (const docSnap of snapshot.docs) {
      const data = { id: docSnap.id, ...docSnap.data() };

      // Get club info
      try {
        const clubDoc = await getDoc(doc(db, 'clubs', data.clubId));
        if (clubDoc.exists()) {
          data.clubName = clubDoc.data().name;
          data.clubInfo = clubDoc.data();
        }
      } catch (error) {
        console.warn('Error loading club info for', data.clubId, ':', error);
      }

      // Add permissions
      data.permissions = getRolePermissions(data.role);

      affiliations.push(data);
    }

    return affiliations;
  } catch (error) {
    console.error('❌ Error getting user affiliations:', error);
    throw error;
  }
}

/**
 * Create new affiliation request
 */
export async function requestAffiliation(userId, clubId, requestedRole = AFFILIATION_ROLES.MEMBER) {
  try {
    console.log('📝 Creating affiliation request:', { userId, clubId, requestedRole });

    // Check if already exists
    const existingRef = collection(db, 'affiliations');
    const existingQuery = query(
      existingRef,
      where('userId', '==', userId),
      where('clubId', '==', clubId)
    );

    const existingSnap = await getDocs(existingQuery);
    if (!existingSnap.empty) {
      const existing = existingSnap.docs[0].data();
      if (existing.status === AFFILIATION_STATUS.APPROVED) {
        throw new Error('Sei già affiliato a questo club');
      } else if (existing.status === AFFILIATION_STATUS.PENDING) {
        throw new Error('Hai già una richiesta in attesa per questo club');
      }
    }

    const affiliation = {
      userId,
      clubId,
      role: requestedRole,
      status: AFFILIATION_STATUS.PENDING,
      requestedAt: Timestamp.now(),
      permissions: getRolePermissions(requestedRole),
      version: 1,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'affiliations'), affiliation);

    console.log('✅ Affiliation request created:', docRef.id);
    return { id: docRef.id, ...affiliation };
  } catch (error) {
    console.error('❌ Error creating affiliation request:', error);
    throw error;
  }
}

/**
 * Approve affiliation (admin only)
 */
export async function approveAffiliation(affiliationId, approverId) {
  try {
    console.log('✅ Approving affiliation:', affiliationId, 'by:', approverId);

    const affiliationRef = doc(db, 'affiliations', affiliationId);

    await updateDoc(affiliationRef, {
      status: AFFILIATION_STATUS.APPROVED,
      approvedAt: Timestamp.now(),
      approvedBy: approverId,
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Affiliation approved');
    return true;
  } catch (error) {
    console.error('❌ Error approving affiliation:', error);
    throw error;
  }
}

/**
 * Get club affiliations (for club admins)
 */
export async function getClubAffiliations(clubId, status = null) {
  try {
    console.log('🏟️ Getting club affiliations for:', clubId, 'status:', status);

    const affiliationsRef = collection(db, 'affiliations');
    let q = query(affiliationsRef, where('clubId', '==', clubId), orderBy('requestedAt', 'desc'));

    if (status) {
      q = query(
        affiliationsRef,
        where('clubId', '==', clubId),
        where('status', '==', status),
        orderBy('requestedAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    const affiliations = [];

    for (const docSnap of snapshot.docs) {
      const data = { id: docSnap.id, ...docSnap.data() };

      // Get user info
      try {
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          data.userName =
            `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email;
          data.userEmail = userData.email;
          data.userInfo = userData;
        }
      } catch (error) {
        console.warn('Error loading user info for', data.userId, ':', error);
      }

      affiliations.push(data);
    }

    console.log('✅ Found club affiliations:', affiliations.length);
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
 */
export async function updateAffiliationRole(affiliationId, newRole, updaterId) {
  try {
    console.log('🔄 Updating affiliation role:', affiliationId, 'to:', newRole);

    const affiliationRef = doc(db, 'affiliations', affiliationId);

    await updateDoc(affiliationRef, {
      role: newRole,
      permissions: getRolePermissions(newRole),
      updatedAt: Timestamp.now(),
      updatedBy: updaterId,
    });

    console.log('✅ Affiliation role updated');
    return true;
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
 * Migrate old profile-based affiliations to new system
 */
export async function migrateOldAffiliations() {
  try {
    console.log('🔄 Starting affiliation migration...');

    // Get all clubs
    const clubsSnap = await getDocs(collection(db, 'clubs'));
    let migrated = 0;

    for (const clubDoc of clubsSnap.docs) {
      const clubId = clubDoc.id;
      console.log(`📂 Processing club: ${clubId}`);

      // Get profiles in this club
      const profilesSnap = await getDocs(collection(db, 'clubs', clubId, 'profiles'));

      for (const profileDoc of profilesSnap.docs) {
        const profile = profileDoc.data();

        // Skip if already migrated or invalid
        if (!profile.email || profile.migrated) continue;

        // Find corresponding user in new users collection
        const usersQuery = query(collection(db, 'users'), where('email', '==', profile.email));

        const usersSnap = await getDocs(usersQuery);
        if (usersSnap.empty) {
          console.warn(`⚠️ No user found for profile: ${profile.email}`);
          continue;
        }

        const userId = usersSnap.docs[0].id;

        // Determine role
        let role = AFFILIATION_ROLES.MEMBER;
        if (profile.isClubAdmin || profile.role === 'admin') {
          role = AFFILIATION_ROLES.ADMIN;
        } else if (profile.role === 'instructor') {
          role = AFFILIATION_ROLES.INSTRUCTOR;
        }

        // Create affiliation
        const affiliation = {
          userId,
          clubId,
          role,
          status: AFFILIATION_STATUS.APPROVED,
          requestedAt: profile.createdAt || Timestamp.now(),
          approvedAt: profile.createdAt || Timestamp.now(),
          approvedBy: 'system_migration',
          permissions: getRolePermissions(role),
          migratedFrom: 'profiles',
          version: 1,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        try {
          await addDoc(collection(db, 'affiliations'), affiliation);

          // Mark profile as migrated
          await updateDoc(profileDoc.ref, {
            migrated: true,
            migratedAt: Timestamp.now(),
          });

          migrated++;
          console.log(`✅ Migrated: ${profile.email} → ${role} in ${clubId}`);
        } catch (error) {
          console.error(`❌ Failed to migrate ${profile.email}:`, error);
        }
      }
    }

    console.log(`🎉 Migration completed! Migrated ${migrated} affiliations`);
    return migrated;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
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
