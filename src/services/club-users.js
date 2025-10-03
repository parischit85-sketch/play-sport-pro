// =============================================
// FILE: src/services/club-users.js
// Nuovo sistema per gestione utenti dei circoli
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
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase.js';

// =============================================
// SEARCH USERS
// =============================================

/**
 * Search registered users by name, email, or phone
 * @param {string} searchTerm - Search term
 * @param {number} maxResults - Max results to return
 * @returns {Promise<Array>} Array of users
 */
export async function searchRegisteredUsers(searchTerm, maxResults = 20) {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  try {
    const usersRef = collection(db, 'users');
    const searchLower = searchTerm.toLowerCase();
    
    // Search by email
    const emailQuery = query(
      usersRef,
      where('email', '>=', searchLower),
      where('email', '<=', searchLower + '\uf8ff'),
      where('isActive', '==', true),
      limit(maxResults)
    );
    
    // Search by phone
    const phoneQuery = query(
      usersRef,
      where('phone', '>=', searchTerm),
      where('phone', '<=', searchTerm + '\uf8ff'),
      where('isActive', '==', true),
      limit(maxResults)
    );
    
    const [emailResults, phoneResults] = await Promise.all([
      getDocs(emailQuery),
      getDocs(phoneQuery)
    ]);
    
    const users = new Map();
    
    // Add email results
    emailResults.docs.forEach(doc => {
      const userData = { uid: doc.id, ...doc.data() };
      users.set(doc.id, userData);
    });
    
    // Add phone results
    phoneResults.docs.forEach(doc => {
      const userData = { uid: doc.id, ...doc.data() };
      users.set(doc.id, userData);
    });
    
    // Search by name (firstName + lastName)
    const allUsersQuery = query(
      usersRef,
      where('isActive', '==', true),
      limit(500) // Reasonable limit for name search
    );
    
    const allUsersSnapshot = await getDocs(allUsersQuery);
    
    allUsersSnapshot.docs.forEach(doc => {
      const userData = { uid: doc.id, ...doc.data() };
      const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.toLowerCase();
      
      if (fullName.includes(searchLower)) {
        users.set(doc.id, userData);
      }
    });
    
    return Array.from(users.values()).slice(0, maxResults);
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

// =============================================
// CLUB USERS MANAGEMENT
// =============================================

/**
 * Add user to club's user list
 * @param {string} clubId - Club ID
 * @param {string} userId - User ID
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Club user data
 */
export async function addUserToClub(clubId, userId, options = {}) {
  if (!clubId || !userId) throw new Error('Club ID and User ID required');
  
  try {
    // Check if user is already in club
    const existingClubUser = await getClubUser(clubId, userId);
    if (existingClubUser) {
      throw new Error('User is already in this club');
    }
    
    // Get user data
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userSnap.data();
    
    // Create club user record
    const clubUserData = {
      userId,
      clubId,
      userEmail: userData.email,
      userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      userPhone: userData.phone || '',
      role: options.role || 'player',
      status: 'active',
      addedAt: serverTimestamp(),
      addedBy: options.addedBy || null,
      notes: options.notes || '',
      // Keep reference to original user data
      originalUserData: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        displayName: userData.displayName
      }
    };
    
    const clubUsersRef = collection(db, 'clubs', clubId, 'users');
    const docRef = await addDoc(clubUsersRef, clubUserData);
    
    console.log('✅ User added to club:', userId, 'to club:', clubId);
    
    return { id: docRef.id, ...clubUserData };
  } catch (error) {
    console.error('Error adding user to club:', error);
    throw error;
  }
}

/**
 * Get club user
 * @param {string} clubId - Club ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Club user data or null
 */
export async function getClubUser(clubId, userId) {
  if (!clubId || !userId) return null;
  
  try {
    const clubUsersRef = collection(db, 'clubs', clubId, 'users');
    const q = query(clubUsersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error getting club user:', error);
    return null;
  }
}

/**
 * Get all users for a club
 * @param {string} clubId - Club ID
 * @returns {Promise<Array>} Array of club users
 */
export async function getClubUsers(clubId) {
  if (!clubId) return [];
  
  try {
    console.log('🔍 [getClubUsers] Getting users for club:', clubId);
    const clubUsersRef = collection(db, 'clubs', clubId, 'users');
    // Temporarily remove orderBy to avoid index requirement
    const q = query(clubUsersRef, where('status', '==', 'active'));
    
    const snapshot = await getDocs(q);
    console.log('🔍 [getClubUsers] Found', snapshot.docs.length, 'active users in club:', clubId);
    
    const users = [];
    
    snapshot.docs.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('🔍 [getClubUsers] Returning', users.length, 'users');
    // Sort in memory instead of using orderBy
    return users.sort((a, b) => (a.userName || '').localeCompare(b.userName || ''));
  } catch (error) {
    console.error('❌ [getClubUsers] Error getting club users:', error);
    return [];
  }
}

/**
 * Link existing club profile to registered user
 * @param {string} clubId - Club ID
 * @param {string} existingProfileId - Existing profile ID in club
 * @param {string} registeredUserId - Registered user ID
 * @returns {Promise<Object>} Updated club user data
 */
export async function linkProfileToUser(clubId, existingProfileId, registeredUserId) {
  if (!clubId || !existingProfileId || !registeredUserId) {
    throw new Error('Club ID, existing profile ID, and registered user ID required');
  }
  
  try {
    // Get existing profile
    const existingProfileRef = doc(db, 'clubs', clubId, 'profiles', existingProfileId);
    const existingProfileSnap = await getDoc(existingProfileRef);
    
    if (!existingProfileSnap.exists()) {
      throw new Error('Existing profile not found');
    }
    
    const existingProfile = existingProfileSnap.data();
    
    // Get registered user
    const userRef = doc(db, 'users', registeredUserId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('Registered user not found');
    }
    
    const userData = userSnap.data();
    
    // Create linked club user with merged data
    const linkedUserData = {
      userId: registeredUserId,
      clubId,
      userEmail: userData.email,
      userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      userPhone: userData.phone || '',
      role: 'player',
      status: 'active',
      addedAt: serverTimestamp(),
      linkedAt: serverTimestamp(),
      isLinked: true,
      // Keep both original profile and user data
      originalProfileData: existingProfile,
      originalUserData: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        displayName: userData.displayName
      },
      // Merge relevant data (prioritize registered user data)
      mergedData: {
        name: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || existingProfile.name,
        email: userData.email || existingProfile.email,
        phone: userData.phone || existingProfile.phone,
        rating: existingProfile.rating || 1500, // Keep existing rating
        stats: existingProfile.stats || {}
      }
    };
    
    // Add to club users
    const clubUsersRef = collection(db, 'clubs', clubId, 'users');
    const docRef = await addDoc(clubUsersRef, linkedUserData);
    
    // Optionally archive the old profile
    await updateDoc(existingProfileRef, {
      status: 'archived',
      linkedToUserId: registeredUserId,
      linkedAt: serverTimestamp()
    });
    
    console.log('✅ Profile linked to user:', existingProfileId, '->', registeredUserId);
    
    return { id: docRef.id, ...linkedUserData };
  } catch (error) {
    console.error('Error linking profile to user:', error);
    throw error;
  }
}

/**
 * Get all club memberships for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of club memberships
 */
export async function getUserClubMemberships(userId) {
  if (!userId) {
    console.log('⚠️ [getUserClubMemberships] No userId provided');
    return [];
  }
  
  console.log('🔍 [getUserClubMemberships] Starting search for user:', userId);
  
  try {
    // Search across all clubs for this user
    const clubsRef = collection(db, 'clubs');
    const clubsSnapshot = await getDocs(clubsRef);
    
    console.log('🏛️ [getUserClubMemberships] Total clubs to search:', clubsSnapshot.docs.length);
    
    const memberships = [];
    
    for (const clubDoc of clubsSnapshot.docs) {
      const clubId = clubDoc.id;
      const clubData = clubDoc.data();
      
      console.log(`🔎 [getUserClubMemberships] Checking club: ${clubData.name} (${clubId})`);
      
      // Check if user is in this club's users collection
      const clubUsersRef = collection(db, 'clubs', clubId, 'users');
      const userQuery = query(clubUsersRef, where('userId', '==', userId));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const clubUserDoc = userSnapshot.docs[0];
        const clubUserData = clubUserDoc.data();
        
        console.log(`✅ [getUserClubMemberships] Found membership in ${clubData.name}:`, clubUserData);
        
        memberships.push({
          clubId,
          clubName: clubData.name,
          role: clubUserData.role,
          status: clubUserData.status,
          addedAt: clubUserData.addedAt,
          isLinked: clubUserData.isLinked || false,
          clubUserDocId: clubUserDoc.id
        });
      } else {
        console.log(`❌ [getUserClubMemberships] No membership found in ${clubData.name}`);
      }
    }
    
    console.log('🎯 [getUserClubMemberships] Final memberships:', memberships);
    return memberships;
  } catch (error) {
    console.error('❌ [getUserClubMemberships] Error getting user club memberships:', error);
    return [];
  }
}

/**
 * Remove user from club
 * @param {string} clubId - Club ID
 * @param {string} clubUserId - Club user document ID
 * @returns {Promise<void>}
 */
export async function removeUserFromClub(clubId, clubUserId) {
  if (!clubId || !clubUserId) throw new Error('Club ID and club user ID required');
  
  try {
    const clubUserRef = doc(db, 'clubs', clubId, 'users', clubUserId);
    await deleteDoc(clubUserRef);
    
    console.log('✅ User removed from club:', clubUserId);
  } catch (error) {
    console.error('Error removing user from club:', error);
    throw error;
  }
}

/**
 * Update club user
 * @param {string} clubId - Club ID
 * @param {string} clubUserId - Club user document ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated club user data
 */
export async function updateClubUser(clubId, clubUserId, updates) {
  if (!clubId || !clubUserId) throw new Error('Club ID and club user ID required');
  
  try {
    const clubUserRef = doc(db, 'clubs', clubId, 'users', clubUserId);
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(clubUserRef, updateData);
    
    // Return updated data
    const updatedSnap = await getDoc(clubUserRef);
    return { id: updatedSnap.id, ...updatedSnap.data() };
  } catch (error) {
    console.error('Error updating club user:', error);
    throw error;
  }
}