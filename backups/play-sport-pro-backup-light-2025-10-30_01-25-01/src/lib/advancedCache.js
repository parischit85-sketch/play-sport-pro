// =============================================
// FILE: src/lib/advancedCache.js
// Advanced Multi-Layer Caching System - CHK-302
// =============================================

import { performanceCollector } from '@features/admin/PerformanceMonitor';

// ============================================
// INDEXEDDB MANAGER
// ============================================

class IndexedDBCache {
  constructor(dbName = 'playsport_cache', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.init();
  }

  async init() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not available');
      return;
    }

    try {
      this.db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          // Create object stores
          if (!db.objectStoreNames.contains('cache')) {
            const store = db.createObjectStore('cache', { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('collection', 'collection', { unique: false });
          }
        };
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }

  async get(key) {
    if (!this.db) return null;

    try {
      return await new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result;
          if (result && result.expiresAt > Date.now()) {
            resolve(result.value);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600000, collection = 'unknown') {
    if (!this.db) return false;

    try {
      await new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const request = store.put({
          key,
          value,
          timestamp: Date.now(),
          expiresAt: Date.now() + ttl,
          collection,
          size: JSON.stringify(value).length,
        });

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
      return true;
    } catch (error) {
      console.error('IndexedDB set error:', error);
      return false;
    }
  }

  async delete(key) {
    if (!this.db) return false;

    try {
      await new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const request = store.delete(key);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
      return true;
    } catch (error) {
      console.error('IndexedDB delete error:', error);
      return false;
    }
  }

  async clear(collection = null) {
    if (!this.db) return false;

    try {
      if (collection) {
        // Clear specific collection
        await new Promise((resolve, reject) => {
          const transaction = this.db.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          const index = store.index('collection');
          const request = index.openCursor(IDBKeyRange.only(collection));

          request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            } else {
              resolve(true);
            }
          };
          request.onerror = () => reject(request.error);
        });
      } else {
        // Clear all
        await new Promise((resolve, reject) => {
          const transaction = this.db.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          const request = store.clear();

          request.onsuccess = () => resolve(true);
          request.onerror = () => reject(request.error);
        });
      }
      return true;
    } catch (error) {
      console.error('IndexedDB clear error:', error);
      return false;
    }
  }

  async cleanup() {
    if (!this.db) return;

    try {
      const now = Date.now();
      await new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const index = store.index('timestamp');
        const request = index.openCursor();

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            if (cursor.value.expiresAt < now) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            resolve(true);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB cleanup error:', error);
    }
  }

  async getStats() {
    if (!this.db) return { count: 0, size: 0 };

    try {
      return await new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const request = store.getAll();

        request.onsuccess = () => {
          const items = request.result;
          const stats = {
            count: items.length,
            size: items.reduce((sum, item) => sum + (item.size || 0), 0),
            collections: {},
          };

          items.forEach((item) => {
            if (!stats.collections[item.collection]) {
              stats.collections[item.collection] = { count: 0, size: 0 };
            }
            stats.collections[item.collection].count++;
            stats.collections[item.collection].size += item.size || 0;
          });

          resolve(stats);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB stats error:', error);
      return { count: 0, size: 0, collections: {} };
    }
  }
}

// ============================================
// MULTI-LAYER CACHE MANAGER
// ============================================

class CacheManager {
  constructor() {
    // Layer 1: Memory cache (fastest, volatile)
    this.memoryCache = new Map();

    // Layer 2: IndexedDB (persistent, medium speed)
    this.indexedDBCache = new IndexedDBCache();

    // Layer 3: Service Worker cache (offline support)
    // Managed separately in service-worker.js

    // Configuration
    this.config = {
      memoryMaxSize: 100, // Max items in memory
      defaultTTL: {
        courts: 3600000, // 1 hour
        bookings: 300000, // 5 minutes
        users: 1800000, // 30 minutes
        clubs: 7200000, // 2 hours
        leagues: 7200000, // 2 hours
      },
      enableIndexedDB: true,
      enableMemoryCache: true,
    };

    // Analytics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      memoryHits: 0,
      indexedDBHits: 0,
      networkHits: 0,
    };

    // Auto cleanup
    this.startAutoCleanup();
  }

  /**
   * Get data from cache (multi-layer)
   */
  async get(key, options = {}) {
    const { bypassCache = false } = options;

    if (bypassCache) {
      this.stats.misses++;
      return null;
    }

    // Layer 1: Check memory cache
    if (this.config.enableMemoryCache && this.memoryCache.has(key)) {
      const cached = this.memoryCache.get(key);
      if (cached.expiresAt > Date.now()) {
        this.stats.hits++;
        this.stats.memoryHits++;
        return cached.value;
      } else {
        this.memoryCache.delete(key);
      }
    }

    // Layer 2: Check IndexedDB
    if (this.config.enableIndexedDB) {
      const cached = await this.indexedDBCache.get(key);
      if (cached !== null) {
        // Promote to memory cache
        this.setMemoryCache(key, cached, this.getTTL(key));
        this.stats.hits++;
        this.stats.indexedDBHits++;
        return cached;
      }
    }

    // Cache miss
    this.stats.misses++;
    return null;
  }

  /**
   * Set data in cache (multi-layer)
   */
  async set(key, value, options = {}) {
    const {
      ttl = this.getTTL(key),
      collection = this.getCollectionFromKey(key),
      memoryOnly = false,
    } = options;

    this.stats.sets++;

    // Layer 1: Set in memory cache
    if (this.config.enableMemoryCache) {
      this.setMemoryCache(key, value, ttl);
    }

    // Layer 2: Set in IndexedDB (unless memoryOnly)
    if (this.config.enableIndexedDB && !memoryOnly) {
      await this.indexedDBCache.set(key, value, ttl, collection);
    }

    return true;
  }

  /**
   * Delete from all cache layers
   */
  async delete(key) {
    this.stats.deletes++;

    // Delete from memory
    this.memoryCache.delete(key);

    // Delete from IndexedDB
    if (this.config.enableIndexedDB) {
      await this.indexedDBCache.delete(key);
    }

    return true;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidate(pattern) {
    // Pattern can be:
    // - 'collection:bookings' -> invalidate all bookings
    // - 'key:*' -> wildcard match
    // - 'all' -> clear everything

    if (pattern === 'all') {
      this.memoryCache.clear();
      if (this.config.enableIndexedDB) {
        await this.indexedDBCache.clear();
      }
      return true;
    }

    if (pattern.startsWith('collection:')) {
      const collection = pattern.replace('collection:', '');

      // Clear from memory
      for (const [key] of this.memoryCache) {
        if (this.getCollectionFromKey(key) === collection) {
          this.memoryCache.delete(key);
        }
      }

      // Clear from IndexedDB
      if (this.config.enableIndexedDB) {
        await this.indexedDBCache.clear(collection);
      }

      return true;
    }

    // Wildcard match
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));

      for (const [key] of this.memoryCache) {
        if (regex.test(key)) {
          await this.delete(key);
        }
      }

      return true;
    }

    return false;
  }

  /**
   * Warm cache with critical data
   */
  async warm(keys) {
    // Preload critical data into cache
    // This should be called after login or app initialization
    console.log(`Warming cache for ${keys.length} keys...`);

    for (const key of keys) {
      // Check if already cached
      const cached = await this.get(key);
      if (cached !== null) {
        console.log(`✓ Cache hit for ${key}`);
        continue;
      }

      // If not cached, you would fetch from Firestore here
      // This is application-specific logic
      console.log(`⚠ Cache miss for ${key} - needs fetch`);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
        : 0;

    const indexedDBStats = this.config.enableIndexedDB
      ? await this.indexedDBCache.getStats()
      : { count: 0, size: 0, collections: {} };

    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2),
      memorySize: this.memoryCache.size,
      indexedDBSize: indexedDBStats.count,
      indexedDBBytes: indexedDBStats.size,
      indexedDBCollections: indexedDBStats.collections,
    };
  }

  /**
   * Clear all statistics
   */
  clearStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      memoryHits: 0,
      indexedDBHits: 0,
      networkHits: 0,
    };
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  setMemoryCache(key, value, ttl) {
    // Enforce max size
    if (this.memoryCache.size >= this.config.memoryMaxSize) {
      // Remove oldest entry (LRU)
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  getTTL(key) {
    const collection = this.getCollectionFromKey(key);
    return this.config.defaultTTL[collection] || 3600000; // Default 1 hour
  }

  getCollectionFromKey(key) {
    // Key format: collection:id or collection:query:hash
    const parts = key.split(':');
    return parts[0] || 'unknown';
  }

  startAutoCleanup() {
    // Cleanup expired entries every 5 minutes
    setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000
    );
  }

  async cleanup() {
    // Cleanup memory cache
    const now = Date.now();
    for (const [key, cached] of this.memoryCache) {
      if (cached.expiresAt < now) {
        this.memoryCache.delete(key);
      }
    }

    // Cleanup IndexedDB
    if (this.config.enableIndexedDB) {
      await this.indexedDBCache.cleanup();
    }
  }
}

// ============================================
// CACHED FIRESTORE WRAPPER
// ============================================

/**
 * Wrapper for Firestore operations with automatic caching
 */
export class CachedFirestore {
  constructor(firestore) {
    this.firestore = firestore;
    this.cache = new CacheManager();
  }

  /**
   * Get document with caching
   */
  async getDoc(docRef, options = {}) {
    const { bypassCache = false, ttl } = options;
    const cacheKey = `${docRef.path}`;

    // Try cache first
    if (!bypassCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached !== null) {
        return { exists: () => true, data: () => cached, id: docRef.id };
      }
    }

    // Fetch from Firestore
    const { getDoc } = await import('firebase/firestore');
    const snapshot = await getDoc(docRef);

    // Track performance
    performanceCollector.recordFirestoreRead(1, this.getCollectionName(docRef.path));

    if (snapshot.exists()) {
      const data = snapshot.data();
      // Cache the result
      await this.cache.set(cacheKey, data, { ttl });
      return snapshot;
    }

    return snapshot;
  }

  /**
   * Get collection with caching
   */
  async getDocs(query, options = {}) {
    const { bypassCache = false, ttl, cacheKey } = options;

    // Generate cache key from query
    const key = cacheKey || this.generateQueryKey(query);

    // Try cache first
    if (!bypassCache) {
      const cached = await this.cache.get(key);
      if (cached !== null) {
        return {
          docs: cached.map((doc) => ({
            id: doc.id,
            data: () => doc.data,
            exists: () => true,
          })),
          size: cached.length,
          empty: cached.length === 0,
        };
      }
    }

    // Fetch from Firestore
    const { getDocs } = await import('firebase/firestore');
    const snapshot = await getDocs(query);

    // Track performance
    performanceCollector.recordFirestoreRead(
      snapshot.size,
      this.getCollectionName(query._query?.path?.segments?.[0] || 'unknown')
    );

    // Cache the results
    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
    await this.cache.set(key, docs, { ttl });

    return snapshot;
  }

  /**
   * Set document (invalidates cache)
   */
  async setDoc(docRef, data, options = {}) {
    const { setDoc } = await import('firebase/firestore');

    // Write to Firestore
    await setDoc(docRef, data, options);

    // Track performance
    performanceCollector.recordFirestoreWrite(1, this.getCollectionName(docRef.path));

    // Invalidate cache
    await this.cache.delete(`${docRef.path}`);
    await this.cache.invalidate(`collection:${this.getCollectionName(docRef.path)}`);

    return true;
  }

  /**
   * Update document (invalidates cache)
   */
  async updateDoc(docRef, data) {
    const { updateDoc } = await import('firebase/firestore');

    // Write to Firestore
    await updateDoc(docRef, data);

    // Track performance
    performanceCollector.recordFirestoreWrite(1, this.getCollectionName(docRef.path));

    // Invalidate cache
    await this.cache.delete(`${docRef.path}`);
    await this.cache.invalidate(`collection:${this.getCollectionName(docRef.path)}`);

    return true;
  }

  /**
   * Delete document (invalidates cache)
   */
  async deleteDoc(docRef) {
    const { deleteDoc } = await import('firebase/firestore');

    // Delete from Firestore
    await deleteDoc(docRef);

    // Track performance
    performanceCollector.recordFirestoreWrite(1, this.getCollectionName(docRef.path));

    // Invalidate cache
    await this.cache.delete(`${docRef.path}`);
    await this.cache.invalidate(`collection:${this.getCollectionName(docRef.path)}`);

    return true;
  }

  /**
   * Get cache manager instance
   */
  getCacheManager() {
    return this.cache;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  getCollectionName(path) {
    if (!path) return 'unknown';
    const parts = path.split('/');
    return parts[0] || 'unknown';
  }

  generateQueryKey(query) {
    // Generate deterministic key from query
    // This is simplified - production would hash query params
    const path = query._query?.path?.segments?.join('/') || 'unknown';
    const filters = JSON.stringify(query._query?.filters || []);
    const hash = this.simpleHash(filters);
    return `${path}:query:${hash}`;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// ============================================
// EXPORTS
// ============================================

// Global cache manager instance
export const cacheManager = new CacheManager();

// Export classes for custom usage
export { CacheManager, IndexedDBCache };

export default cacheManager;
