// =============================================
// FILE: src/lib/theme.js
// Theme System integrato con Design System
// =============================================
export const LOGO_URL = "/play-sport-pro_horizontal.svg";
export const LOGO_ICON_URL = "/play-sport-pro_icon_only.svg";

// Costanti di design unificate
export const THEME_CONSTANTS = {
  // Border radius unificato
  borderRadius: {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    full: "rounded-full",
  },

  // Spacing consistente
  spacing: {
    xs: "p-2",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  },

  // Shadows unificati
  shadows: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    card: "shadow-[0_0_0_1px_rgba(0,0,0,0.02)] shadow-sm",
  },

  // Transizioni standard
  transitions: {
    fast: "transition-all duration-150 ease-in-out",
    normal: "transition-all duration-200 ease-in-out",
    slow: "transition-all duration-300 ease-in-out",
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

    // Shadows unificati con supporto dark mode
    shadowCard: THEME_CONSTANTS.shadows.card + " dark:shadow-dark-sm",
    shadowSm: THEME_CONSTANTS.shadows.sm + " dark:shadow-dark-sm",
    shadowMd: THEME_CONSTANTS.shadows.md + " dark:shadow-dark-md",
    shadowLg: THEME_CONSTANTS.shadows.lg + " dark:shadow-dark-lg",

    // Transizioni
    transitionFast: THEME_CONSTANTS.transitions.fast,
    transitionNormal: THEME_CONSTANTS.transitions.normal,
    transitionSlow: THEME_CONSTANTS.transitions.slow,

    // Focus ring unificato - emerald for light, blue for dark
    focusRing:
      "focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
    primaryRing: "ring-emerald-400 dark:ring-blue-500",
  };

  // Tema universale con supporto automatico dark mode
  return {
    name: "universal",
    ...shared,
    logos: {
      main: LOGO_URL,
      icon: LOGO_ICON_URL,
    },

    // Layout - Emerald only for light mode, original colors for dark mode
    pageBg: "bg-gray-100 dark:bg-gray-900",
    text: "text-neutral-900 dark:text-white",
    subtext: "text-neutral-600 dark:text-gray-300",
    cardBg: "bg-gray-50 dark:bg-gray-800",
    border: "ring-1 ring-emerald-400/50 dark:ring-gray-600/50",
    headerBg:
      "bg-white dark:bg-gray-800 border-b border-emerald-400/50 dark:border-gray-600/50",

    // Brand colors - Emerald for light mode, original for dark mode
    neonText: "text-emerald-600 dark:text-blue-400",
    link: "underline underline-offset-4 decoration-emerald-600 dark:decoration-blue-400 hover:text-emerald-700 dark:hover:text-blue-300",
    ghostRing:
      "ring-emerald-400/50 dark:ring-gray-600/50 hover:bg-emerald-50 dark:hover:bg-gray-700",
    tableHeadText: "text-neutral-500 dark:text-gray-400",

    // Form elements - emerald for light, original for dark
    input: `${THEME_CONSTANTS.borderRadius.md} px-3 py-2 bg-white dark:bg-gray-700 border border-emerald-400/50 dark:border-gray-600 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-gray-400 focus:border-emerald-400 dark:focus:border-blue-500 focus:ring-1 focus:ring-emerald-400 dark:focus:ring-blue-500 outline-none ${THEME_CONSTANTS.transitions.normal}`,

    // Buttons - emerald for light, blue for dark
    btnPrimary: `inline-flex items-center justify-center ${THEME_CONSTANTS.borderRadius.md} px-4 py-2 font-medium text-black dark:text-white bg-gradient-to-r from-emerald-400 to-lime-400 dark:from-blue-500 dark:to-blue-600 hover:brightness-110 active:brightness-95 ${THEME_CONSTANTS.transitions.normal} ${THEME_CONSTANTS.shadows.sm}`,
    btnGhost: `inline-flex items-center justify-center ${THEME_CONSTANTS.borderRadius.md} px-4 py-2 font-medium ring-1 ring-emerald-400/50 dark:ring-gray-600/50 hover:bg-emerald-50 dark:hover:bg-gray-700 text-neutral-900 dark:text-white ${THEME_CONSTANTS.transitions.normal}`,
    btnGhostSm: `inline-flex items-center justify-center ${THEME_CONSTANTS.borderRadius.sm} px-2 py-1 text-xs font-medium ring-1 ring-emerald-400/50 dark:ring-gray-600/50 hover:bg-emerald-50 dark:hover:bg-gray-700 text-neutral-900 dark:text-white ${THEME_CONSTANTS.transitions.normal}`,

    // Status colors - emerald for light, original for dark
    accentGood: "text-emerald-600 dark:text-green-400",
    accentBad: "text-rose-600 dark:text-rose-400",
    accentWarning: "text-amber-600 dark:text-amber-400",
    accentInfo: "text-blue-600 dark:text-blue-400",

    // Components - emerald for light, blue for dark
    chip: "bg-emerald-500 dark:bg-blue-500 text-black dark:text-white",

    // Cards unificati - emerald for light, gray for dark
    card: `${THEME_CONSTANTS.borderRadius.lg} bg-white dark:bg-gray-800 ring-1 ring-emerald-400/50 dark:ring-gray-600/50 ${THEME_CONSTANTS.spacing.md} ${THEME_CONSTANTS.shadows.card} dark:shadow-dark-sm`,
    cardHover: `${THEME_CONSTANTS.borderRadius.lg} bg-white dark:bg-gray-800 ring-1 ring-emerald-400/50 dark:ring-gray-600/50 ${THEME_CONSTANTS.spacing.md} ${THEME_CONSTANTS.shadows.md} dark:shadow-dark-md hover:shadow-lg dark:hover:shadow-dark-lg ${THEME_CONSTANTS.transitions.normal}`,
  };
}
