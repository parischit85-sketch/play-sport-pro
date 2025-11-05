import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TournamentStandings from '../standings/TournamentStandings.jsx';
import TournamentMatches from '../matches/TournamentMatches.jsx';
import QRCode from 'react-qr-code';
import { useTournamentData } from '../../hooks/useTournamentData.js';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout.js';

/**
 * Portrait Layout - Vertical smartphone view
 * Shows: Header + Classifica + Partite (scrollable vertically)
 * Navigation: Swipe/click for horizontal girone navigation
 * Features: Real-time data loading, responsive font scaling, density-based layout
 * Supports: State persistence via props, smooth rotation transitions
 */
function LayoutPortrait({
  tournament,
  clubId,
  groups,
  deviceInfo,
  initialPageIndex = 0,
  onPageChange,
}) {
  // Load tournament data with real-time updates
  const tournamentData = useTournamentData(clubId, tournament.id);

  // Calculate responsive layout based on data density
  const layout = useResponsiveLayout({
    teamCount: tournamentData.teamCount,
    matchCount: tournamentData.matchCount,
    orientation: deviceInfo.orientation,
    screenSize: deviceInfo.screenSize,
  });

  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialPageIndex);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Sync page changes to parent and storage
  useEffect(() => {
    if (onPageChange) {
      onPageChange(currentGroupIndex);
    }
  }, [currentGroupIndex, onPageChange]);

  // Loading state
  if (tournamentData.loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-emerald-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm">Caricamento dati...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (tournamentData.error) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-900">
        <div className="text-center p-6">
          <p className="text-red-400 text-sm font-bold mb-2">Errore</p>
          <p className="text-gray-400 text-xs">{tournamentData.error}</p>
        </div>
      </div>
    );
  }

  // Pages: groups + QR
  const pages = [...tournamentData.groups, 'qr'];
  const isQRPage = currentGroupIndex === pages.length - 1;
  const currentGroup = isQRPage ? null : pages[currentGroupIndex];

  const handlePrevious = () => {
    setCurrentGroupIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentGroupIndex(prev => Math.min(pages.length - 1, prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.touches[0].clientX;
    const swipeDistance = touchStartX.current - touchEndX.current;

    if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  const handlePageSelect = (index) => {
    setCurrentGroupIndex(index);
  };

  const getQRUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/public/tournament/${clubId}/${tournament.id}/${tournament.publicView.token}`;
  };

  // Debug log per verificare il logo
  console.log('[LayoutPortrait] Tournament data:', { 
    name: tournament.name, 
    hasLogo: !!tournament.logoUrl,
    logoUrl: tournament.logoUrl 
  });

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 text-white" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-700 p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col items-center gap-2 flex-1">
            {tournament.logoUrl && (
              <img src={tournament.logoUrl} alt="Tournament Logo" className="h-12 w-auto object-contain" />
            )}
            <div className="text-center">
              <h1 className="text-sm font-bold text-white line-clamp-1">{tournament.name}</h1>
              <p className="text-xs text-gray-400">Play Sport Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-full border border-red-500/40 self-start">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-red-400">LIVE</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {isQRPage ? (
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto"
            >
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur">
                <div className="text-center mb-4">
                  <Trophy className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <h2 className="text-lg font-bold">Condividi Torneo</h2>
                  <p className="text-sm text-gray-400 mt-1">Scansiona per accedere</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <QRCode value={getQRUrl()} size={200} level="H" />
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center break-all">{getQRUrl()}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentGroup}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-y-auto flex flex-col"
            >
              {/* Classifica */}
              <div className="flex-shrink-0 p-4 border-b border-gray-700">
                <div className="text-sm font-bold text-white mb-3">
                  Girone {currentGroup.toUpperCase()}
                </div>
                <div className="overflow-x-auto">
                  <TournamentStandings
                    tournament={tournament}
                    clubId={clubId}
                    groupFilter={currentGroup}
                    isPublicView={true}
                    fontScale={layout.classicaFontScale}
                  />
                </div>
              </div>

              {/* Partite */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-sm font-bold text-white mb-3">Partite</div>
                <TournamentMatches
                  tournament={tournament}
                  clubId={clubId}
                  groupFilter={currentGroup}
                  isPublicView={true}
                  fontScale={layout.partiteFontScale}
                  gridColumns={layout.gridColumns}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 bg-gray-800 border-t border-gray-700 p-4 z-10">
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={handlePrevious}
            disabled={currentGroupIndex === 0}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 text-center">
            <p className="text-sm font-medium text-gray-300">
              {isQRPage ? 'QR Code' : `Girone ${currentGroup.toUpperCase()}`}
            </p>
            <p className="text-xs text-gray-400">Pagina {currentGroupIndex + 1} di {pages.length}</p>
          </div>

          <button
            onClick={handleNext}
            disabled={currentGroupIndex === pages.length - 1}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Page indicators */}
        <div className="flex justify-center gap-1.5 flex-wrap">
          {pages.map((page, index) => (
            <button
              key={page}
              onClick={() => handlePageSelect(index)}
              className={`
                h-2 rounded-full transition-all cursor-pointer
                ${index === currentGroupIndex
                  ? 'bg-emerald-500 w-6'
                  : 'bg-gray-600 w-2 hover:bg-gray-500'
                }
              `}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default LayoutPortrait;
