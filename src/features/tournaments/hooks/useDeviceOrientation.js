/**
 * Hook: Device Orientation & Screen Size Detection
 * Intelligently detects device type, orientation, and breakpoints
 * Returns: { orientation, screenSize, isPortrait, isLandscape, isMobile, isTablet, isDesktop, isTV }
 */

import { useState, useEffect } from 'react';

export const useDeviceOrientation = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    orientation: 'portrait', // 'portrait' | 'landscape'
    screenSize: 'mobile', // 'mobile' | 'tablet' | 'desktop' | 'tv'
    isPortrait: true,
    isLandscape: false,
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isTV: false,
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const detectOrientation = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;

    // Determina orientamento
    const isPortrait = width < height;
    const isLandscape = !isPortrait;

    // Determina dimensioni schermo (basato sulla dimensione maggiore)
    const maxDimension = Math.max(width, height);
    let screenSize = 'mobile';
    let isTV = false;
    let isDesktop = false;
    let isTablet = false;
    let isMobile = false;

    if (maxDimension < 768) {
      screenSize = 'mobile';
      isMobile = true;
    } else if (maxDimension >= 768 && maxDimension < 1024) {
      screenSize = 'tablet';
      isTablet = true;
    } else if (maxDimension >= 1024 && maxDimension < 1920) {
      screenSize = 'desktop';
      isDesktop = true;
    } else {
      screenSize = 'tv';
      isTV = true;
    }

    setDeviceInfo({
      orientation: isPortrait ? 'portrait' : 'landscape',
      screenSize,
      isPortrait,
      isLandscape,
      isMobile,
      isTablet,
      isDesktop,
      isTV,
      width,
      height,
    });

    console.log('[useDeviceOrientation]', {
      orientation: isPortrait ? 'portrait' : 'landscape',
      screenSize,
      dimensions: `${width}x${height}`,
      aspectRatio: aspectRatio.toFixed(2),
    });
  };

  useEffect(() => {
    // Initial detection
    detectOrientation();

    // Listen for resize events
    window.addEventListener('resize', detectOrientation);
    window.addEventListener('orientationchange', detectOrientation);

    return () => {
      window.removeEventListener('resize', detectOrientation);
      window.removeEventListener('orientationchange', detectOrientation);
    };
  }, []);

  return deviceInfo;
};

/**
 * Get responsive layout class names based on device
 */
export const getResponsiveClasses = (deviceInfo) => {
  const { isMobile, isTablet, isDesktop, isTV, isPortrait, isLandscape } = deviceInfo;

  return {
    container: `
      ${isPortrait ? 'portrait-layout' : 'landscape-layout'}
      ${isMobile ? 'mobile-device' : ''}
      ${isTablet ? 'tablet-device' : ''}
      ${isDesktop ? 'desktop-device' : ''}
      ${isTV ? 'tv-device' : ''}
    `.trim(),
    header: `
      ${isPortrait ? 'text-base' : 'text-lg md:text-xl'}
      ${isTV ? 'text-3xl' : ''}
    `.trim(),
    fontSize: {
      tiny: isTV ? 'text-2xl' : isDesktop ? 'text-lg' : isTablet ? 'text-base' : 'text-sm',
      small: isTV ? 'text-3xl' : isDesktop ? 'text-xl' : isTablet ? 'text-lg' : 'text-base',
      base: isTV ? 'text-4xl' : isDesktop ? 'text-2xl' : isTablet ? 'text-xl' : 'text-lg',
      large: isTV ? 'text-5xl' : isDesktop ? 'text-3xl' : isTablet ? 'text-2xl' : 'text-xl',
    },
  };
};

/**
 * Calculate optimal grid columns based on available width and item count
 */
export const calculateOptimalGridColumns = (itemCount, availableWidth) => {
  if (itemCount <= 3) return 1;
  if (itemCount <= 6) return Math.min(2, itemCount);
  if (itemCount <= 12) return Math.min(3, itemCount);
  if (itemCount <= 20) return Math.min(4, itemCount);
  return Math.min(5, itemCount);
};

export default useDeviceOrientation;
