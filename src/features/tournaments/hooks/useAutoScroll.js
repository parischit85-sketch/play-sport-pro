import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook for managing auto-scroll functionality with pause/play controls
 * Handles: interval management, progress tracking, per-page timing
 *
 * @param {Object} options
 * @param {number} options.pageIndex - Current page index
 * @param {Array} options.pages - Array of pages
 * @param {boolean} options.isPaused - Whether auto-scroll is paused
 * @param {Object} options.tournament - Tournament data with publicView.settings.pageIntervals
 * @param {Function} options.onPageChange - Callback when page advances
 * @returns {Object} Auto-scroll state and controls
 *
 * @example
 * const { progress, canAdvance } = useAutoScroll({
 *   pageIndex: currentPageIndex,
 *   pages: ['A', 'B', 'C', 'qr'],
 *   isPaused: isPaused,
 *   tournament: tournament,
 *   onPageChange: (newIndex) => setCurrentPageIndex(newIndex),
 * });
 */
export const useAutoScroll = ({
  pageIndex = 0,
  pages = [],
  isPaused = false,
  tournament = {},
  onPageChange = () => {},
}) => {
  const [progress, setProgress] = useState(0);
  const autoScrollRef = useRef(null);
  const progressRef = useRef(null);
  const durationRef = useRef(null);

  // ============ GET PAGE TIMING ============
  // Retrieves timing for current page from tournament settings
  // Falls back to defaults if not configured
  const getPageTiming = useCallback(() => {
    if (!pages.length || !tournament.publicView || pageIndex >= pages.length) {
      return 20; // Default 20 seconds
    }

    const pageIntervals = tournament.publicView?.settings?.pageIntervals || {};
    const currentPage = pages[pageIndex];

    // Map page identifier to timing key
    if (currentPage === 'qr') return pageIntervals.qr || 15;
    if (currentPage === 'bracket') return pageIntervals.bracket || 30;

    // For group pages (A, B, C, etc.)
    if (currentPage && typeof currentPage === 'string') {
      const groupKey = `group${currentPage.toUpperCase()}`;
      return pageIntervals[groupKey] || pageIntervals[currentPage] || 20;
    }

    return 20; // Default fallback
  }, [pages, pageIndex, tournament.publicView]);

  // Get current page duration
  const duration = getPageTiming();

  // ============ AUTO-SCROLL EXECUTION ============
  // Manages intervals for progress bar and page advancement
  useEffect(() => {
    if (isPaused) {
      // Clean up intervals when paused
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
        autoScrollRef.current = null;
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
      // Keep progress where it is (user can see how long until next page)
      return;
    }

    // Progress bar updates 10 times per second for smooth animation
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        // Increment: 100% over duration seconds, updated every 100ms
        // = 100 / (duration * 10) per interval
        return prev + 100 / (duration * 10);
      });
    }, 100);

    // Page advance interval
    autoScrollRef.current = setInterval(() => {
      setProgress(0);
      onPageChange((prev) => (prev + 1) % pages.length);
    }, duration * 1000);

    // Cleanup function
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
        autoScrollRef.current = null;
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
    };
  }, [isPaused, duration, pages.length, onPageChange]);

  // ============ RESET PROGRESS ON MANUAL PAGE CHANGE ============
  // When user manually navigates to a different page, reset progress
  useEffect(() => {
    // This is for detecting external page changes (e.g., user clicked next/prev)
    // The component using this hook should call a reset function
  }, [pageIndex]);

  // ============ MANUAL CONTROLS ============
  // Reset progress (e.g., after manual navigation)
  const resetProgress = useCallback(() => {
    setProgress(0);
  }, []);

  // Pause auto-scroll (call this via parent component)
  const pause = useCallback(() => {
    // Parent component handles setPaused(true)
  }, []);

  // Resume auto-scroll (call this via parent component)
  const resume = useCallback(() => {
    // Parent component handles setPaused(false)
  }, []);

  // ============ RETURN OBJECT ============
  return {
    // Current state
    progress, // 0-100 percentage
    duration, // Duration in seconds for current page
    currentPage: pages[pageIndex] || null,

    // Page info
    totalPages: pages.length,
    pageIndex,

    // Timing info
    getPageTiming,

    // Controls
    resetProgress,
    pause,
    resume,

    // Helper checks
    isLastPage: pageIndex === pages.length - 1,
    isFirstPage: pageIndex === 0,
    isPaused,

    // Helper: Time remaining in seconds (approximate)
    timeRemaining: Math.round(((100 - progress) / 100) * duration),
  };
};

/**
 * Helper hook for auto-scroll with keyboard controls
 * Adds support for space bar to pause/resume
 *
 * @param {Object} options - Same as useAutoScroll
 * @param {boolean} enableKeyboardControls - Enable space/arrow key controls
 * @returns {Object} Same as useAutoScroll + keyboard state
 */
export const useAutoScrollWithKeyboard = (options, enableKeyboardControls = true) => {
  const autoScroll = useAutoScroll(options);
  const [_isPaused, setIsPaused] = useState(options.isPaused || false);

  useEffect(() => {
    if (!enableKeyboardControls) return;

    const handleKeyDown = (e) => {
      // Space bar: pause/resume
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
        autoScroll.resetProgress();
      }

      // Arrow keys: navigate (parent should handle)
      // Left arrow: previous page
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        autoScroll.resetProgress();
      }

      // Right arrow: next page
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        autoScroll.resetProgress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardControls, autoScroll]);

  return {
    ...autoScroll,
    keyboardPaused: _isPaused,
  };
};

/**
 * Get timing configuration for a tournament's public view
 * Useful for displaying timing info to users
 *
 * @param {Object} tournament - Tournament object
 * @returns {Object} Timing configuration with defaults
 */
export const getTournamentPageIntervals = (tournament = {}) => {
  const defaults = {
    groupA: 20,
    groupB: 20,
    groupC: 20,
    bracket: 30,
    qr: 15,
  };

  const configured = tournament.publicView?.settings?.pageIntervals || {};

  return {
    ...defaults,
    ...configured,
    // Validate: ensure all are numbers > 0
    groupA: Math.max(5, Math.min(300, configured.groupA || defaults.groupA)),
    groupB: Math.max(5, Math.min(300, configured.groupB || defaults.groupB)),
    groupC: Math.max(5, Math.min(300, configured.groupC || defaults.groupC)),
    bracket: Math.max(5, Math.min(300, configured.bracket || defaults.bracket)),
    qr: Math.max(5, Math.min(300, configured.qr || defaults.qr)),
  };
};

/**
 * Calculate total auto-scroll cycle time
 * Useful for displaying "Full cycle: X minutes"
 *
 * @param {Array} groups - Group identifiers (e.g., ['A', 'B', 'C'])
 * @param {Object} intervals - Timing intervals from getTournamentPageIntervals
 * @returns {Object} Cycle time info
 */
export const calculateAutoScrollCycleTime = (groups = [], intervals = {}) => {
  const groupCount = groups.length;
  const groupTime = (intervals.groupA + intervals.groupB + intervals.groupC) / Math.max(1, groupCount);
  const totalSeconds = groupTime * groupCount + intervals.bracket + intervals.qr;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    totalSeconds,
    minutes,
    seconds,
    display: `${minutes}m ${seconds}s`,
    pagesCount: groupCount + 2, // Groups + Bracket + QR
  };
};

export default useAutoScroll;
