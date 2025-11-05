import { useMemo } from 'react';

/**
 * Hook for calculating responsive layout properties
 * Determines: layout type, font scaling, grid columns based on data density
 *
 * @param {Object} options
 * @param {number} options.teamCount - Number of teams in the tournament
 * @param {number} options.matchCount - Number of matches total
 * @param {string} options.orientation - 'portrait' or 'landscape'
 * @param {string} options.screenSize - 'mobile' | 'tablet' | 'desktop' | 'tv'
 * @returns {Object} Layout configuration with scaling and grid info
 *
 * @example
 * const layout = useResponsiveLayout({
 *   teamCount: 12,
 *   matchCount: 18,
 *   orientation: 'landscape',
 *   screenSize: 'desktop'
 * });
 * // Returns: { layoutType: 'hybrid', classicaPercent: 35, ... }
 */
export const useResponsiveLayout = ({
  teamCount = 0,
  matchCount = 0,
  orientation = 'portrait',
  screenSize = 'mobile',
}) => {
  return useMemo(() => {
    const isPortrait = orientation === 'portrait';
    const isLandscape = orientation === 'landscape';

    // ============ LAYOUT TYPE CALCULATION ============
    // Density formula: (teams + matches) / 2
    // Determines if we use stacked or hybrid layout
    const layoutDensity = (teamCount + matchCount) / 2;
    const DENSITY_THRESHOLD = 4; // Threshold for switching layout types

    const layoutType =
      layoutDensity < DENSITY_THRESHOLD ? 'stacked' : 'hybrid';

    // ============ CLASSIFICA & PARTITE SPLIT (Landscape only) ============
    // Hybrid: Classifica 35% left + Partite 65% right
    // Stacked: Full width each
    const classicaPercent = layoutType === 'hybrid' ? 35 : 100;
    const partitePercent = layoutType === 'hybrid' ? 65 : 100;

    // ============ FONT SCALING ============
    // Scale fonts down based on data density
    // Classifica: max(0.7, 1 - (teams * 0.05))
    // Partite: max(0.55, 1 - (matches * 0.03))

    const classicaFontScale = Math.max(
      0.7,
      1 - teamCount * 0.05
    );

    const partiteFontScale = Math.max(
      0.55,
      1 - matchCount * 0.03
    );

    // Screen-specific scaling multipliers
    const screenScalingMultiplier = {
      mobile: 1.0, // Base size for mobile
      tablet: 1.1, // Slightly larger for tablet
      desktop: 1.2, // Larger for desktop
      tv: 1.8, // Much larger for TV (distance viewing)
    }[screenSize] || 1.0;

    // Apply screen scaling to font scales
    const finalClassicaFontScale = classicaFontScale * screenScalingMultiplier;
    const finalPartiteFontScale = partiteFontScale * screenScalingMultiplier;

    // ============ GRID COLUMN CALCULATION ============
    // Optimal columns based on match count:
    // 1-3 matches: 1 column
    // 4-6 matches: 2 columns
    // 7-12 matches: 3 columns
    // 13-20 matches: 4 columns
    // 21+ matches: 5 columns

    let gridColumns = 1;
    if (matchCount <= 3) gridColumns = 1;
    else if (matchCount <= 6) gridColumns = 2;
    else if (matchCount <= 12) gridColumns = 3;
    else if (matchCount <= 20) gridColumns = 4;
    else gridColumns = 5;

    // Mobile can show max 2 columns (screen too small)
    if (screenSize === 'mobile') gridColumns = Math.min(gridColumns, 2);
    
    // Desktop and TV can show more columns in hybrid layout
    if (layoutType === 'hybrid') {
      if (screenSize === 'desktop') gridColumns = Math.min(gridColumns, 4);
      if (screenSize === 'tv') gridColumns = Math.min(gridColumns, 5);
    }

    // ============ HEADING SIZES ============
    // Base heading sizes (in rem) that scale based on density
    const baseHeadingSize = {
      mobile: 1.25, // ~20px
      tablet: 1.5, // ~24px
      desktop: 1.75, // ~28px
      tv: 2.5, // ~40px for distance viewing
    }[screenSize] || 1.25;

    const headingScale = Math.max(0.8, 1 - teamCount * 0.03);
    const finalHeadingSize = baseHeadingSize * headingScale;

    // ============ PADDING & SPACING ============
    // Responsive padding based on screen size and orientation
    const basePadding = {
      mobile: 0.75, // 12px
      tablet: 1, // 16px
      desktop: 1.25, // 20px
      tv: 2, // 32px
    }[screenSize] || 0.75;

    const spacingScale = isPortrait ? 1 : 1.1; // Slightly more space in landscape
    const finalPadding = basePadding * spacingScale;

    // Grid gap calculation (75% of padding for gaps between grid items)
    const gridGap = finalPadding * 0.75;

    // ============ CONTAINER CONSTRAINTS ============
    // Max widths to prevent overstretching on very large screens
    const maxContainerWidth = {
      mobile: '100%',
      tablet: '100%',
      desktop: '95vw',
      tv: '95vw',
    }[screenSize] || '100%';

    // ============ ANIMATION DURATION ============
    // Animations vary by device type (TV moves slower)
    const animationDuration = {
      mobile: 300,
      tablet: 350,
      desktop: 400,
      tv: 600, // Slower animations for clarity on TV
    }[screenSize] || 300;

    // ============ RETURN OBJECT ============
    return {
      // Layout type
      layoutType, // 'stacked' | 'hybrid'
      layoutDensity,

      // Layout split percentages
      classicaPercent,
      partitePercent,

      // Font scaling (0.55 - 1.8+ range)
      classicaFontScale: finalClassicaFontScale,
      partiteFontScale: finalPartiteFontScale,
      headingSize: finalHeadingSize, // in rem

      // Grid configuration
      gridColumns,
      gridGap: finalPadding * 0.75, // 75% of padding for gaps

      // Spacing & Padding
      padding: finalPadding, // in rem
      margin: finalPadding * 0.5, // Half of padding

      // Constraints
      maxContainerWidth,

      // Animation timing (ms)
      animationDuration,

      // Responsive breakpoint info
      screenSize,
      orientation,
      isPortrait,
      isLandscape,

      // Helper styles (optional, for quick Tailwind usage)
      tailwindPadding: {
        0.75: 'p-3',
        1: 'p-4',
        1.25: 'p-5',
        2: 'p-8',
      }[basePadding] || 'p-4',

      tailwindGap: {
        0.5625: 'gap-2',
        0.75: 'gap-3',
        0.825: 'gap-3',
        1.5: 'gap-6',
      }[gridGap] || 'gap-3',
    };
  }, [teamCount, matchCount, orientation, screenSize]);
};

/**
 * Helper function to get CSS-in-JS styles for responsive layout
 * Use this in inline styles or styled components
 *
 * @param {Object} layoutConfig - Output from useResponsiveLayout
 * @returns {Object} CSS style object
 */
export const getResponsiveStyles = (layoutConfig) => ({
  container: {
    maxWidth: layoutConfig.maxContainerWidth,
    padding: `${layoutConfig.padding}rem`,
    transitionDuration: `${layoutConfig.animationDuration}ms`,
  },
  classicaSection: {
    flex: `0 0 ${layoutConfig.classicaPercent}%`,
    fontSize: `${layoutConfig.classicaFontScale}rem`,
    lineHeight: 1.4,
  },
  partiteSection: {
    flex: `0 0 ${layoutConfig.partitePercent}%`,
    fontSize: `${layoutConfig.partiteFontScale}rem`,
    lineHeight: 1.4,
  },
  matchGrid: {
    display: 'grid',
    gridTemplateColumns: `repeat(${layoutConfig.gridColumns}, 1fr)`,
    gap: `${layoutConfig.gridGap}rem`,
  },
  heading: {
    fontSize: `${layoutConfig.headingSize}rem`,
    fontWeight: 700,
    lineHeight: 1.2,
  },
});

/**
 * Calculate optimal margin/padding based on content density
 * Higher density = smaller margins
 *
 * @param {number} itemCount - Total items (teams + matches)
 * @param {boolean} isCompact - Force compact mode
 * @returns {Object} { vertical: number, horizontal: number } in rem
 */
export const calculateDensityMargins = (itemCount = 0, isCompact = false) => {
  if (isCompact) {
    return { vertical: 0.25, horizontal: 0.5 }; // Tight spacing
  }

  if (itemCount < 5) {
    return { vertical: 1, horizontal: 1 }; // Generous spacing
  }

  if (itemCount < 15) {
    return { vertical: 0.75, horizontal: 0.75 }; // Normal spacing
  }

  if (itemCount < 30) {
    return { vertical: 0.5, horizontal: 0.625 }; // Tight spacing
  }

  return { vertical: 0.25, horizontal: 0.5 }; // Very tight spacing
};

export default useResponsiveLayout;
