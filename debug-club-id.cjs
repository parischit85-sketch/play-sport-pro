const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://play-sport-pro-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

async function findClubId() {
  try {
    console.log('🔍 Searching for club with name "sporting-cat"...');

    const clubsRef = db.collection('clubs');
    const snapshot = await clubsRef.get();

    console.log(`📊 Found ${snapshot.size} clubs`);

    for (const doc of snapshot.docs) {
      const data = doc.data();
      console.log(`🏢 Club ${doc.id}: ${JSON.stringify(data, null, 2)}`);

      if (data.name === 'sporting-cat' || data.name === 'Sporting Cat' || doc.id === 'sporting-cat') {
        console.log(`✅ Found matching club! ID: ${doc.id}`);
        return doc.id;
      }
    }

    console.log('❌ No club found with name "sporting-cat"');

    // Check affiliations for the current user to see what club they should have access to
    console.log('\n🔍 Checking affiliations for user FoqdMJ6vCFfshRPlz4CYrCl0fpu1...');
    const affiliationsRef = db.collection('affiliations');
    const affSnapshot = await affiliationsRef.where('userId', '==', 'FoqdMJ6vCFfshRPlz4CYrCl0fpu1').get();

    console.log(`📊 Found ${affSnapshot.size} affiliations for user`);

    affSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`🔗 Affiliation: ${JSON.stringify(data, null, 2)}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

findClubId();