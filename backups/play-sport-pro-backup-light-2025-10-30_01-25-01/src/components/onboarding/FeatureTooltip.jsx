/**
 * FeatureTooltips Component - CHK-306
 *
 * Contextual tooltips for feature discovery.
 * Shows hints on hover or first interaction.
 * Features:
 * - Appears on trigger (hover, click, first-time)
 * - Auto-dismiss after delay
 * - Persistent storage (don't show again)
 * - Customizable position and style
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Lightbulb } from 'lucide-react';

const FeatureTooltip = ({
  children,
  content,
  title,
  placement = 'top',
  trigger = 'hover', // hover, click, auto
  delay = 2000,
  featureId,
  showOnce = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);

  const storageKey = `tooltip_${featureId}_shown`;

  // Check if already shown
  useEffect(() => {
    if (showOnce && featureId) {
      const shown = localStorage.getItem(storageKey);
      setHasBeenShown(!!shown);
    }
  }, [featureId, showOnce, storageKey]);

  // Auto-show on mount
  useEffect(() => {
    if (trigger === 'auto' && !hasBeenShown) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        markAsShown();
      }, 500);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [trigger, hasBeenShown]);

  const markAsShown = () => {
    if (showOnce && featureId) {
      localStorage.setItem(storageKey, 'true');
      setHasBeenShown(true);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover' && !hasBeenShown) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        markAsShown();
      }, delay);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
      if (!isVisible) {
        markAsShown();
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    markAsShown();
  };

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (!containerRef.current || !tooltipRef.current) return {};

    const container = containerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = -tooltip.height - 12;
        left = container.width / 2 - tooltip.width / 2;
        break;
      case 'bottom':
        top = container.height + 12;
        left = container.width / 2 - tooltip.width / 2;
        break;
      case 'left':
        top = container.height / 2 - tooltip.height / 2;
        left = -tooltip.width - 12;
        break;
      case 'right':
        top = container.height / 2 - tooltip.height / 2;
        left = container.width + 12;
        break;
      default:
        top = -tooltip.height - 12;
        left = container.width / 2 - tooltip.width / 2;
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
    };
  };

  // Get arrow style
  const getArrowClass = () => {
    const baseClasses = 'absolute w-0 h-0 border-solid';
    const colorClasses = 'border-blue-600 border-blue-500';

    switch (placement) {
      case 'top':
        return `${baseClasses} ${colorClasses} border-t-8 border-x-8 border-b-0 border-x-transparent left-1/2 -translate-x-1/2 -bottom-2`;
      case 'bottom':
        return `${baseClasses} ${colorClasses} border-b-8 border-x-8 border-t-0 border-x-transparent left-1/2 -translate-x-1/2 -top-2`;
      case 'left':
        return `${baseClasses} ${colorClasses} border-l-8 border-y-8 border-r-0 border-y-transparent top-1/2 -translate-y-1/2 -right-2`;
      case 'right':
        return `${baseClasses} ${colorClasses} border-r-8 border-y-8 border-l-0 border-y-transparent top-1/2 -translate-y-1/2 -left-2`;
      default:
        return `${baseClasses} ${colorClasses} border-t-8 border-x-8 border-b-0 border-x-transparent left-1/2 -translate-x-1/2 -bottom-2`;
    }
  };

  if (hasBeenShown && showOnce) {
    return <div ref={containerRef}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}

      {isVisible && (
        <div ref={tooltipRef} style={getTooltipStyle()} className="absolute z-50 animate-fade-in">
          <div className="bg-blue-600 bg-blue-500 text-white rounded-lg shadow-2xl p-4 max-w-xs">
            {/* Arrow */}
            <div className={getArrowClass()} />

            {/* Content */}
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {title && <h4 className="font-bold text-sm mb-1">{title}</h4>}
                <p className="text-sm leading-relaxed opacity-95">{content}</p>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                aria-label="Chiudi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dismiss hint */}
            {trigger === 'auto' && (
              <div className="text-xs opacity-75 mt-2 text-center">Clic per chiudere</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureTooltip;

// Helper HOC to wrap elements with tooltips
export const withTooltip = (Component, tooltipProps) => {
  return (props) => (
    <FeatureTooltip {...tooltipProps}>
      <Component {...props} />
    </FeatureTooltip>
  );
};

