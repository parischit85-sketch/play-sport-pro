// =============================================
// FILE: src/components/ui/RecentClubsCard.jsx
// Card per mostrare i circoli visitati recentemente
// =============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase.js';

const ClubCard = React.memo(({ club, onClubClick }) => {
  return (
    <div
      onClick={() => onClubClick(club.id)}
      className="min-w-[280px] md:min-w-[320px] flex-shrink-0 bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-xl border-2 border-gray-200/80 dark:border-gray-600/80 hover:border-blue-400/90 dark:hover:border-blue-500/90 hover:shadow-2xl hover:shadow-blue-200/40 dark:hover:shadow-blue-900/30 p-5 rounded-2xl cursor-pointer transition-all duration-300 group transform hover:scale-[1.02] shadow-xl shadow-gray-200/60 dark:shadow-gray-900/40 ring-1 ring-gray-300/50 dark:ring-gray-600/50"
    >
      {/* Header con logo/icona e nome club */}
      <div className="flex items-start gap-4 mb-4">
        {/* Logo o Icona Club */}
        {club.logoUrl ? (
          <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform overflow-hidden border border-gray-200 dark:border-gray-600">
            <img
              src={club.logoUrl}
              alt={`Logo ${club.name}`}
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                // Fallback all'icona se l'immagine non carica
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                `;
              }}
            />
          </div>
        ) : (
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        )}

        {/* Nome e info club */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {club.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate">{club.location?.city || club.city || 'Città'}</span>
          </div>
        </div>
      </div>

      {/* Info aggiuntive */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Visitato di recente</span>
        </div>

        {/* Freccia */}
        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50 transition-colors">
          <svg
            className="w-4 h-4 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
});

ClubCard.displayName = 'ClubCard';

export default function RecentClubsCard({ user }) {
  const navigate = useNavigate();
  const [recentClubs, setRecentClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadRecentClubs = async () => {
      setLoading(true);
      try {
        // Carica le prenotazioni dell'utente per trovare i club visitati
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('bookedBy', '==', user.uid), limit(100));

        const snapshot = await getDocs(q);

        // Ordina per createdAt lato client e prendi i primi 50
        const sortedDocs = snapshot.docs
          .sort((a, b) => {
            const aTime = a.data().createdAt?.toMillis() || 0;
            const bTime = b.data().createdAt?.toMillis() || 0;
            return bTime - aTime;
          })
          .slice(0, 50);

        // Estrai i clubId unici
        const clubIds = [
          ...new Set(
            sortedDocs
              .map((doc) => doc.data().clubId)
              .filter((clubId) => clubId && clubId !== 'default-club')
          ),
        ];

        console.log('🏢 [RecentClubsCard] Club IDs from bookings:', clubIds);

        // Carica i dettagli dei club
        if (clubIds.length > 0) {
          const clubsData = [];
          for (const clubId of clubIds.slice(0, 5)) {
            // Max 5 club
            const clubRef = collection(db, 'clubs');
            const clubQuery = query(clubRef, where('__name__', '==', clubId));
            const clubSnapshot = await getDocs(clubQuery);

            if (!clubSnapshot.empty) {
              const clubData = {
                id: clubId,
                ...clubSnapshot.docs[0].data(),
              };
              console.log('🏢 [RecentClubsCard] Club loaded:', {
                id: clubData.id,
                name: clubData.name,
                hasLogo: !!clubData.logoUrl,
                logoUrl: clubData.logoUrl,
              });
              clubsData.push(clubData);
            }
          }

          console.log('✅ [RecentClubsCard] Loaded clubs:', clubsData.length);
          setRecentClubs(clubsData);
        }
      } catch (error) {
        console.error('Error loading recent clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentClubs();
  }, [user]);

  const handleClubClick = (clubId) => {
    navigate(`/club/${clubId}/dashboard`);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl">
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          I Tuoi Circoli
        </h3>

        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="min-w-[280px] md:min-w-[320px] h-32 bg-gray-200/60 dark:bg-gray-600/40 rounded-2xl animate-pulse flex-shrink-0"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (recentClubs.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50/90 to-blue-50/80 dark:from-gray-800/90 dark:to-blue-900/30 backdrop-blur-xl border-2 border-blue-200/40 dark:border-blue-700/40 p-6 rounded-3xl shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
            Nessun circolo visitato
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Inizia a prenotare nei tuoi circoli preferiti
          </p>
          <button
            onClick={() => navigate('/clubs/search')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Cerca Circoli
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl">
      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        I Tuoi Circoli
      </h3>

      {/* Scroll orizzontale per le card dei circoli */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {recentClubs.map((club) => (
          <ClubCard key={club.id} club={club} onClubClick={handleClubClick} />
        ))}
      </div>
    </div>
  );
}
