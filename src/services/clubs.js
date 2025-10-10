// =============================================
// FILE: src/services/clubs.js
// =============================================
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAt,
  endAt,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { AFFILIATION_STATUS } from '@contexts/AuthContext.jsx';
import { clubsErrorHandler, withRetry, FIRESTORE_ERROR_CODES } from '../utils/errorHandler.js';

// Costante per il club principale
const MAIN_CLUB_ID = 'sporting-cat';

// =============================================
// CLUB MANAGEMENT
// =============================================

/**
 * Get all clubs with optional filters
 */
export const getClubs = async (filters = {}) => {
  try {
    const clubsRef = collection(db, 'clubs');
    let q = query(clubsRef, orderBy('name'));

    // Apply filters
    if (filters.city) {
      q = query(q, where('location.city', '==', filters.city));
    }

    if (filters.region) {
      q = query(q, where('location.region', '==', filters.region));
    }

    if (filters.publicOnly) {
      q = query(q, where('settings.publicVisibility', '==', true));
    }

    if (filters.activeOnly) {
      q = query(q, where('subscription.isActive', '==', true));
    }

    const snapshot = await getDocs(q);

    // Filter for activated AND approved clubs (unless explicitly requesting all)
    const clubs = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((club) => {
        // If filters.includeInactive is true, show all clubs (for admin/super-admin)
        if (filters.includeInactive) return true;
        // Otherwise only show activated AND approved clubs
        return club.isActive === true && club.status === 'approved';
      });

    return clubs;
  } catch (error) {
    console.error('Error getting clubs:', error);
    throw error;
  }
};

/**
 * Search clubs by text query (name, city, description)
 */
export const searchClubs = async (searchQuery, options = {}) => {
  try {
    console.log('🔍 Searching clubs with query:', searchQuery, 'options:', options);

    const clubsRef = collection(db, 'clubs');
    const normalizedQuery = searchQuery.toLowerCase().trim();

    // Fallback approach: get all clubs and filter in JavaScript
    // This is less efficient but more reliable when indexed fields don't exist
    let q = query(clubsRef);

    // Apply limit if specified
    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    console.log('🔍 Executing Firestore query...');
    const snapshot = await getDocs(q);
    console.log('🔍 Retrieved', snapshot.docs.length, 'clubs from database');

    const clubs = [];
    snapshot.docs.forEach((doc) => {
      const clubData = doc.data();
      console.log('🔍 Processing club:', doc.id, clubData.name);

      // Check visibility, subscription, AND activation status
      const isVisible = clubData.settings?.publicVisibility !== false; // default to true
      const isSubscriptionActive = clubData.subscription?.isActive !== false; // default to true
      const isClubActive = clubData.isActive === true; // MUST be explicitly true for activation system

      if (isVisible && isSubscriptionActive && isClubActive) {
        // Search in club name, city, region, and description
        const searchFields = [
          clubData.name || '',
          clubData.location?.city || '',
          clubData.location?.region || '',
          clubData.description || '',
        ].map((field) => field.toLowerCase());

        const matchesQuery = searchFields.some((field) => field.includes(normalizedQuery));

        if (matchesQuery) {
          clubs.push({
            id: doc.id,
            ...clubData,
          });
        }
      }
    });

    console.log('🔍 Found', clubs.length, 'matching clubs');
    return clubs.slice(0, options.limit || 20);
  } catch (error) {
    console.error('Error searching clubs:', error);
    throw error;
  }
};

/**
 * Get clubs within geographic radius (simplified version)
 * For production, consider using GeoFirestore
 */
export const searchClubsByLocation = async (userLat, userLng, radiusKm = 10) => {
  try {
    // Simple bounding box approach
    // For accurate geo search, implement proper geohashing
    const lat_delta = radiusKm / 111; // 1 degree lat ≈ 111km
    const lng_delta = radiusKm / (111 * Math.cos((userLat * Math.PI) / 180));

    const clubsRef = collection(db, 'clubs');
    // Simplified query to avoid composite index requirement
    // We'll filter the rest in JavaScript
    const q = query(
      clubsRef,
      where('location.coordinates.lat', '>=', userLat - lat_delta),
      where('location.coordinates.lat', '<=', userLat + lat_delta)
    );

    const snapshot = await getDocs(q);
    const clubs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by additional criteria in JavaScript
    return clubs
      .filter((club) => {
        // Check public visibility, active subscription, AND activation status
        if (!club.settings?.publicVisibility || !club.subscription?.isActive) {
          return false;
        }

        // Check if club is activated
        if (club.isActive !== true) {
          return false;
        }

        // Check longitude bounds
        const lngDiff = Math.abs(club.location.coordinates.lng - userLng);
        return lngDiff <= lng_delta;
      })
      .map((club) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          club.location.coordinates.lat,
          club.location.coordinates.lng
        );
        return { ...club, distance };
      })
      .filter((club) => club.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error searching clubs by location:', error);
    throw error;
  }
};

/**
 * Get single club by ID
 */
export const getClub = async (clubId) => {
  try {
    const clubRef = doc(db, 'clubs', clubId);
    const clubSnap = await getDoc(clubRef);

    if (!clubSnap.exists()) {
      throw new Error('Club not found');
    }

    return {
      id: clubSnap.id,
      ...clubSnap.data(),
    };
  } catch (error) {
    console.error('Error getting club:', error);
    throw error;
  }
};

/**
 * Create new club (admin only)
 */
export const createClub = async (clubData) => {
  try {
    const clubsRef = collection(db, 'clubs');

    // Prepare club data with search fields
    const enrichedData = {
      ...clubData,
      name_lowercase: clubData.name.toLowerCase(),
      'location.city_lowercase': clubData.location.city.toLowerCase(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      subscription: {
        type: 'basic',
        isActive: true,
        startDate: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ...clubData.subscription,
      },
      settings: {
        publicVisibility: true,
        allowGuestBookings: false,
        requireMembership: true,
        autoApproveAffiliations: false,
        ...clubData.settings,
      },
      stats: {
        totalMembers: 0,
        totalCourts: clubData.courts?.length || 0,
        totalBookings: 0,
        ...clubData.stats,
      },
    };

    const docRef = await addDoc(clubsRef, enrichedData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating club:', error);
    throw error;
  }
};

/**
 * Update club (admin/club manager only)
 */
export const updateClub = async (clubId, updateData) => {
  try {
    const clubRef = doc(db, 'clubs', clubId);

    // Add search fields if name or city changed
    const enrichedData = { ...updateData };
    if (updateData.name) {
      enrichedData.name_lowercase = updateData.name.toLowerCase();
    }
    if (updateData.location?.city) {
      enrichedData['location.city_lowercase'] = updateData.location.city.toLowerCase();
    }

    enrichedData.updatedAt = serverTimestamp();

    await updateDoc(clubRef, enrichedData);
  } catch (error) {
    console.error('Error updating club:', error);
    throw error;
  }
};

/**
 * Delete club (admin only)
 */
export const deleteClub = async (clubId) => {
  try {
    const clubRef = doc(db, 'clubs', clubId);
    await deleteDoc(clubRef);
  } catch (error) {
    console.error('Error deleting club:', error);
    throw error;
  }
};

// =============================================
// AFFILIATION MANAGEMENT
// =============================================

/**
 * Get user affiliations
 * @deprecated Use getUserClubMemberships from club-users.js instead
 * This function is kept for backward compatibility
 */
export const getUserAffiliations = async (userId) => {
  console.warn(
    '⚠️  getUserAffiliations is DEPRECATED. Use getUserClubMemberships from club-users.js'
  );

  // Handle admin user - return empty array to avoid Firestore access
  if (userId === 'admin-paris-25') {
    console.log('🔄 Bypassing affiliations check for admin user');
    return [];
  }

  const operationKey = `getUserAffiliations_${userId}`;

  // Check if in cooldown
  if (clubsErrorHandler.isInCooldown(operationKey)) {
    console.info(`[getUserAffiliations] In cooldown, returning cached data for ${userId}`);
    return clubsErrorHandler.cache.get(operationKey)?.data || [];
  }

  try {
    // 🆕 NEW SYSTEM: Use getUserClubMemberships from club-users.js
    // This reads clubs/{clubId}/users/ with linkedUserId
    const { getUserClubMemberships } = await import('./club-users.js');

    const result = await withRetry(
      async () => {
        const memberships = await getUserClubMemberships(userId);

        // Transform to match old affiliations format for compatibility
        const affiliations = await Promise.all(
          memberships.map(async (membership) => {
            try {
              const club = await getClub(membership.clubId);
              return {
                id: `${userId}_${membership.clubId}`, // Simulate old ID format
                userId,
                clubId: membership.clubId,
                role: membership.role,
                status: membership.status === 'active' ? 'approved' : membership.status,
                requestedAt: membership.addedAt || new Date(),
                club,
                // Keep linkedUserId for new system
                linkedUserId: membership.linkedUserId,
                clubUserDocId: membership.clubUserDocId,
              };
            } catch (error) {
              console.warn(`Error loading club ${membership.clubId}:`, error.message);
              return {
                userId,
                clubId: membership.clubId,
                role: membership.role,
                status: membership.status === 'active' ? 'approved' : membership.status,
                club: {
                  id: membership.clubId,
                  name: membership.clubName || `Club ${membership.clubId}`,
                  error: true,
                },
              };
            }
          })
        );

        return affiliations;
      },
      2,
      1000
    ); // Max 2 retries with 1s initial delay

    // Cache successful result
    clubsErrorHandler.cacheResult(operationKey, result);
    return result;
  } catch (error) {
    console.error('[getUserAffiliations] Error:', error);

    // Use error handler for consistent fallback behavior
    return await clubsErrorHandler.handleError(
      operationKey,
      error,
      [], // Fallback to empty array
      {
        enableCache: true,
        enableCooldown: error.code === FIRESTORE_ERROR_CODES.PERMISSION_DENIED,
      }
    );
  }
};

/**
 * Get club affiliations (for club managers)
 * @deprecated Use getClubUsers from club-users.js instead
 * This function is kept for backward compatibility
 */
export const getClubAffiliations = async (clubId, status = null) => {
  console.warn('⚠️  getClubAffiliations is DEPRECATED. Use getClubUsers from club-users.js');

  try {
    // 🆕 NEW SYSTEM: Query clubs/{clubId}/users/ directly
    const usersRef = collection(db, 'clubs', clubId, 'users');
    let q;

    if (status) {
      // Map old status to new status
      const newStatus = status === 'approved' ? 'active' : status;
      q = query(usersRef, where('status', '==', newStatus));
    } else {
      q = usersRef;
    }

    const snapshot = await getDocs(q);
    const affiliations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.linkedUserId || data.userId, // Try linkedUserId first
        clubId,
        role: data.role,
        status: data.status === 'active' ? 'approved' : data.status, // Map new to old
        requestedAt: data.addedAt || data.createdAt || new Date(),
        // Include new fields
        linkedUserId: data.linkedUserId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        ...data,
      };
    });

    // Sort by requestedAt in JavaScript (most recent first)
    affiliations.sort((a, b) => {
      const dateA = a.requestedAt?.toDate?.() || new Date(a.requestedAt) || new Date(0);
      const dateB = b.requestedAt?.toDate?.() || new Date(b.requestedAt) || new Date(0);
      return dateB - dateA;
    });

    return affiliations;
  } catch (error) {
    console.error('Error getting club affiliations:', error);
    throw error;
  }
};

/**
 * Request club affiliation
 * @deprecated Use addUserToClub from club-users.js instead
 * This function is kept for backward compatibility
 */
export const requestAffiliation = async (clubId, userId, notes = '') => {
  console.warn('⚠️  requestAffiliation is DEPRECATED. Use addUserToClub from club-users.js');

  try {
    // Check if user already exists in club
    const { getClubUser, addUserToClub } = await import('./club-users.js');
    const existing = await getClubUser(clubId, userId);

    if (existing) {
      if (existing.status === 'pending') {
        throw new Error('Hai già una richiesta di affiliazione in corso per questo club');
      }
      if (existing.status === 'active') {
        throw new Error('Sei già affiliato a questo club');
      }
      // If rejected or inactive, allow new request
    }

    // 🆕 NEW SYSTEM: Add user to clubs/{clubId}/users/ with status='pending'
    const result = await addUserToClub(clubId, userId, {
      role: 'member',
      status: 'pending',
      notes: notes.trim(),
    });

    return result.id;
  } catch (error) {
    console.error('Error requesting affiliation:', error);
    throw error;
  }
};

/**
 * Approve/reject affiliation (club manager only)
 */
export const updateAffiliationStatus = async (affiliationId, status, approverId, notes = '') => {
  try {
    const affiliationRef = doc(db, 'affiliations', affiliationId);

    const updateData = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === AFFILIATION_STATUS.APPROVED) {
      updateData.approvedAt = serverTimestamp();
      updateData.approvedBy = approverId;

      // Update club member count
      const affiliation = await getDoc(affiliationRef);
      if (affiliation.exists()) {
        const clubRef = doc(db, 'clubs', affiliation.data().clubId);
        await updateDoc(clubRef, {
          'stats.totalMembers': (await getDoc(clubRef)).data()?.stats?.totalMembers + 1 || 1,
        });
      }
    }

    if (notes) {
      updateData.adminNotes = notes;
    }

    await updateDoc(affiliationRef, updateData);
  } catch (error) {
    console.error('Error updating affiliation status:', error);
    throw error;
  }
};

/**
 * Get existing affiliation between user and club
 */
export const getExistingAffiliation = async (clubId, userId) => {
  try {
    const affiliationsRef = collection(db, 'clubs', clubId, 'affiliations');
    const q = query(affiliationsRef, where('userId', '==', userId));

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    // Sort by requestedAt in JavaScript to get the most recent
    const affiliations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    affiliations.sort((a, b) => {
      const dateA = a.requestedAt?.toDate?.() || new Date(a.requestedAt) || new Date(0);
      const dateB = b.requestedAt?.toDate?.() || new Date(b.requestedAt) || new Date(0);
      return dateB - dateA;
    });

    return affiliations[0]; // Return the most recent
  } catch (error) {
    console.error('Error getting existing affiliation:', error);
    return null;
  }
};

// =============================================
// HELPER FUNCTIONS
// =============================================

const toRadians = (degrees) => degrees * (Math.PI / 180);

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if user can access club
 */
export const canAccessClub = async (clubId, userId) => {
  try {
    const club = await getClub(clubId);

    // Check if user is admin (in development mode, all users are admin)
    // In production, you would check user role from database
    if (import.meta.env.DEV) {
      return { canAccess: true, level: 'admin' };
    }

    // Public clubs allow preview access
    if (club.settings.publicVisibility) {
      return { canAccess: true, level: 'preview' };
    }

    // Check affiliation for full access
    const affiliation = await getExistingAffiliation(clubId, userId);
    if (affiliation && affiliation.status === AFFILIATION_STATUS.APPROVED) {
      return { canAccess: true, level: 'full', affiliation };
    }

    return { canAccess: false, level: 'none' };
  } catch (error) {
    console.error('Error checking club access:', error);
    return { canAccess: false, level: 'none' };
  }
};

// =============================================
// USER CLUB ROLES MANAGEMENT
// =============================================

/**
 * Get user roles for all clubs
 */
let _rolesPermissionWarned = false;
let _rolesPermissionDeniedUntil = 0; // timestamp ms for cooldown
const ROLES_PERMISSION_COOLDOWN_MS = 60000; // 60s
const _rolesCache = new Map(); // userId -> { data, ts }

export const getUserClubRoles = async (userId) => {
  if (!userId) return {};
  const now = Date.now();
  if (now < _rolesPermissionDeniedUntil) {
    const cached = _rolesCache.get(userId);
    return cached?.data || {};
  }
  const cached = _rolesCache.get(userId);
  if (cached && now - cached.ts < 30000) {
    return cached.data;
  }
  try {
    // NEW: Use global affiliations collection instead of userClubRoles subcollection
    const affiliationsRef = collection(db, 'affiliations');
    const q = query(
      affiliationsRef,
      where('userId', '==', userId),
      where('status', '==', 'approved')
    );
    const snapshot = await getDocs(q);
    const roles = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data?.clubId && data?.role) {
        roles[data.clubId] = data.role;
      }
    });
    _rolesCache.set(userId, { data: roles, ts: now });
    return roles;
  } catch (error) {
    const msg = String(error?.message || '');
    if (msg.includes('Missing or insufficient permissions')) {
      if (!_rolesPermissionWarned) {
        console.warn(
          "[getUserClubRoles] permission denied – assicurarsi di aver definito regole Firestore per affiliations (lettura limitata all'utente). Cooldown 60s."
        );
        _rolesPermissionWarned = true;
      }
      _rolesPermissionDeniedUntil = Date.now() + ROLES_PERMISSION_COOLDOWN_MS;
      return cached?.data || {};
    }
    console.error('Error loading user club roles:', error);
    return cached?.data || {};
  }
};

/**
 * Set user role for a specific club
 */
export const setUserClubRole = async (userId, clubId, role) => {
  try {
    const rolesRef = collection(db, 'clubs', clubId, 'userClubRoles');

    // Check if role already exists
    const q = query(rolesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Update existing role
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, {
        role,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create new role
      await addDoc(rolesRef, {
        userId,
        clubId,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return true;
  } catch (error) {
    console.error('Error setting user club role:', error);
    throw error;
  }
};

/**
 * Remove user role for a specific club
 */
export const removeUserClubRole = async (userId, clubId) => {
  try {
    const rolesRef = collection(db, 'clubs', clubId, 'userClubRoles');
    const q = query(rolesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error removing user club role:', error);
    throw error;
  }
};

/**
 * Reset all cooldowns and caches (useful for logout)
 */
export const resetClubsCooldowns = () => {
  _rolesPermissionDeniedUntil = 0;
  clubsErrorHandler.clearAll();
};

export default {
  getClubs,
  searchClubs,
  searchClubsByLocation,
  getClub,
  createClub,
  updateClub,
  deleteClub,
  getUserAffiliations,
  getClubAffiliations,
  requestAffiliation,
  updateAffiliationStatus,
  getExistingAffiliation,
  calculateDistance,
  canAccessClub,
  getUserClubRoles,
  setUserClubRole,
  removeUserClubRole,
  resetClubsCooldowns,
};
