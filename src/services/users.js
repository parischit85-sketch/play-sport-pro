// =============================================
// FILE: src/services/users.js
// Servizio per gestione collezione `users` unificata
// =============================================

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase.js';

// =============================================
// CONSTANTS
// =============================================

export const USER_GLOBAL_ROLES = {
  USER: 'user',
  SUPER_ADMIN: 'super_admin',
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

// =============================================
// USER MANAGEMENT
// =============================================

/**
 * Get user data by UID
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} User data or null if not found
 */
export async function getUser(uid) {
  if (!uid) return null;

  try {
    console.log('🔍 [getUser] Attempting to read user from Firestore:', { uid });
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = { uid, ...userSnap.data() };
      console.log('✅ [getUser] User data retrieved successfully:', {
        uid,
        role: userData.role,
        email: userData.email,
        clubId: userData.clubId,
        hasAllFields: {
          role: !!userData.role,
          email: !!userData.email,
          firstName: !!userData.firstName,
          lastName: !!userData.lastName,
        },
      });
      return userData;
    }

    console.warn('⚠️ [getUser] User document does not exist:', { uid });
    return null;
  } catch (error) {
    console.error('❌ [getUser] Firestore permission error or other error:', {
      uid,
      errorCode: error?.code,
      errorMessage: error?.message,
      fullError: error,
    });
    throw error;
  }
}

/**
 * Create new user record
 * @param {string} uid - User ID
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user data
 */
export async function createUser(uid, userData) {
  if (!uid) throw new Error('UID is required');

  const now = serverTimestamp();

  const newUser = {
    // Required fields
    email: userData.email || '',
    displayName: userData.displayName || userData.firstName || 'Utente',
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',

    // System fields
    globalRole: userData.globalRole || USER_GLOBAL_ROLES.USER,
    status: userData.status || USER_STATUS.ACTIVE,
    isActive: userData.isActive !== false,
    registeredAt: userData.registeredAt || now,
    lastLoginAt: now,

    // Optional profile fields
    phone: userData.phone || '',
    avatar: userData.avatar || '',
    bio: userData.bio || '',
    dateOfBirth: userData.dateOfBirth || null,

    // System metadata
    version: 1,
    createdAt: now,
    updatedAt: now,

    // Keep any additional fields provided
    ...userData,
  };

  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, newUser);

    console.log('✅ User created:', uid);
    return { uid, ...newUser };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user data
 * @param {string} uid - User ID
 * @param {Object} updates - Data to update
 * @returns {Promise<Object>} Updated user data
 */
export async function updateUser(uid, updates) {
  if (!uid) throw new Error('UID is required');

  console.log('🔍 [USERS] updateUser called:', { uid, updates: JSON.stringify(updates, null, 2) });

  try {
    // Verifica prima se l'utente esiste
    const exists = await userExists(uid);
    console.log('🔍 [USERS] User exists check:', exists);

    if (!exists) {
      console.log('⚠️ [USERS] User does not exist, creating new user...');
      // Se l'utente non esiste, crealo invece di lanciare errore
      // Questo permette di usare updateUser sia per create che per update
      return await createUser(uid, updates);
    }

    const userRef = doc(db, 'users', uid);

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    console.log('🔍 [USERS] Writing to Firestore:', JSON.stringify(updateData, null, 2));
    await updateDoc(userRef, updateData);
    console.log('✅ [USERS] Firestore write completed');

    // Return updated user data
    const updatedUser = await getUser(uid);
    console.log('🔍 [USERS] Retrieved updated user:', JSON.stringify(updatedUser, null, 2));
    return updatedUser;
  } catch (error) {
    console.error('❌ [USERS] Error updating user:', error);
    throw error;
  }
}

/**
 * Update user's last login timestamp
 * @param {string} uid - User ID
 */
export async function updateLastLogin(uid) {
  if (!uid) return;

  try {
    // Verifica prima se l'utente esiste
    const exists = await userExists(uid);
    if (!exists) {
      console.warn('Cannot update last login: user does not exist:', uid);
      return;
    }

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    // Non-critical error, don't throw
  }
}

/**
 * Check if user exists
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} True if user exists
 */
export async function userExists(uid) {
  if (!uid) return false;

  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
}

/**
 * Create user if doesn't exist (from Firebase Auth)
 * @param {Object} firebaseUser - Firebase Auth user
 * @returns {Promise<Object>} User data
 */
export async function createUserIfNeeded(firebaseUser) {
  if (!firebaseUser?.uid) throw new Error('Invalid Firebase user');

  const exists = await userExists(firebaseUser.uid);

  if (exists) {
    // Update last login and return existing user
    await updateLastLogin(firebaseUser.uid);
    return await getUser(firebaseUser.uid);
  }

  // Create new user from Firebase Auth data
  const userData = {
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || 'Utente',
    firstName: extractFirstName(firebaseUser.displayName),
    lastName: extractLastName(firebaseUser.displayName),
    avatar: firebaseUser.photoURL || '',
    role: 'user', // Default role for Firestore rules compatibility
    globalRole: USER_GLOBAL_ROLES.USER,
    status: USER_STATUS.ACTIVE,
    isActive: true,
  };

  return await createUser(firebaseUser.uid, userData);
}

// =============================================
// SEARCH & LIST
// =============================================

/**
 * Search users by email or name
 * @param {string} searchTerm - Search term
 * @param {number} maxResults - Max results to return
 * @returns {Promise<Array>} Array of users
 */
export async function searchUsers(searchTerm, maxResults = 20) {
  if (!searchTerm || searchTerm.length < 2) return [];

  try {
    const usersRef = collection(db, 'users');
    const searchLower = searchTerm.toLowerCase();

    // Search by email (no isActive filter to avoid index requirement)
    const emailQuery = query(
      usersRef,
      where('email', '>=', searchLower),
      where('email', '<=', searchLower + '\uf8ff'),
      orderBy('email'),
      limit(maxResults * 2) // Get more to filter client-side
    );

    const emailSnap = await getDocs(emailQuery);
    const results = [];

    emailSnap.forEach((doc) => {
      const userData = doc.data();
      // Filter only active users client-side
      if (userData.isActive !== false) {
        results.push({ uid: doc.id, ...userData });
      }
    });

    // If we have results, return them
    if (results.length > 0) {
      return results.slice(0, maxResults);
    }

    // If no email matches, try searching by displayName or firstName/lastName
    // This requires getting all users and filtering client-side (not ideal for large datasets)
    const allUsersQuery = query(usersRef, limit(100));
    const allUsersSnap = await getDocs(allUsersQuery);

    allUsersSnap.forEach((doc) => {
      const userData = doc.data();
      if (userData.isActive === false) return;

      const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.toLowerCase();
      const displayName = (userData.displayName || '').toLowerCase();
      const phone = (userData.phone || '').replace(/\s/g, '');
      const searchPhone = searchTerm.replace(/\s/g, '');

      if (
        fullName.includes(searchLower) ||
        displayName.includes(searchLower) ||
        phone.includes(searchPhone)
      ) {
        results.push({ uid: doc.id, ...userData });
      }
    });

    // Remove duplicates and limit
    const uniqueResults = Array.from(new Map(results.map((user) => [user.uid, user])).values());

    return uniqueResults.slice(0, maxResults);
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

/**
 * Get users by IDs (for affiliations, etc.)
 * @param {Array<string>} uids - Array of user IDs
 * @returns {Promise<Array>} Array of users
 */
export async function getUsersByIds(uids) {
  if (!Array.isArray(uids) || uids.length === 0) return [];

  try {
    const users = await Promise.all(uids.map((uid) => getUser(uid)));

    return users.filter(Boolean); // Remove null values
  } catch (error) {
    console.error('Error getting users by IDs:', error);
    return [];
  }
}

/**
 * Get all users (for admin purposes)
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} Array of user data
 */
export async function getAllUsers(maxResults = 500) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('registeredAt', 'desc'), limit(maxResults));
    const querySnapshot = await getDocs(q);

    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() });
    });

    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

// =============================================
// UTILITIES
// =============================================

/**
 * Extract first name from display name
 * @param {string} displayName - Full display name
 * @returns {string} First name
 */
function extractFirstName(displayName) {
  if (!displayName) return '';
  return displayName.split(' ')[0] || '';
}

/**
 * Extract last name from display name
 * @param {string} displayName - Full display name
 * @returns {string} Last name
 */
function extractLastName(displayName) {
  if (!displayName) return '';
  const parts = displayName.split(' ');
  return parts.length > 1 ? parts.slice(1).join(' ') : '';
}

/**
 * Generate display name from first and last name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Display name
 */
export function generateDisplayName(firstName, lastName) {
  return `${firstName || ''} ${lastName || ''}`.trim() || 'Utente';
}

/**
 * Validate user data
 * @param {Object} userData - User data to validate
 * @returns {Array} Array of validation errors
 */
export function validateUserData(userData) {
  const errors = [];

  if (!userData.email) {
    errors.push('Email is required');
  }

  if (!userData.firstName && !userData.displayName) {
    errors.push('First name or display name is required');
  }

  return errors;
}
