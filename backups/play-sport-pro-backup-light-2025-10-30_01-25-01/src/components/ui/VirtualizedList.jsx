// =============================================
// FILE: src/ui/VirtualizedList.jsx
// Lista virtualizzata per performance con grandi dataset
// =============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function VirtualizedList({
  items,
  itemHeight = 120, // Altezza stimata di ogni elemento
  containerHeight = 600,
  renderItem,
  overscan = 5, // Elementi extra da renderizzare sopra/sotto la viewport
  className = '',
  T,
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeightState, setContainerHeightState] = useState(containerHeight);
  const containerRef = useRef(null);

  // Calcola gli indici degli elementi da renderizzare
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeightState) / itemHeight) + overscan
  );

  // Elementi visibili
  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Gestisci il resize del container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeightState(containerRef.current.clientHeight);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Gestisci lo scroll
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Offset per il posizionamento degli elementi
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            return (
              <div key={item.id || actualIndex} style={{ height: itemHeight }} className="flex">
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Hook per calcolare l'altezza dinamica degli elementi
export function useDynamicItemHeight(measureElement) {
  const [heights, setHeights] = useState(new Map());

  const measureHeight = useCallback(
    (id, element) => {
      if (element && !heights.has(id)) {
        const height = element.offsetHeight;
        setHeights((prev) => new Map(prev).set(id, height));
      }
    },
    [heights]
  );

  const getHeight = useCallback((id) => heights.get(id) || 120, [heights]);

  const averageHeight = React.useMemo(() => {
    if (heights.size === 0) return 120;
    const sum = Array.from(heights.values()).reduce((a, b) => a + b, 0);
    return sum / heights.size;
  }, [heights]);

  return { measureHeight, getHeight, averageHeight };
}

