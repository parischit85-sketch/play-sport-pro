// =============================================
// FILE: src/hooks/useCachedFirestore.js
// React Hook for Cached Firestore Operations - CHK-302
// =============================================

import { useState, useEffect } from 'react';
import { CachedFirestore } from '@lib/advancedCache';
import { db } from '@lib/firebase';

// Global cached firestore instance
const cachedFirestore = new CachedFirestore(db);

/**
 * Hook to fetch a single document with caching
 * 
 * @example
 * const { data, loading, error, refetch } = useCachedDoc(
 *   doc(db, 'courts', courtId),
 *   { ttl: 3600000, bypassCache: false }
 * );
 */
export function useCachedDoc(docRef, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoc = async (bypassCache = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const snapshot = await cachedFirestore.getDoc(docRef, {
        ...options,
        bypassCache,
      });

      if (snapshot.exists()) {
        setData({ id: snapshot.id, ...snapshot.data() });
      } else {
        setData(null);
      }
    } catch (err) {
      setError(err);
      console.error('Error fetching doc:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!docRef) return;
    fetchDoc();
  }, [docRef?.path]); // Re-fetch when doc reference changes

  return {
    data,
    loading,
    error,
    refetch: () => fetchDoc(true), // Force bypass cache
  };
}

/**
 * Hook to fetch a collection with caching
 * 
 * @example
 * const { data, loading, error, refetch } = useCachedCollection(
 *   query(collection(db, 'bookings'), where('userId', '==', user.uid)),
 *   { ttl: 300000, cacheKey: 'user-bookings-123' }
 * );
 */
export function useCachedCollection(queryRef, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollection = async (bypassCache = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const snapshot = await cachedFirestore.getDocs(queryRef, {
        ...options,
        bypassCache,
      });

      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setData(docs);
    } catch (err) {
      setError(err);
      console.error('Error fetching collection:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!queryRef) return;
    fetchCollection();
  }, [queryRef, options.cacheKey]); // Re-fetch when query or cache key changes

  return {
    data,
    loading,
    error,
    refetch: () => fetchCollection(true), // Force bypass cache
  };
}

/**
 * Get the cached firestore instance
 */
export function getCachedFirestore() {
  return cachedFirestore;
}

/**
 * Hook to warm cache with critical data
 * 
 * @example
 * useCacheWarming(['courts:all', 'clubs:active'], user);
 */
export function useCacheWarming(keys, dependencies) {
  useEffect(() => {
    if (!dependencies) return;

    const warmCache = async () => {
      const cache = cachedFirestore.getCacheManager();
      await cache.warm(keys);
    };

    warmCache();
  }, [dependencies]);
}

export default {
  useCachedDoc,
  useCachedCollection,
  getCachedFirestore,
  useCacheWarming,
};
