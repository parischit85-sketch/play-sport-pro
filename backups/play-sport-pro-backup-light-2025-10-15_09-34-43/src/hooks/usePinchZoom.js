// =============================================
// FILE: src/hooks/usePinchZoom.js
// =============================================
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook per gestire pinch-to-zoom su touch devices
 * @param {Object} options - Opzioni per lo zoom
 * @param {number} options.minScale - Scala minima (default: 0.5)
 * @param {number} options.maxScale - Scala massima (default: 3)
 * @param {number} options.initialScale - Scala iniziale (default: 1)
 * @returns {Object} - Oggetti e funzioni per gestire lo zoom
 */
export function usePinchZoom(options = {}) {
  const { minScale = 0.5, maxScale = 3, initialScale = 1 } = options;

  const [scale, setScale] = useState(initialScale);
  const [lastScale, setLastScale] = useState(initialScale);
  const [isZooming, setIsZooming] = useState(false);
  const containerRef = useRef(null);
  const lastTouchDistance = useRef(0);

  // Calcola la distanza tra due punti touch
  const getTouchDistance = useCallback((touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Gestisce l'inizio del touch
  const handleTouchStart = useCallback(
    (e) => {
      if (e.touches.length === 2) {
        setIsZooming(true);
        const distance = getTouchDistance(e.touches[0], e.touches[1]);
        lastTouchDistance.current = distance;
        e.preventDefault();
      }
    },
    [getTouchDistance]
  );

  // Gestisce il movimento del touch
  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length === 2 && isZooming) {
        const distance = getTouchDistance(e.touches[0], e.touches[1]);
        const scaleFactor = distance / lastTouchDistance.current;
        const newScale = Math.min(maxScale, Math.max(minScale, lastScale * scaleFactor));
        setScale(newScale);
        e.preventDefault();
      }
    },
    [isZooming, lastScale, minScale, maxScale, getTouchDistance]
  );

  // Gestisce la fine del touch
  const handleTouchEnd = useCallback(
    (e) => {
      if (e.touches.length < 2) {
        setIsZooming(false);
        setLastScale(scale);
      }
    },
    [scale]
  );

  // Funzioni per zoom programmatico
  const zoomIn = useCallback(() => {
    const newScale = Math.min(maxScale, scale * 1.2);
    setScale(newScale);
    setLastScale(newScale);
  }, [scale, maxScale]);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(minScale, scale * 0.8);
    setScale(newScale);
    setLastScale(newScale);
  }, [scale, minScale]);

  const resetZoom = useCallback(() => {
    setScale(initialScale);
    setLastScale(initialScale);
  }, [initialScale]);

  // Attach event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    scale,
    isZooming,
    zoomIn,
    zoomOut,
    resetZoom,
    transform: `scale(${scale})`,
  };
}

export default usePinchZoom;
