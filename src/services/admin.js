// =============================================
// FILE: src/services/admin.js
// Servizi per la dashboard amministrativa
// =============================================
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase.js';

// Costante per il club principale
const MAIN_CLUB_ID = 'sporting-cat';

// Function to get general admin statistics
export const getAdminStats = async () => {
  try {
    console.log("🔄 Admin stats requested - using mock data for development");
    
    // Return mock stats for admin development
    return {
      clubsCount: 5,
      activeClubsCount: 4,
      usersCount: 25,
      newUsersThisMonth: 3,
      pendingAffiliations: 2,
      totalAffiliations: 15,
      todayBookings: 8,
      thisWeekBookings: 35
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// Function to get clubs with detailed info for admin
export const getClubsForAdmin = async () => {
  try {
    console.log("🔄 Clubs for admin requested - attempting to fetch REAL data from Firestore");
    
    // Try to get real data first
    try {
      const clubsRef = collection(db, 'clubs');
      const clubsSnapshot = await getDocs(clubsRef);
      
      if (clubsSnapshot.docs.length > 0) {
        console.log(`✅ Found ${clubsSnapshot.docs.length} real clubs in database`);
        
        const clubs = [];
        for (const docRef of clubsSnapshot.docs) {
          const clubData = { id: docRef.id, ...docRef.data() };
          
          // Log club details for debugging
          console.log(`📍 Club found:`, {
            id: clubData.id,
            name: clubData.name,
            city: clubData.city || clubData.location?.city,
            status: clubData.status,
            courts: clubData.courts?.length || 0,
            createdAt: clubData.createdAt
          });
          
          // Add basic stats (simplified for admin view)
          clubData.stats = {
            totalMembers: 0, // Would need to query affiliations
            totalCourts: clubData.courts?.length || 0,
            monthlyBookings: 0, // Would need to query bookings
          };
          
          clubs.push(clubData);
        }
        
        console.log(`📋 Returning ${clubs.length} clubs to admin dashboard`);
        return clubs;
      }
    } catch (realDataError) {
      console.warn("⚠️ Could not fetch real data, using mock data:", realDataError.message);
    }
    
    // Fallback to mock data if real data fails
    console.log("🔄 Using mock data as fallback");
    return [
      {
        id: 'mock-club-1',
        name: 'Tennis Club Milano',
        city: 'Milano',
        status: 'approved',
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
        stats: {
          totalMembers: 45,
          totalCourts: 6,
          monthlyBookings: 156
        },
        courts: Array(6).fill().map((_, i) => ({ id: `court-${i+1}`, name: `Campo ${i+1}` }))
      },
      {
        id: 'mock-club-2',
        name: 'Sporting Club Roma',
        city: 'Roma',
        status: 'approved',
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
        stats: {
          totalMembers: 32,
          totalCourts: 4,
          monthlyBookings: 98
        },
        courts: Array(4).fill().map((_, i) => ({ id: `court-${i+1}`, name: `Campo ${i+1}` }))
      }
    ];
  } catch (error) {
    console.error('Error fetching clubs for admin:', error);
    throw error;
  }
};

// Function to get users with detailed info for admin
export const getUsersForAdmin = async () => {
  try {
    const usersRef = collection(db, 'clubs', MAIN_CLUB_ID, 'profiles');
    const usersSnapshot = await getDocs(usersRef);
    
    const users = [];
    for (const docRef of usersSnapshot.docs) {
      const userData = { id: docRef.id, ...docRef.data() };
      
      // Get user's club affiliations
      const affiliationsRef = collection(db, 'club_affiliations');
      const userAffiliationsQuery = query(
        affiliationsRef, 
        where('userId', '==', docRef.id),
        where('status', '==', 'approved')
      );
      const affiliationsSnapshot = await getDocs(userAffiliationsQuery);
      
      // Get club details for each affiliation
      const clubs = [];
      for (const affDoc of affiliationsSnapshot.docs) {
        const affData = affDoc.data();
        if (affData.clubId) {
          try {
            const clubDoc = await getDoc(doc(db, 'clubs', affData.clubId));
            if (clubDoc.exists()) {
              clubs.push({ id: clubDoc.id, ...clubDoc.data() });
            }
          } catch (error) {
            console.error('Error fetching club for user:', error);
          }
        }
      }
      
      userData.clubs = clubs;
      users.push(userData);
    }
    
    return users;
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    throw error;
  }
};

// Function to get pending affiliations
export const getPendingAffiliations = async () => {
  try {
    console.log("🔄 Pending affiliations requested - using mock data for development");
    
    // Return mock pending affiliations for admin development
    return [
      {
        id: 'mock-aff-1',
        status: 'pending',
        clubId: 'mock-club-1',
        userId: 'mock-user-1',
        requestedAt: { seconds: Math.floor(Date.now() / 1000) },
        user: {
          id: 'mock-user-1',
          firstName: 'Mario',
          lastName: 'Rossi',
          email: 'mario.rossi@example.com'
        },
        club: {
          id: 'mock-club-1',
          name: 'Tennis Club Milano',
          city: 'Milano'
        }
      }
    ];
  } catch (error) {
    console.error('Error fetching pending affiliations:', error);
    throw error;
  }
};

// Function to get recent activity
export const getRecentActivity = async () => {
  try {
    console.log("🔄 Recent activity requested - using mock data for development");
    
    // Return mock activity data for admin development
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    
    return [
      {
        id: 'mock-1',
        type: 'club_created',
        description: 'Nuovo club "Tennis Club Roma" creato',
        timestamp: { seconds: Math.floor(yesterday.getTime() / 1000) },
        icon: '🏟️'
      },
      {
        id: 'mock-2',
        type: 'user_registered',
        description: 'Nuovo utente Marco Rossi registrato',
        timestamp: { seconds: Math.floor(now.getTime() / 1000) },
        icon: '👤'
      },
      {
        id: 'mock-3',
        type: 'affiliation_pending',
        description: 'Richiesta affiliazione per "Sporting Club Milano"',
        timestamp: { seconds: Math.floor(twoDaysAgo.getTime() / 1000) },
        icon: '📋'
      }
    ];
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
};

// Function to get all affiliations (not just pending)
export const getAllAffiliations = async () => {
  try {
    const affiliationsRef = collection(db, 'club_affiliations');
    const q = query(affiliationsRef); // Temporary: removed orderBy('requestedAt', 'desc')
    const affiliationsSnapshot = await getDocs(q);
    
    const affiliations = [];
    for (const docRef of affiliationsSnapshot.docs) {
      const affiliationData = { id: docRef.id, ...docRef.data() };
      
      // Get user details
      if (affiliationData.userId) {
        try {
          const userDoc = await getDoc(doc(db, 'profiles', affiliationData.userId));
          if (userDoc.exists()) {
            affiliationData.user = { id: userDoc.id, ...userDoc.data() };
          }
        } catch (error) {
          console.error('Error fetching user for affiliation:', error);
        }
      }
      
      // Get club details
      if (affiliationData.clubId) {
        try {
          const clubDoc = await getDoc(doc(db, 'clubs', affiliationData.clubId));
          if (clubDoc.exists()) {
            affiliationData.club = { id: clubDoc.id, ...clubDoc.data() };
          }
        } catch (error) {
          console.error('Error fetching club for affiliation:', error);
        }
      }
      
      affiliations.push(affiliationData);
    }
    
    return affiliations;
  } catch (error) {
    console.error('Error fetching all affiliations:', error);
    throw error;
  }
};

// Function to update user status
export const updateUserStatus = async (userId, newStatus) => {
  try {
    const userRef = doc(db, 'profiles', userId);
    await updateDoc(userRef, {
      status: newStatus,
      updatedAt: new Date()
    });
    
    console.log(`User ${userId} status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Function to update user role
export const updateUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, 'profiles', userId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date()
    });
    
    console.log(`User ${userId} role updated to ${newRole}`);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Function to delete a club
export const deleteClub = async (clubId) => {
  try {
    // First check if club has active bookings or members
    const affiliationsRef = collection(db, 'club_affiliations');
    const activeAffiliationsQuery = query(
      affiliationsRef, 
      where('clubId', '==', clubId),
      where('status', '==', 'approved')
    );
    const activeAffiliations = await getDocs(activeAffiliationsQuery);
    
    if (!activeAffiliations.empty) {
      throw new Error('Cannot delete club with active members. Remove all members first.');
    }
    
    // Delete the club
    const clubRef = doc(db, 'clubs', clubId);
    await deleteDoc(clubRef);
    
    console.log(`Club ${clubId} deleted successfully`);
  } catch (error) {
    console.error('Error deleting club:', error);
    throw error;
  }
};

// Function to approve affiliation
export const approveAffiliation = async (affiliationId) => {
  try {
    const affiliationRef = doc(db, 'club_affiliations', affiliationId);
    await updateDoc(affiliationRef, {
      status: 'approved',
      processedAt: new Date(),
      processedBy: 'admin' // In a real app, this would be the current admin's ID
    });
    
    console.log(`Affiliation ${affiliationId} approved`);
  } catch (error) {
    console.error('Error approving affiliation:', error);
    throw error;
  }
};

// Function to reject affiliation
export const rejectAffiliation = async (affiliationId, reason = null) => {
  try {
    const updateData = {
      status: 'rejected',
      processedAt: new Date(),
      processedBy: 'admin' // In a real app, this would be the current admin's ID
    };
    
    if (reason) {
      updateData.rejectionReason = reason;
    }
    
    const affiliationRef = doc(db, 'club_affiliations', affiliationId);
    await updateDoc(affiliationRef, updateData);
    
    console.log(`Affiliation ${affiliationId} rejected`);
  } catch (error) {
    console.error('Error rejecting affiliation:', error);
    throw error;
  }
};