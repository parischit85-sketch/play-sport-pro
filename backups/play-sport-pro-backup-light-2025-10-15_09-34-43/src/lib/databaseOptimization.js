// =============================================
// FILE: src/lib/databaseOptimization.js
// DATABASE OPTIMIZATION & CACHING LIBRARY
// =============================================

import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  runTransaction,
  enableNetwork,
  disableNetwork,
} from 'firebase/firestore';
import { db } from '../services/firebase.js';

// =============================================
// CACHING LAYER
// =============================================

class DatabaseCache {
  constructor(maxSize = 1000, ttl = 5 * 60 * 1000) {
    // 5 minutes default TTL
    this.cache = new Map();
    this.metadata = new Map(); // Store timestamps and hit counts
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.hitCount = 0;
    this.missCount = 0;
    this.metrics = {
      reads: 0,
      writes: 0,
      networkRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      lastCleanup: Date.now(),
    };
  }

  generateKey(collection, queryParams = {}) {
    const sortedParams = Object.keys(queryParams)
      .sort()
      .map((key) => `${key}:${JSON.stringify(queryParams[key])}`)
      .join('|');
    return `${collection}|${sortedParams}`;
  }

  set(key, value, customTtl = null) {
    this.cleanup();

    const now = Date.now();
    const expiry = now + (customTtl || this.ttl);

    this.cache.set(key, value);
    this.metadata.set(key, {
      timestamp: now,
      expiry,
      hitCount: 0,
      size: JSON.stringify(value).length,
    });

    this.metrics.writes++;

    // Evict oldest if over size limit
    if (this.cache.size > this.maxSize) {
      this.evictOldest();
    }
  }

  get(key) {
    const value = this.cache.get(key);
    const meta = this.metadata.get(key);

    if (!value || !meta) {
      this.missCount++;
      this.metrics.cacheMisses++;
      return null;
    }

    // Check expiry
    if (Date.now() > meta.expiry) {
      this.cache.delete(key);
      this.metadata.delete(key);
      this.missCount++;
      this.metrics.cacheMisses++;
      return null;
    }

    // Update hit metrics
    meta.hitCount++;
    this.hitCount++;
    this.metrics.cacheHits++;
    this.metrics.reads++;

    return value;
  }

  invalidate(pattern) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (typeof pattern === 'string' && key.includes(pattern)) {
        keysToDelete.push(key);
      } else if (pattern instanceof RegExp && pattern.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.metadata.delete(key);
    });

    return keysToDelete.length;
  }

  cleanup() {
    const now = Date.now();

    // Only cleanup every 30 seconds to avoid overhead
    if (now - this.metrics.lastCleanup < 30000) return;

    const expiredKeys = [];
    for (const [key, meta] of this.metadata.entries()) {
      if (now > meta.expiry) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => {
      this.cache.delete(key);
      this.metadata.delete(key);
    });

    this.metrics.lastCleanup = now;
  }

  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, meta] of this.metadata.entries()) {
      if (meta.timestamp < oldestTime) {
        oldestTime = meta.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.metadata.delete(oldestKey);
    }
  }

  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? ((this.hitCount / totalRequests) * 100).toFixed(2) : 0;

    return {
      size: this.cache.size,
      hitRate: `${hitRate}%`,
      totalHits: this.hitCount,
      totalMisses: this.missCount,
      metrics: this.metrics,
    };
  }

  clear() {
    this.cache.clear();
    this.metadata.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
}

// Global cache instance
const dbCache = new DatabaseCache();

// =============================================
// QUERY OPTIMIZATION
// =============================================

class QueryOptimizer {
  constructor() {
    this.queryMetrics = new Map();
    this.slowQueryThreshold = 1000; // 1 second
    this.indexSuggestions = new Set();
  }

  async executeOptimizedQuery(collectionPath, queryParams = {}) {
    const startTime = Date.now();
    const cacheKey = dbCache.generateKey(collectionPath, queryParams);

    // Try cache first
    const cached = dbCache.get(cacheKey);
    if (cached) {
      return {
        data: cached,
        fromCache: true,
        executionTime: Date.now() - startTime,
      };
    }

    try {
      // Build Firestore query
      let firestoreQuery = collection(db, collectionPath);

      // Apply filters
      if (queryParams.where) {
        queryParams.where.forEach(([field, operator, value]) => {
          firestoreQuery = query(firestoreQuery, where(field, operator, value));
        });
      }

      // Apply ordering
      if (queryParams.orderBy) {
        queryParams.orderBy.forEach(([field, direction = 'asc']) => {
          firestoreQuery = query(firestoreQuery, orderBy(field, direction));
        });
      }

      // Apply limit
      if (queryParams.limit) {
        firestoreQuery = query(firestoreQuery, limit(queryParams.limit));
      }

      // Apply pagination
      if (queryParams.startAfter) {
        firestoreQuery = query(firestoreQuery, startAfter(queryParams.startAfter));
      }

      dbCache.metrics.networkRequests++;
      const snapshot = await getDocs(firestoreQuery);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const executionTime = Date.now() - startTime;

      // Cache the results
      const cacheTtl = this.calculateCacheTtl(collectionPath, queryParams);
      dbCache.set(cacheKey, data, cacheTtl);

      // Track query performance
      this.trackQueryPerformance(collectionPath, queryParams, executionTime);

      return {
        data,
        fromCache: false,
        executionTime,
        docsRead: snapshot.docs.length,
      };
    } catch (error) {
      this.handleQueryError(error, collectionPath, queryParams);
      throw error;
    }
  }

  calculateCacheTtl(collectionPath, queryParams) {
    // Dynamic TTL based on data type and query characteristics
    if (collectionPath.includes('bookings')) {
      // Booking data changes frequently
      return queryParams.where?.some(([field]) => field === 'date') ? 1 * 60 * 1000 : 5 * 60 * 1000;
    }

    if (collectionPath.includes('users') || collectionPath.includes('profiles')) {
      // User data changes less frequently
      return 15 * 60 * 1000; // 15 minutes
    }

    // Default TTL
    return 5 * 60 * 1000; // 5 minutes
  }

  trackQueryPerformance(collectionPath, queryParams, executionTime) {
    const queryKey = `${collectionPath}|${JSON.stringify(queryParams)}`;

    if (!this.queryMetrics.has(queryKey)) {
      this.queryMetrics.set(queryKey, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        slowQueries: 0,
      });
    }

    const metrics = this.queryMetrics.get(queryKey);
    metrics.count++;
    metrics.totalTime += executionTime;
    metrics.avgTime = metrics.totalTime / metrics.count;

    if (executionTime > this.slowQueryThreshold) {
      metrics.slowQueries++;
      this.suggestOptimization(collectionPath, queryParams, executionTime);
    }
  }

  suggestOptimization(collectionPath, queryParams, executionTime) {
    const suggestion = {
      collection: collectionPath,
      query: queryParams,
      executionTime,
      suggestions: [],
    };

    // Suggest indexes for slow queries
    if (queryParams.where && queryParams.orderBy) {
      const fields = [
        ...queryParams.where.map(([field]) => field),
        ...queryParams.orderBy.map(([field]) => field),
      ];
      suggestion.suggestions.push(
        `Consider creating composite index for fields: ${fields.join(', ')}`
      );
    }

    // Suggest pagination for large result sets
    if (!queryParams.limit) {
      suggestion.suggestions.push('Consider adding pagination with limit() for better performance');
    }

    // Suggest caching for frequently accessed data
    suggestion.suggestions.push(
      'Consider implementing client-side caching for frequently accessed data'
    );

    this.indexSuggestions.add(JSON.stringify(suggestion));
  }

  handleQueryError(error, collectionPath, queryParams) {
    if (error.code === 'failed-precondition') {
      console.warn(`🔍 Missing index detected for ${collectionPath}:`, queryParams);
      this.suggestIndex(collectionPath, queryParams);
    } else if (error.code === 'permission-denied') {
      console.warn(`🔒 Permission denied for ${collectionPath}. Check Firestore rules.`);
    }
  }

  suggestIndex(collectionPath, queryParams) {
    const fields = [];

    if (queryParams.where) {
      fields.push(
        ...queryParams.where.map(([field]) => `{ "fieldPath": "${field}", "order": "ASCENDING" }`)
      );
    }

    if (queryParams.orderBy) {
      fields.push(
        ...queryParams.orderBy.map(
          ([field, dir]) =>
            `{ "fieldPath": "${field}", "order": "${dir?.toUpperCase() || 'ASCENDING'}" }`
        )
      );
    }

    const indexSuggestion = {
      collectionGroup: collectionPath.split('/').pop(),
      queryScope: 'COLLECTION',
      fields: fields,
    };

    console.log('🔍 Suggested Firestore index:', JSON.stringify(indexSuggestion, null, 2));
  }

  getQueryStats() {
    const stats = [];
    for (const [query, metrics] of this.queryMetrics.entries()) {
      stats.push({
        query,
        ...metrics,
        slowQueryPercentage:
          metrics.count > 0 ? ((metrics.slowQueries / metrics.count) * 100).toFixed(2) : 0,
      });
    }

    return stats.sort((a, b) => b.avgTime - a.avgTime);
  }

  getIndexSuggestions() {
    return Array.from(this.indexSuggestions).map((s) => JSON.parse(s));
  }
}

// Global optimizer instance
const queryOptimizer = new QueryOptimizer();

// =============================================
// BATCH OPERATIONS
// =============================================

class BatchOperationManager {
  constructor(batchSize = 500) {
    this.batchSize = batchSize;
    this.pendingOperations = [];
    this.batchTimeout = null;
    this.metrics = {
      batchesExecuted: 0,
      operationsExecuted: 0,
      errors: 0,
    };
  }

  addOperation(type, docRef, data = null) {
    this.pendingOperations.push({ type, docRef, data });

    // Auto-execute when batch is full
    if (this.pendingOperations.length >= this.batchSize) {
      this.executeBatch();
    } else {
      // Execute after short delay to batch multiple operations
      if (this.batchTimeout) clearTimeout(this.batchTimeout);
      this.batchTimeout = setTimeout(() => this.executeBatch(), 100);
    }
  }

  async executeBatch() {
    if (this.pendingOperations.length === 0) return;

    const operations = [...this.pendingOperations];
    this.pendingOperations = [];

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    try {
      const batch = writeBatch(db);

      operations.forEach(({ type, docRef, data }) => {
        switch (type) {
          case 'set':
            batch.set(docRef, data);
            break;
          case 'update':
            batch.update(docRef, data);
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      });

      await batch.commit();

      this.metrics.batchesExecuted++;
      this.metrics.operationsExecuted += operations.length;

      // Invalidate relevant cache entries
      operations.forEach(({ docRef }) => {
        const collection = docRef.path.split('/')[0];
        dbCache.invalidate(collection);
      });
    } catch (error) {
      this.metrics.errors++;
      console.error('Batch operation failed:', error);
      throw error;
    }
  }

  async flush() {
    return this.executeBatch();
  }

  getStats() {
    return {
      ...this.metrics,
      pendingOperations: this.pendingOperations.length,
    };
  }
}

// Global batch manager
const batchManager = new BatchOperationManager();

// =============================================
// REAL-TIME SUBSCRIPTION MANAGER
// =============================================

class SubscriptionManager {
  constructor() {
    this.subscriptions = new Map();
    this.connectionState = 'connected';
    this.metrics = {
      activeSubscriptions: 0,
      totalMessages: 0,
      reconnections: 0,
    };
  }

  subscribe(collectionPath, queryParams, callback, options = {}) {
    const key = dbCache.generateKey(collectionPath, queryParams);

    // Prevent duplicate subscriptions
    if (this.subscriptions.has(key)) {
      console.warn(`Subscription already exists for ${key}`);
      return this.subscriptions.get(key).unsubscribe;
    }

    try {
      let firestoreQuery = collection(db, collectionPath);

      // Apply query parameters
      if (queryParams.where) {
        queryParams.where.forEach(([field, operator, value]) => {
          firestoreQuery = query(firestoreQuery, where(field, operator, value));
        });
      }

      if (queryParams.orderBy) {
        queryParams.orderBy.forEach(([field, direction = 'asc']) => {
          firestoreQuery = query(firestoreQuery, orderBy(field, direction));
        });
      }

      if (queryParams.limit) {
        firestoreQuery = query(firestoreQuery, limit(queryParams.limit));
      }

      const unsubscribe = onSnapshot(
        firestoreQuery,
        (snapshot) => {
          this.metrics.totalMessages++;

          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Update cache with real-time data
          const cacheTtl = queryOptimizer.calculateCacheTtl(collectionPath, queryParams);
          dbCache.set(key, data, cacheTtl);

          callback({
            data,
            metadata: {
              fromCache: snapshot.metadata.fromCache,
              hasPendingWrites: snapshot.metadata.hasPendingWrites,
              isFirstLoad: !this.subscriptions.has(key),
            },
          });
        },
        (error) => {
          console.error(`Subscription error for ${key}:`, error);
          if (options.onError) options.onError(error);
        }
      );

      this.subscriptions.set(key, {
        unsubscribe,
        collectionPath,
        queryParams,
        createdAt: Date.now(),
      });

      this.metrics.activeSubscriptions++;

      return () => this.unsubscribe(key);
    } catch (error) {
      console.error(`Failed to create subscription for ${key}:`, error);
      throw error;
    }
  }

  unsubscribe(key) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
      this.metrics.activeSubscriptions--;
    }
  }

  unsubscribeAll() {
    for (const [key] of this.subscriptions) {
      this.unsubscribe(key);
    }
  }

  async toggleOfflineMode(offline = true) {
    try {
      if (offline) {
        await disableNetwork(db);
        this.connectionState = 'offline';
      } else {
        await enableNetwork(db);
        this.connectionState = 'connected';
        this.metrics.reconnections++;
      }
    } catch (error) {
      console.error('Failed to toggle offline mode:', error);
    }
  }

  getStats() {
    return {
      ...this.metrics,
      connectionState: this.connectionState,
      subscriptionDetails: Array.from(this.subscriptions.entries()).map(([key, sub]) => ({
        key,
        collection: sub.collectionPath,
        age: Date.now() - sub.createdAt,
      })),
    };
  }
}

// Global subscription manager
const subscriptionManager = new SubscriptionManager();

// =============================================
// PUBLIC API
// =============================================

export const DatabaseOptimizer = {
  // Query operations
  async query(collectionPath, queryParams = {}) {
    return queryOptimizer.executeOptimizedQuery(collectionPath, queryParams);
  },

  async getDocument(collectionPath, docId, useCache = true) {
    const cacheKey = `${collectionPath}/${docId}`;

    if (useCache) {
      const cached = dbCache.get(cacheKey);
      if (cached) return { data: cached, fromCache: true };
    }

    try {
      dbCache.metrics.networkRequests++;
      const docSnap = await getDoc(doc(db, collectionPath, docId));

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        dbCache.set(cacheKey, data);
        return { data, fromCache: false };
      }

      return { data: null, fromCache: false };
    } catch (error) {
      console.error(`Failed to get document ${collectionPath}/${docId}:`, error);
      throw error;
    }
  },

  // Batch operations
  batchSet(collectionPath, docId, data) {
    const docRef = doc(db, collectionPath, docId);
    batchManager.addOperation('set', docRef, data);
  },

  batchUpdate(collectionPath, docId, data) {
    const docRef = doc(db, collectionPath, docId);
    batchManager.addOperation('update', docRef, data);
  },

  batchDelete(collectionPath, docId) {
    const docRef = doc(db, collectionPath, docId);
    batchManager.addOperation('delete', docRef);
  },

  async flushBatch() {
    return batchManager.flush();
  },

  // Real-time subscriptions
  subscribe(collectionPath, queryParams, callback, options) {
    return subscriptionManager.subscribe(collectionPath, queryParams, callback, options);
  },

  unsubscribe(key) {
    subscriptionManager.unsubscribe(key);
  },

  unsubscribeAll() {
    subscriptionManager.unsubscribeAll();
  },

  // Cache management
  invalidateCache(pattern) {
    return dbCache.invalidate(pattern);
  },

  clearCache() {
    dbCache.clear();
  },

  // Offline support
  async goOffline() {
    return subscriptionManager.toggleOfflineMode(true);
  },

  async goOnline() {
    return subscriptionManager.toggleOfflineMode(false);
  },

  // Analytics and monitoring
  getCacheStats() {
    return dbCache.getStats();
  },

  getQueryStats() {
    return queryOptimizer.getQueryStats();
  },

  getBatchStats() {
    return batchManager.getStats();
  },

  getSubscriptionStats() {
    return subscriptionManager.getStats();
  },

  getIndexSuggestions() {
    return queryOptimizer.getIndexSuggestions();
  },

  // Performance utilities
  async transaction(updateFunction) {
    return runTransaction(db, updateFunction);
  },

  timestamp() {
    return serverTimestamp();
  },
};

// =============================================
// PERFORMANCE MONITORING
// =============================================

export class DatabasePerformanceMonitor {
  constructor() {
    this.metrics = {
      queriesPerSecond: 0,
      averageQueryTime: 0,
      cacheHitRate: 0,
      networkRequests: 0,
      errors: 0,
    };
    this.metricsHistory = [];
    this.startTime = Date.now();
  }

  collectMetrics() {
    const cacheStats = dbCache.getStats();
    const queryStats = queryOptimizer.getQueryStats();
    const batchStats = batchManager.getStats();
    const subscriptionStats = subscriptionManager.getStats();

    const now = Date.now();
    const uptime = now - this.startTime;

    const currentMetrics = {
      timestamp: now,
      uptime,
      cache: cacheStats,
      queries: {
        total: queryStats.length,
        averageTime: queryStats.reduce((sum, q) => sum + q.avgTime, 0) / (queryStats.length || 1),
        slowQueries: queryStats.filter((q) => q.avgTime > 1000).length,
      },
      batch: batchStats,
      subscriptions: subscriptionStats,
      networkRequests: dbCache.metrics.networkRequests,
    };

    this.metricsHistory.push(currentMetrics);

    // Keep only last hour of metrics (assuming collection every minute)
    if (this.metricsHistory.length > 60) {
      this.metricsHistory.shift();
    }

    return currentMetrics;
  }

  getPerformanceReport() {
    const latest = this.collectMetrics();

    return {
      summary: {
        uptime: latest.uptime,
        totalQueries: latest.queries.total,
        cacheHitRate: latest.cache.hitRate,
        networkRequests: latest.networkRequests,
        activeSubscriptions: latest.subscriptions.activeSubscriptions,
      },
      recommendations: this.generateRecommendations(),
      indexSuggestions: queryOptimizer.getIndexSuggestions(),
      metricsHistory: this.metricsHistory.slice(-10), // Last 10 collections
    };
  }

  generateRecommendations() {
    const recommendations = [];
    const cacheStats = dbCache.getStats();
    const queryStats = queryOptimizer.getQueryStats();

    // Cache recommendations
    const hitRate = parseFloat(cacheStats.hitRate);
    if (hitRate < 70) {
      recommendations.push({
        type: 'cache',
        priority: 'high',
        message: `Low cache hit rate (${cacheStats.hitRate}). Consider increasing cache TTL or preloading frequently accessed data.`,
      });
    }

    // Query performance recommendations
    const slowQueries = queryStats.filter((q) => q.avgTime > 1000);
    if (slowQueries.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `${slowQueries.length} slow queries detected. Consider adding indexes or implementing pagination.`,
      });
    }

    // Subscription recommendations
    const subscriptionStats = subscriptionManager.getStats();
    if (subscriptionStats.activeSubscriptions > 10) {
      recommendations.push({
        type: 'subscriptions',
        priority: 'medium',
        message: `High number of active subscriptions (${subscriptionStats.activeSubscriptions}). Consider consolidating or using polling for less critical data.`,
      });
    }

    return recommendations;
  }
}

export const performanceMonitor = new DatabasePerformanceMonitor();

// Auto-collect metrics every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceMonitor.collectMetrics();
  }, 60000);
}
