// =============================================
// FILE: src/components/ui/ZoomableGrid.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { usePinchZoom } from '@hooks/usePinchZoom.js';

/**
 * Componente che wrappa una griglia rendendola zoomabile su mobile
 */
export default function ZoomableGrid({ children, className = '', T }) {
  const { containerRef, scale, isZooming, zoomIn, zoomOut, resetZoom, transform } = usePinchZoom({
    minScale: 0.3,
    maxScale: 2.5,
    initialScale: 0.7, // Inizia un po' zoommato out per vedere meglio su mobile
  });

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full" style={{ minHeight: '400px' }}>
      {/* Controlli zoom per mobile */}
      <div className="md:hidden fixed top-20 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className={`w-12 h-12 rounded-full bg-blue-500 dark:bg-blue-600 text-white shadow-lg flex items-center justify-center text-xl font-bold ${T.shadow}`}
          aria-label="Zoom In"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className={`w-12 h-12 rounded-full bg-blue-500 dark:bg-blue-600 text-white shadow-lg flex items-center justify-center text-xl font-bold ${T.shadow}`}
          aria-label="Zoom Out"
        >
          −
        </button>
        <button
          onClick={resetZoom}
          className={`w-12 h-12 rounded-full bg-gray-500 dark:bg-gray-600 text-white shadow-lg flex items-center justify-center text-sm font-bold ${T.shadow}`}
          aria-label="Reset Zoom"
        >
          ⌂
        </button>
      </div>

      {/* Indicatore di zoom per mobile */}
      <div className="md:hidden fixed top-20 left-4 z-50">
        <div className={`px-3 py-2 rounded-lg ${T.cardBg} ${T.border} shadow-lg`}>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {Math.round(scale * 100)}%
          </div>
          {isZooming && (
            <div className="text-xs text-blue-500 dark:text-blue-400">Pinch per zoom</div>
          )}
        </div>
      </div>

      {/* Container scrollabile con zoom */}
      <div
        ref={containerRef}
        className={`w-full ${isMobile ? 'overflow-auto' : 'overflow-visible'} ${className}`}
        style={{
          touchAction: 'manipulation', // Permette solo pan e zoom
          WebkitOverflowScrolling: 'touch', // Smooth scrolling su iOS
          ...(isMobile
            ? {
                minHeight: '400px',
                maxHeight: 'calc(100vh - 200px)',
              }
            : {
                // Su desktop: nessuna limitazione di altezza
              }),
        }}
      >
        <div
          style={{
            transform: transform,
            transformOrigin: 'top left',
            transition: isZooming ? 'none' : 'transform 0.2s ease-out',
            minWidth: '100%',
            minHeight: '100%',
          }}
        >
          {children}
        </div>
      </div>

      {/* Istruzioni per mobile */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className={`px-4 py-3 rounded-lg ${T.cardBg} ${T.border} shadow-lg text-center`}>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            💡 Usa due dita per zoom in/out • Trascina per scorrere
          </div>
        </div>
      </div>
    </div>
  );
}
