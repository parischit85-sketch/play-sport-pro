// =============================================
// FILE: src/lib/theme.js
// Theme System integrato con Design System
// =============================================
export const LOGO_URL = '/play-sport-pro_horizontal.svg';
export const LOGO_ICON_URL = '/play-sport-pro_icon_only.svg';

// Costanti di design unificate
export const THEME_CONSTANTS = {
  // Border radius unificato
  borderRadius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },

  // Spacing consistente
  spacing: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },

  // Shadows unificati
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    card: 'shadow-[0_0_0_1px_rgba(0,0,0,0.02)] shadow-sm',
  },

  // Transizioni standard
  transitions: {
    fast: 'transition-all duration-150 ease-in-out',
    normal: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
  },
};

export function themeTokens() {
  const shared = {
    // Border radius unificato
    borderSm: THEME_CONSTANTS.borderRadius.sm,
    borderMd: THEME_CONSTANTS.borderRadius.md,
    borderLg: THEME_CONSTANTS.borderRadius.lg,
    borderFull: THEME_CONSTANTS.borderRadius.full,

    // Spacing unificato
    spacingXs: THEME_CONSTANTS.spacing.xs,
    spacingSm: THEME_CONSTANTS.spacing.sm,
    spacingMd: THEME_CONSTANTS.spacing.md,
    spacingLg: THEME_CONSTANTS.spacing.lg,
    spacingXl: THEME_CONSTANTS.spacing.xl,

    // Shadows unificati
    shadowCard: THEME_CONSTANTS.shadows.card,
    shadowSm: THEME_CONSTANTS.shadows.sm,
    shadowMd: THEME_CONSTANTS.shadows.md,
    shadowLg: THEME_CONSTANTS.shadows.lg,

    // Transizioni
    transitionFast: THEME_CONSTANTS.transitions.fast,
    transitionNormal: THEME_CONSTANTS.transitions.normal,
    transitionSlow: THEME_CONSTANTS.transitions.slow,

    // Focus ring unificato
    focusRing: 'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2',
  };

  // Tema unico moderno/chiaro (solido, leggibile, senza trasparenze)
  return {
    name: 'modern',
    ...shared,
    // Layout
    pageBg: 'bg-neutral-50',
    text: 'text-neutral-900',
    subtext: 'text-neutral-600',
    cardBg: 'bg-white',
    border: 'ring-1 ring-black/10',
    headerBg: 'bg-white border-b border-black/10',

    // Brand colors
    neonText: 'text-emerald-600',
    link: 'underline underline-offset-4 decoration-emerald-600 hover:text-emerald-700',
    ghostRing: 'ring-black/10 hover:bg-black/5',
    tableHeadText: 'text-neutral-500',

    // Form elements
    input: `${THEME_CONSTANTS.borderRadius.md} px-3 py-2 bg-white border border-black/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none ${THEME_CONSTANTS.transitions.normal}`,

    // Buttons
    btnPrimary: `inline-flex items-center justify-center ${THEME_CONSTANTS.borderRadius.md} px-4 py-2 font-medium text-black bg-gradient-to-r from-emerald-400 to-lime-400 hover:brightness-110 active:brightness-95 ${THEME_CONSTANTS.transitions.normal} ${THEME_CONSTANTS.shadows.sm}`,
    btnGhost: `inline-flex items-center justify-center ${THEME_CONSTANTS.borderRadius.md} px-4 py-2 font-medium ring-1 ring-black/10 hover:bg-black/5 ${THEME_CONSTANTS.transitions.normal}`,
    btnGhostSm: `inline-flex items-center justify-center ${THEME_CONSTANTS.borderRadius.sm} px-2 py-1 text-xs font-medium ring-1 ring-black/10 hover:bg-black/5 ${THEME_CONSTANTS.transitions.normal}`,

    // Status colors
    accentGood: 'text-emerald-600',
    accentBad: 'text-rose-600',
    accentWarning: 'text-amber-600',
    accentInfo: 'text-blue-600',

    // Components
    chip: 'bg-emerald-500 text-black',

    // Cards unificati
    card: `${THEME_CONSTANTS.borderRadius.lg} bg-white ring-1 ring-black/10 ${THEME_CONSTANTS.spacing.md} ${THEME_CONSTANTS.shadows.card}`,
    cardHover: `${THEME_CONSTANTS.borderRadius.lg} bg-white ring-1 ring-black/10 ${THEME_CONSTANTS.spacing.md} ${THEME_CONSTANTS.shadows.md} hover:shadow-lg ${THEME_CONSTANTS.transitions.normal}`,
  };
}
