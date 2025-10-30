/**
 * Debug script per verificare i match di torneo nel database
 * Run: node debug-tournament-matches.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC8FmBxlVQYIFzKnlvY4L0u4HLf_K84sxg',
  authDomain: 'sporting-cat-padel.firebaseapp.com',
  projectId: 'sporting-cat-padel',
  storageBucket: 'sporting-cat-padel.appspot.com',
  messagingSenderId: '265921843521',
  appId: '1:265921843521:web:a9db7e4d088c6ece50f0ae',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CLUB_ID = 'sporting-cat';
const PLAYER_NAME = 'Paris Andrea';

async function main() {
  console.log('🔍 Debug: Verificando match di torneo per Paris Andrea\n');

  try {
    // 1. Leggi i tornei
    const tournamentsRef = collection(db, `clubs/${CLUB_ID}/tournaments`);
    const tournamentsSnap = await getDocs(tournamentsRef);

    console.log(`📋 Trovati ${tournamentsSnap.docs.length} tornei\n`);

    for (const tDoc of tournamentsSnap.docs) {
      const tournament = { id: tDoc.id, ...tDoc.data() };
      console.log(
        `🏆 Torneo: "${tournament.name}" (ID: ${tournament.id})`
      );
      console.log(`   Status: ${tournament.status}`);

      // 2. Leggi i match di questo torneo
      const matchesRef = collection(
        db,
        `clubs/${CLUB_ID}/tournaments/${tournament.id}/matches`
      );
      const matchesSnap = await getDocs(matchesRef);

      console.log(`   Trovati ${matchesSnap.docs.length} match\n`);

      for (const mDoc of matchesSnap.docs) {
        const match = { id: mDoc.id, ...mDoc.data() };

        console.log(`   📊 Match ${match.id}:`);
        console.log(`      Team1ID: ${match.team1Id}`);
        console.log(`      Team2ID: ${match.team2Id}`);
        console.log(`      Status: ${match.status}`);
        console.log(`      Winner: ${match.winnerId}`);
        console.log(`      Sets: ${JSON.stringify(match.sets)}`);

        // 3. Leggi i team
        const teamsRef = collection(
          db,
          `clubs/${CLUB_ID}/tournaments/${tournament.id}/teams`
        );
        const teamsSnap = await getDocs(teamsRef);
        const teamsMap = {};
        teamsSnap.docs.forEach((t) => {
          teamsMap[t.id] = { id: t.id, ...t.data() };
        });

        const team1 = teamsMap[match.team1Id];
        const team2 = teamsMap[match.team2Id];

        if (team1) {
          console.log(
            `      Team1: ${team1.teamName} - Players: ${
              Array.isArray(team1.players)
                ? team1.players.map((p) => p.id || p).join(', ')
                : 'N/A'
            }`
          );

          // Controlla se Paris Andrea è in questo team
          const parisInTeam1 = Array.isArray(team1.players)
            ? team1.players.some(
                (p) =>
                  (p.name || p).toLowerCase().includes('paris') &&
                  (p.name || p).toLowerCase().includes('andrea')
              )
            : false;

          if (parisInTeam1) {
            console.log(
              `      ✅ PARIS ANDREA TROVATO IN TEAM1!`
            );
          }
        }

        if (team2) {
          console.log(
            `      Team2: ${team2.teamName} - Players: ${
              Array.isArray(team2.players)
                ? team2.players.map((p) => p.id || p).join(', ')
                : 'N/A'
            }`
          );

          // Controlla se Paris Andrea è in questo team
          const parisInTeam2 = Array.isArray(team2.players)
            ? team2.players.some(
                (p) =>
                  (p.name || p).toLowerCase().includes('paris') &&
                  (p.name || p).toLowerCase().includes('andrea')
              )
            : false;

          if (parisInTeam2) {
            console.log(
              `      ✅ PARIS ANDREA TROVATO IN TEAM2!`
            );
          }
        }

        console.log();
      }
    }

    // 4. Verifica i match regolari di Sporting Cat
    console.log('\n' + '='.repeat(60));
    console.log('Match regolari di Sporting Cat\n');

    const matchesRef = collection(db, `clubs/${CLUB_ID}/matches`);
    const matchesSnap = await getDocs(matchesRef);

    console.log(`📊 Trovati ${matchesSnap.docs.length} match regolari\n`);

    let parisMatches = 0;
    for (const mDoc of matchesSnap.docs.slice(0, 5)) {
      const match = { id: mDoc.id, ...mDoc.data() };

      console.log(`Match ${match.id}:`);
      console.log(`  TeamA: ${(match.teamA || []).join(', ')}`);
      console.log(
        `  TeamB: ${(match.teamB || []).join(', ')}`
      );
      console.log(`  Winner: ${match.winner}`);
      console.log(`  Date: ${match.date}`);

      const parisInA = (match.teamA || []).some(
        (id) => id.toLowerCase().includes('paris')
      );
      const parisInB = (match.teamB || []).some(
        (id) => id.toLowerCase().includes('paris')
      );

      if (parisInA || parisInB) {
        parisMatches++;
        console.log(`  ✅ PARIS ANDREA IN QUESTO MATCH`);
      }

      console.log();
    }

    console.log(`\n✅ Totale match regolari con Paris Andrea: ${parisMatches}`);
  } catch (error) {
    console.error('❌ Errore:', error);
  }

  process.exit(0);
}

main();
