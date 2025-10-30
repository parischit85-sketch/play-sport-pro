import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCaTK96Ce1g7mdlCLa1tVUJUvlHqEQHmHc",
  authDomain: "m-padelweb.firebaseapp.com",
  projectId: "m-padelweb",
  storageBucket: "m-padelweb.firebasestorage.app",
  messagingSenderId: "565792083733",
  appId: "1:565792083733:web:89a5f5f2bedb76ce5e66a9",
  measurementId: "G-9H1NPP7BYN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = 's6m4TeGSK9NYD2G5C2jJHLWsDq03';
const clubId = 'GVzHPDIG19Hj5PCIVWbf';

async function verifyProfile() {
  console.log('\n🔍 VERIFYING PROFILE DOCUMENT\n');
  console.log(`User: ${userId}`);
  console.log(`Club: ${clubId}\n`);

  // 1. Check users document
  console.log('1️⃣ Checking users/{userId} document...');
  const userDocRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userDocRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    console.log('✅ users document exists');
    console.log('   - role:', userData.role);
    console.log('   - clubId:', userData.clubId);
    console.log('   - email:', userData.email);
    console.log('   - firstName:', userData.firstName);
    console.log('   - lastName:', userData.lastName);
  } else {
    console.log('❌ users document NOT FOUND');
  }

  // 2. Check profile document
  console.log('\n2️⃣ Checking clubs/{clubId}/profiles/{userId} document...');
  const profileDocRef = doc(db, 'clubs', clubId, 'profiles', userId);
  const profileSnap = await getDoc(profileDocRef);
  
  if (profileSnap.exists()) {
    const profileData = profileSnap.data();
    console.log('✅ profile document exists');
    console.log('   - Full data:', JSON.stringify(profileData, null, 2));
  } else {
    console.log('❌ profile document NOT FOUND');
    console.log('   Path:', `clubs/${clubId}/profiles/${userId}`);
  }

  // 3. Query all profiles in this club to see what exists
  console.log('\n3️⃣ Listing ALL profiles in club...');
  const profilesRef = collection(db, 'clubs', clubId, 'profiles');
  const profilesSnap = await getDocs(profilesRef);
  
  console.log(`   Found ${profilesSnap.size} profiles in club`);
  profilesSnap.forEach(doc => {
    console.log(`   - ${doc.id}:`, doc.data().email || 'no email');
  });

  // 4. Check affiliation document
  console.log('\n4️⃣ Checking affiliation document...');
  const affiliationId = `${userId}_${clubId}`;
  const affiliationRef = doc(db, 'affiliations', affiliationId);
  const affiliationSnap = await getDoc(affiliationRef);
  
  if (affiliationSnap.exists()) {
    const affiliationData = affiliationSnap.data();
    console.log('✅ affiliation document exists');
    console.log('   - Full data:', JSON.stringify(affiliationData, null, 2));
  } else {
    console.log('❌ affiliation document NOT FOUND');
  }

  // 5. Check club managers
  console.log('\n5️⃣ Checking club managers array...');
  const clubDocRef = doc(db, 'clubs', clubId);
  const clubSnap = await getDoc(clubDocRef);
  
  if (clubSnap.exists()) {
    const clubData = clubSnap.data();
    console.log('✅ club document exists');
    console.log('   - name:', clubData.name);
    console.log('   - managers:', clubData.managers || []);
    console.log('   - User is manager?', (clubData.managers || []).includes(userId));
  } else {
    console.log('❌ club document NOT FOUND');
  }

  console.log('\n✅ VERIFICATION COMPLETE\n');
  process.exit(0);
}

verifyProfile().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
