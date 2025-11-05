import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import QRCode from 'react-qr-code';
import TournamentBracket from '../knockout/TournamentBracket.jsx';
import LayoutGirone from './LayoutGirone.jsx';

function LayoutLandscape({
  tournament,
  clubId,
  groups,
  initialPageIndex = 0,
  onPageChange,
}) {
  const [currentPageIndex] = useState(initialPageIndex);

  useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPageIndex);
    }
  }, [currentPageIndex, onPageChange]);

  if (!tournament || !groups || groups.length === 0) {
    console.warn('[LayoutLandscape] Missing data:', {
      tournament: !!tournament,
      groups,
      groupsLength: groups?.length,
    });
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-900">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Loading tournament...</p>
        </div>
      </div>
    );
  }

  console.log('[LayoutLandscape] Rendering with groups:', groups);
  const pages = [...groups, 'bracket', 'qr'];
  const isQRPage = pages[currentPageIndex] === 'qr';
  const isBracketPage = pages[currentPageIndex] === 'bracket';
  const currentGroup = !isQRPage && !isBracketPage ? pages[currentPageIndex] : null;

  const getQRUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/public/tournament/${clubId}/${tournament.id}/${tournament.publicView?.token || ''}`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 text-white">
      <div className="flex-shrink-0 bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-700 p-4 sticky top-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col items-center gap-2 flex-1">
            {tournament.logoUrl && (
              <img
                src={tournament.logoUrl}
                alt="Tournament Logo"
                className="h-12 w-auto object-contain"
              />
            )}
            <div className="text-center">
              <h1 className="text-xl font-bold text-white line-clamp-1">{tournament.name}</h1>
              <p className="text-xs text-gray-400">Play Sport Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-full border border-red-500/40 flex-shrink-0 self-start">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-red-400">LIVE</span>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="text-sm text-gray-400 font-medium">
            {isQRPage ? 'QR Code' : isBracketPage ? 'Bracket' : `Girone ${currentGroup?.toUpperCase()}`}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-2">
        <AnimatePresence mode="wait">
          {isQRPage ? (
            <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full flex items-center justify-center">
              <div className="bg-white/5 rounded-xl p-8 border border-white/10 backdrop-blur">
                <div className="text-center mb-6">
                  <Trophy className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold">Share Tournament</h2>
                </div>
                <div className="bg-white p-6 rounded-lg">
                  <QRCode value={getQRUrl()} size={300} />
                </div>
              </div>
            </motion.div>
          ) : isBracketPage ? (
            <motion.div key="bracket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full">
              <TournamentBracket tournament={tournament} clubId={clubId} isPublicView={true} />
            </motion.div>
          ) : (
            <motion.div key={currentGroup} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }} className="h-full">
              <LayoutGirone
                tournament={tournament}
                clubId={clubId}
                currentGroup={currentGroup}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!isQRPage && tournament.publicView?.showQRCode && (
        <div className="absolute bottom-4 right-4 bg-white/10 p-2 rounded-lg border border-white/20 backdrop-blur">
          <QRCode value={getQRUrl()} size={120} />
        </div>
      )}
    </div>
  );
}

export default LayoutLandscape;
