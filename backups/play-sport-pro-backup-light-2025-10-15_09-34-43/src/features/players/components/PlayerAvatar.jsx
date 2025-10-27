// =============================================
// FILE: src/features/players/components/PlayerAvatar.jsx
// Componente avatar giocatore
// =============================================

import React from 'react';
import { getPlayerInitial } from '@lib/playerUtils.js';

export default function PlayerAvatar({ player, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0`}>
      {getPlayerInitial(player)}
    </div>
  );
}