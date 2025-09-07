// =============================================
// FILE: src/utils/cache.js
// =============================================

/**
 * Simple cache implementation for performance optimization
 */
class SimpleCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move to end (LRU)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    // Remove oldest if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Global cache instances
export const dataCache = new SimpleCache(50);
export const componentCache = new SimpleCache(20);

/**
 * Hook for caching data with TTL
 */
export function useCachedData(key, fetcher, ttl = 5 * 60 * 1000) { // 5 minutes default
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      // Check cache first
      const cached = dataCache.get(key);
      if (cached && Date.now() - cached.timestamp < ttl) {
        setData(cached.data);
        return;
      }

      setLoading(true);
      try {
        const result = await fetcher();
        dataCache.set(key, { data: result, timestamp: Date.now() });
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, fetcher, ttl]);

  return { data, loading, error };
}

/**
 * Utility for memoizing expensive calculations
 */
export function memoize(fn, maxSize = 50) {
  const cache = new SimpleCache(maxSize);
  
  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Cached version of theme tokens
export const getCachedThemeTokens = memoize(() => {
  // Import theme tokens function
  const { themeTokens } = require('../lib/theme.js');
  return themeTokens();
});

export default SimpleCache;
