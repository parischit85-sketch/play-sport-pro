// =============================================
// FILE: src/components/ui/ZoomableGrid.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { usePinchZoom } from '@hooks/usePinchZoom.js';

/**
 * Componente che wrappa una griglia rendendola zoomabile solo su mobile
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
      {/* Container scrollabile con zoom solo su mobile */}
      <div
        ref={isMobile ? containerRef : null}
        className={`w-full ${isMobile ? 'overflow-auto' : 'overflow-x-auto'} ${className}`}
        style={{
          touchAction: isMobile ? 'manipulation' : 'auto',
          WebkitOverflowScrolling: 'touch',
          ...(isMobile
            ? {
                minHeight: '400px',
                maxHeight: 'calc(100vh - 200px)',
              }
            : {
                // Su desktop: comportamento normale
              }),
        }}
      >
        <div
          style={{
            transform: isMobile ? transform : 'none',
            transformOrigin: 'top left',
            transition: isZooming && isMobile ? 'none' : 'transform 0.2s ease-out',
            minWidth: '100%',
            minHeight: '100%',
          }}
        >
          {children}
        </div>
      </div>

      {/* Istruzioni per mobile - solo pinch, nessun pulsante */}
      {isMobile && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <div className={`px-4 py-2 rounded-lg ${T.cardBg} ${T.border} shadow-lg text-center`}>
            <div className="text-xs font-medium text-gray-700 text-gray-300">
              💡 Usa due dita per zoom in/out • Trascina per scorrere
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
