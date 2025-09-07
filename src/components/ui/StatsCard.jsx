// =============================================
// FILE: src/components/ui/StatsCard.jsx
// =============================================
import React from 'react';

const STAT_COLORS = {
  default: '',
  success: 'text-emerald-500 dark:text-emerald-400',
  danger: 'text-rose-500 dark:text-rose-400',
  warning: 'text-amber-500 dark:text-amber-400',
  info: 'text-blue-500 dark:text-blue-400',
  primary: 'text-emerald-600 dark:text-emerald-400',
};

const STAT_SIZES = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
};

export default function StatsCard({
  label,
  value,
  subtitle,
  trend,
  color = 'default',
  size = 'lg',
  variant = 'default',
  icon,
  T,
}) {
  const colorClass = STAT_COLORS[color] || STAT_COLORS.default;
  const sizeClass = STAT_SIZES[size] || STAT_SIZES.lg;

  const getTrendIcon = (trend) => {
    if (trend > 0) return '↗';
    if (trend < 0) return '↘';
    return '→';
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-emerald-500';
    if (trend < 0) return 'text-rose-500';
    return 'text-gray-500';
  };

  // Varianti di card
  const variants = {
    default: T.card,
    compact: `${T.borderMd} ${T.cardBg} ${T.border} ${T.spacingSm}`,
    elevated: T.cardHover,
  };

  return (
    <div className={`${variants[variant]} text-center ${T.transitionNormal}`}>
      {icon && (
        <div className="flex justify-center mb-2">
          <div className={`w-8 h-8 ${colorClass}`}>{icon}</div>
        </div>
      )}

      <div className={`text-xs uppercase tracking-wide font-medium ${T.subtext} mb-1`}>{label}</div>

      <div className={`${sizeClass} font-bold leading-tight ${colorClass}`}>
        {value}
        {trend !== undefined && (
          <span className={`text-xs ml-1 ${getTrendColor(trend)}`}>{getTrendIcon(trend)}</span>
        )}
      </div>

      {subtitle && <div className={`text-xs ${T.subtext} mt-1`}>{subtitle}</div>}
    </div>
  );
}
