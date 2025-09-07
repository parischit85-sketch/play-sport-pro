// =============================================
// FILE: src/components/ui/Badge.jsx
// =============================================
import React from 'react';

const BADGE_VARIANTS = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
  danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  primary: 'bg-emerald-500 text-black font-medium',
};

const BADGE_SIZES = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-sm',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  removable = false,
  onRemove,
  T,
}) {
  const variantClass = BADGE_VARIANTS[variant] || BADGE_VARIANTS.default;
  const sizeClass = BADGE_SIZES[size] || BADGE_SIZES.sm;

  // Protezione per design system non disponibile
  const borderClass = T?.borderMd || 'rounded-md';
  const transitionClass = T?.transitionFast || 'transition-all duration-200';

  return (
    <span
      className={`
      inline-flex items-center gap-1 
      ${borderClass} 
      ${variantClass} 
      ${sizeClass}
      font-medium
      ${transitionClass}
    `}
    >
      {icon && <span className="w-3 h-3">{icon}</span>}
      {children}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 rounded-full w-3 h-3 flex items-center justify-center text-xs"
        >
          ×
        </button>
      )}
    </span>
  );
}
