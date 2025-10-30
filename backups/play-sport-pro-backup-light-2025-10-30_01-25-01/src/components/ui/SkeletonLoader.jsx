// =============================================
// FILE: src/ui/SkeletonLoader.jsx
// Componente skeleton loader riutilizzabile
// =============================================

import React from 'react';

/**
 * Skeleton loader per contenuti in caricamento
 * @param {Object} props
 * @param {string} props.variant - Tipo di skeleton ('card', 'text', 'avatar', 'button')
 * @param {string} props.className - Classi CSS aggiuntive
 * @param {number} props.lines - Numero di linee per text variant
 * @param {boolean} props.animate - Se animare il skeleton
 */
export default function SkeletonLoader({
  variant = 'text',
  className = '',
  lines = 1,
  animate = true,
}) {
  const baseClasses = 'bg-gray-200 bg-gray-700 rounded';
  const animateClasses = animate ? 'animate-pulse' : '';

  const variants = {
    card: `${baseClasses} ${animateClasses} h-32 w-full ${className}`,
    text: `${baseClasses} ${animateClasses} h-4 w-full ${className}`,
    avatar: `${baseClasses} ${animateClasses} h-12 w-12 rounded-full ${className}`,
    button: `${baseClasses} ${animateClasses} h-10 w-24 ${className}`,
    title: `${baseClasses} ${animateClasses} h-6 w-3/4 mb-2 ${className}`,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={`${variants.text} ${i === lines - 1 ? 'w-2/3' : ''}`} />
        ))}
      </div>
    );
  }

  return <div className={variants[variant] || variants.text} />;
}

/**
 * Skeleton specifico per card giocatore
 */
export function PlayerCardSkeleton({ T }) {
  return (
    <div className={`${T.cardBg} ${T.border} rounded-xl p-4 animate-pulse`}>
      <div className="flex items-start gap-3 mb-4">
        <SkeletonLoader variant="avatar" />
        <div className="flex-1 min-w-0">
          <SkeletonLoader variant="title" className="mb-2" />
          <SkeletonLoader variant="text" className="w-2/3 mb-2" />
          <SkeletonLoader variant="text" className="w-1/2" />
        </div>
        <div className="text-right">
          <SkeletonLoader variant="text" className="w-16 h-6 mb-1" />
          <SkeletonLoader variant="text" className="w-12 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <SkeletonLoader variant="text" className="w-12 h-5 mb-1 mx-auto" />
          <SkeletonLoader variant="text" className="w-8 h-3 mx-auto" />
        </div>
        <div className="text-center">
          <SkeletonLoader variant="text" className="w-12 h-5 mb-1 mx-auto" />
          <SkeletonLoader variant="text" className="w-8 h-3 mx-auto" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <SkeletonLoader variant="text" className="w-16 h-3 mb-1" />
          <SkeletonLoader variant="text" className="w-12 h-4" />
        </div>
        <div>
          <SkeletonLoader variant="text" className="w-16 h-3 mb-1" />
          <SkeletonLoader variant="text" className="w-12 h-4" />
        </div>
      </div>

      <div className="flex gap-2">
        <SkeletonLoader variant="button" className="flex-1" />
        <SkeletonLoader variant="button" className="flex-1" />
        <SkeletonLoader variant="button" className="w-12" />
        <SkeletonLoader variant="button" className="w-12" />
      </div>
    </div>
  );
}

