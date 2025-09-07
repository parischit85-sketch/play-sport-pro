// =============================================
// FILE: src/lib/design-system.js
// Design System Unificato per Paris League
// =============================================

export const DS_SPACING = {
  // Spacing scale basato su 4px
  xs: 'p-1', // 4px
  sm: 'p-2', // 8px
  md: 'p-4', // 16px
  lg: 'p-6', // 24px
  xl: 'p-8', // 32px
  xxl: 'p-12', // 48px

  // Margini
  gapXs: 'gap-1',
  gapSm: 'gap-2',
  gapMd: 'gap-4',
  gapLg: 'gap-6',
  gapXl: 'gap-8',

  // Spaziatura sezioni
  sectionMb: 'mb-6',
  cardMb: 'mb-4',
  elementMb: 'mb-3',
};

export const DS_TYPOGRAPHY = {
  // Gerarchia tipografica unificata
  h1: 'text-3xl font-bold',
  h2: 'text-2xl font-bold',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-semibold',
  h5: 'text-base font-semibold',

  // Body text
  bodyLg: 'text-lg',
  body: 'text-base',
  bodySm: 'text-sm',
  bodyXs: 'text-xs',

  // Utility
  label: 'text-xs uppercase tracking-wide font-medium',
  caption: 'text-xs',

  // Weights
  thin: 'font-thin',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

export const DS_LAYOUT = {
  // Container patterns
  container: 'max-w-7xl mx-auto px-4',
  containerSm: 'max-w-4xl mx-auto px-4',
  containerXs: 'max-w-2xl mx-auto px-4',

  // Flexbox patterns
  flexBetween: 'flex items-center justify-between',
  flexCenter: 'flex items-center justify-center',
  flexStart: 'flex items-center justify-start',
  flexEnd: 'flex items-center justify-end',
  flexCol: 'flex flex-col',
  flexColCenter: 'flex flex-col items-center justify-center',
  flexWrap: 'flex flex-wrap',

  // Grid patterns
  grid2: 'grid grid-cols-1 md:grid-cols-2',
  grid3: 'grid grid-cols-1 md:grid-cols-3',
  grid4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  grid5: 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
  gridAuto: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',

  // Responsive utilities
  hideOnMobile: 'hidden md:block',
  showOnMobile: 'block md:hidden',
  stack: 'flex flex-col md:flex-row',
};

export const DS_COLORS = {
  // Brand colors (from theme.js)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80', // emerald-400 - primary brand
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Status colors
  success: 'text-emerald-500',
  error: 'text-rose-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',

  // Chart colors (consistenti)
  chart: [
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
    '#84cc16', // lime-500
  ],
};

export const DS_SHADOWS = {
  // Shadow system unificato
  xs: 'shadow-sm',
  sm: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',

  // Glow effects
  glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  glowStrong: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',

  // Custom shadows
  card: 'shadow-[0_0_0_1px_rgba(0,0,0,0.02)] shadow-sm',
  cardHover: 'shadow-[0_0_0_1px_rgba(0,0,0,0.04)] shadow-md',
};

export const DS_BORDERS = {
  // Border radius system
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  xxl: 'rounded-2xl',
  full: 'rounded-full',

  // Border widths
  border: 'border',
  border2: 'border-2',
  border4: 'border-4',
  borderT: 'border-t',
  borderB: 'border-b',
  borderL: 'border-l',
  borderR: 'border-r',
};

export const DS_ANIMATIONS = {
  // Transizioni standard
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',

  // Hover effects
  scaleHover: 'hover:scale-105 transition-transform duration-200',
  fadeHover: 'hover:opacity-80 transition-opacity duration-200',

  // Focus states
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2',
};

// Componenti composite per pattern comuni
export const DS_PATTERNS = {
  // Card base
  card: (T) => `${DS_BORDERS.xxl} ${T.cardBg} ${T.border} ${DS_SPACING.md} ${DS_SHADOWS.card}`,
  cardHover: (T) =>
    `${DS_BORDERS.xxl} ${T.cardBg} ${T.border} ${DS_SPACING.md} ${DS_SHADOWS.cardHover} ${DS_ANIMATIONS.normal}`,

  // Section header
  sectionHeader: (T) => `${DS_LAYOUT.flexBetween} ${DS_SPACING.elementMb}`,
  sectionTitle: (T) => `${DS_TYPOGRAPHY.h3} ${T.neonText}`,

  // Button variants (estende theme.js)
  btnVariants: {
    primary: (T) => T.btnPrimary,
    ghost: (T) => T.btnGhost,
    ghostSm: (T) => T.btnGhostSm,
  },

  // Input base
  input: (T) => T.input,

  // Stats card pattern
  statCard: (T) => `${DS_PATTERNS.card(T)} text-center`,

  // List item pattern
  listItem: (T) =>
    `${DS_BORDERS.xl} ${T.cardBg} ${T.border} ${DS_SPACING.sm} ${DS_LAYOUT.flexBetween}`,

  // Badge pattern
  badge: (T) =>
    `inline-flex items-center ${DS_SPACING.xs} ${DS_BORDERS.md} ${DS_TYPOGRAPHY.bodyXs} ${DS_TYPOGRAPHY.medium}`,

  // Loading state
  skeleton: 'animate-pulse bg-gray-200 rounded',
};

// Helper function per combinare classi del design system con theme
export function createDSClasses(T) {
  return {
    // Cards
    card: DS_PATTERNS.card(T),
    cardHover: DS_PATTERNS.cardHover(T),

    // Headers
    sectionHeader: DS_PATTERNS.sectionHeader(T),
    sectionTitle: DS_PATTERNS.sectionTitle(T),

    // Common layouts
    flexBetween: DS_LAYOUT.flexBetween,
    flexCenter: DS_LAYOUT.flexCenter,
    grid3: DS_LAYOUT.grid3,
    grid4: DS_LAYOUT.grid4,

    // Typography
    h1: `${DS_TYPOGRAPHY.h1} ${T.text}`,
    h2: `${DS_TYPOGRAPHY.h2} ${T.text}`,
    h3: `${DS_TYPOGRAPHY.h3} ${T.text}`,
    body: `${DS_TYPOGRAPHY.body} ${T.text}`,
    bodySm: `${DS_TYPOGRAPHY.bodySm} ${T.subtext}`,
    label: `${DS_TYPOGRAPHY.label} ${T.subtext}`,

    // Buttons
    btnPrimary: T.btnPrimary,
    btnGhost: T.btnGhost,
    btnGhostSm: T.btnGhostSm,

    // Form elements
    input: T.input,

    // Status colors
    success: DS_COLORS.success,
    error: DS_COLORS.error,
    warning: DS_COLORS.warning,
    info: DS_COLORS.info,
  };
}

export default {
  DS_SPACING,
  DS_TYPOGRAPHY,
  DS_LAYOUT,
  DS_COLORS,
  DS_SHADOWS,
  DS_BORDERS,
  DS_ANIMATIONS,
  DS_PATTERNS,
  createDSClasses,
};
