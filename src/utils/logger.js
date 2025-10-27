// =============================================
// FILE: src/utils/logger.js
// Centralized logging utility with environment awareness
// =============================================

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

/**
 * Centralized logger with environment awareness
 * - Development: All logs visible
 * - Production: Only errors and critical warnings
 */
export const logger = {
  /**
   * Debug logs - only in development
   */
  debug: (...args) => {
    if (isDev) {
      console.log('🔍 [DEBUG]', ...args);
    }
  },

  /**
   * Info logs - only in development
   */
  log: (...args) => {
    if (isDev) {
      console.log('ℹ️  [INFO]', ...args);
    }
  },

  /**
   * Info logs - only in development (alias)
   */
  info: (...args) => {
    if (isDev) {
      console.info('ℹ️  [INFO]', ...args);
    }
  },

  /**
   * Warning logs - always visible but styled differently
   */
  warn: (...args) => {
    if (isDev) {
      console.warn('⚠️  [WARN]', ...args);
    } else {
      // In production, send to error tracking service (Sentry)
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Error logs - ALWAYS visible
   * In production, should also send to error tracking
   */
  error: (...args) => {
    console.error('❌ [ERROR]', ...args);
    
    // In production, send to Sentry
    if (isProd && window.Sentry) {
      window.Sentry.captureException(new Error(args.join(' ')));
    }
  },

  /**
   * Success logs - only in development
   */
  success: (...args) => {
    if (isDev) {
      console.log('✅ [SUCCESS]', ...args);
    }
  },

  /**
   * Table logs - only in development
   */
  table: (data) => {
    if (isDev) {
      console.table(data);
    }
  },

  /**
   * Group logs - only in development
   */
  group: (label, ...args) => {
    if (isDev) {
      console.group(label);
      args.forEach(arg => console.log(arg));
      console.groupEnd();
    }
  },

  /**
   * Collapsed group logs - only in development
   */
  groupCollapsed: (label, ...args) => {
    if (isDev) {
      console.groupCollapsed(label);
      args.forEach(arg => console.log(arg));
      console.groupEnd();
    }
  },

  /**
   * Time measurement - only in development
   */
  time: (label) => {
    if (isDev) {
      console.time(label);
    }
  },

  timeEnd: (label) => {
    if (isDev) {
      console.timeEnd(label);
    }
  },

  /**
   * Performance tracking
   */
  perf: (label, fn) => {
    if (isDev) {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      console.log(`⚡ [PERF] ${label}: ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return fn();
  },

  /**
   * Async performance tracking
   */
  perfAsync: async (label, fn) => {
    if (isDev) {
      const start = performance.now();
      const result = await fn();
      const end = performance.now();
      console.log(`⚡ [PERF] ${label}: ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return await fn();
  },
};

export default logger;
