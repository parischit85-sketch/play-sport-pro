// =============================================
// FILE: src/features/players/components/PlayerAvatar.jsx
// Componente avatar giocatore
// =============================================

import React from 'react';

const PlayerAvatar = ({ player, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
  };

  const isLinked = player.isAccountLinked || player.isLinked || player.linkedFirebaseUid;

  if (isLinked) {
    return (
      <div
        className={`${sizeClasses[size]} flex items-center justify-center shrink-0`}
        title="Profilo collegato all'app PlaySport"
      >
        <img 
          src="/play-sport-pro_icon_only.svg" 
          alt="PlaySport" 
          className="w-full h-full object-contain drop-shadow-sm"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 shrink-0`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3/5 h-3/5">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
      </svg>
    </div>
  );
};

// 🚀 OTTIMIZZAZIONE: Memoizza per evitare re-render inutili
export default React.memo(PlayerAvatar);
