// =============================================
// FILE: src/components/ui/RecentClubsCard.jsx
// Card per mostrare i circoli più visualizzati dall'utente
// =============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserMostViewedClubs } from '../../services/club-analytics.js';

const ClubCard = React.memo(({ club, onClubClick }) => {
  return (
    <div
      onClick={() => onClubClick(club.id)}
      className="min-w-[240px] max-w-[260px] flex-shrink-0 bg-[#1e293b] hover:bg-[#2d3b52] rounded-2xl p-3.5 cursor-pointer transition-all duration-300 group border border-gray-700/50 hover:border-gray-600"
    >
      <div className="flex items-center gap-3">
        {/* Logo circolare */}
        <div className="w-14 h-14 flex-shrink-0 rounded-full overflow-hidden bg-white border-2 border-gray-600">
          {club.logoUrl ? (
            <img
              src={club.logoUrl}
              alt={`Logo ${club.name}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                `;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Info circolo */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base mb-0.5 truncate">
            {club.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-gray-400 text-sm truncate">
              {club.location?.city || club.city || club.address?.city || 'Località'}
            </span>
          </div>
        </div>

        {/* Freccia navigazione */}
        <div className="flex-shrink-0">
          <svg 
            className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" 
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
        // 🆕 NUOVO SISTEMA: Carica i top 3 circoli più visualizzati
        // Usa getUserMostViewedClubs da club-analytics.js
        const mostViewedClubs = await getUserMostViewedClubs(user.uid, 3);
        
        // Filtra solo circoli che hanno dati validi
        const clubsData = mostViewedClubs
          .filter(viewData => viewData.club !== null) // Solo club esistenti nel DB
          .map(viewData => ({
            id: viewData.clubId,
            viewCount: viewData.viewCount, // Numero di visualizzazioni
            lastViewedAt: viewData.lastViewedAt,
            ...viewData.club // Spread dei dati completi del club
          }));

        setRecentClubs(clubsData);
      } catch (error) {
        console.error('❌ [RecentClubsCard] Error loading most viewed clubs:', error);
        setRecentClubs([]);
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
      <div className="bg-transparent">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">I Tuoi Circoli Preferiti</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-[#1e293b] rounded-2xl animate-pulse border border-gray-700/50"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (recentClubs.length === 0) {
    return (
      <div className="bg-transparent">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">I Tuoi Circoli Preferiti</h2>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-gray-700/50 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-white">
            Nessun circolo visitato
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Inizia a esplorare i circoli disponibili
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent">
      {/* Header con icona */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">I Tuoi Circoli Preferiti</h2>
      </div>

      {/* Cards circoli - Scroll orizzontale */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1 -mx-1">
        {recentClubs.map((club) => (
          <ClubCard key={club.id} club={club} onClubClick={handleClubClick} />
        ))}
      </div>
    </div>
  );
}
