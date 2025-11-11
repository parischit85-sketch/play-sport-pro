const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function debugPlayerLookup() {
  try {
    const playerId = 'zdg0O8pZSIclTShOra1HDH1Y8mJ3';

    console.log('🔍 Checking player:', playerId);

    // Check global users collection
    const userDoc = await db.collection('users').doc(playerId).get();
    console.log('👤 Global user exists:', userDoc.exists);
    if (userDoc.exists) {
      console.log('👤 User data:', userDoc.data());
    }

    // Check affiliations to find clubId
    const affiliationsSnap = await db.collection('affiliations').where('userId', '==', playerId).get();
    console.log('🔗 Affiliations found:', affiliationsSnap.size);

    for (const affDoc of affiliationsSnap.docs) {
      const affData = affDoc.data();
      console.log('🔗 Affiliation:', affDoc.id, affData);

      if (affData.clubId) {
        const clubId = affData.clubId;
        console.log('🏢 Checking club:', clubId);

        // Check clubs/{clubId}/users
        const clubUserDoc = await db.collection('clubs').doc(clubId).collection('users').doc(playerId).get();
        console.log('👥 Club user exists:', clubUserDoc.exists);
        if (clubUserDoc.exists) {
          console.log('👥 Club user data:', clubUserDoc.data());
        }

        // Check clubs/{clubId}/profiles
        const clubProfileDoc = await db.collection('clubs').doc(clubId).collection('profiles').doc(playerId).get();
        console.log('📋 Club profile exists:', clubProfileDoc.exists);
        if (clubProfileDoc.exists) {
          console.log('📋 Club profile data:', clubProfileDoc.data());
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugPlayerLookup();