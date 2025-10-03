// =============================================
// FILE: src/services/optimizedBookingService.js
// OPTIMIZED BOOKING SERVICE WITH CACHING & PERFORMANCE
// =============================================

import { DatabaseOptimizer } from '../lib/databaseOptimization.js';
import { db } from './firebase.js';
import { doc, serverTimestamp } from 'firebase/firestore';

// =============================================
// CONSTANTS
// =============================================

const COLLECTIONS = {
  BOOKINGS: 'bookings',
  USERS: 'users',
  CLUBS: 'clubs',
};

const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
};

// =============================================
// OPTIMIZED QUERY PATTERNS
// =============================================

class OptimizedBookingService {
  constructor() {
    this.subscriptions = new Map();
    this.preloadedData = new Map();
  }

  // =============================================
  // READ OPERATIONS (WITH CACHING)
  // =============================================

  async getUserBookings(userId, options = {}) {
    const {
      includeHistory = false,
      includeCancelled = false,
      limit = 50,
      useCache = true,
    } = options;

    const today = new Date().toISOString().split('T')[0];
    const filters = [['createdBy', '==', userId]];
    
    if (!includeCancelled) {
      filters.push(['status', 'in', [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING]]);
    }
    
    if (!includeHistory) {
      filters.push(['date', '>=', today]);
    }

    const queryParams = {
      where: filters,
      orderBy: [['date', includeHistory ? 'desc' : 'asc'], ['time', 'asc']],
      limit,
    };

    const result = await DatabaseOptimizer.query(COLLECTIONS.BOOKINGS, queryParams);
    
    return {
      bookings: result.data,
      fromCache: result.fromCache,
      performance: {
        executionTime: result.executionTime,
        docsRead: result.docsRead || 0,
      },
    };
  }

  async getActiveBookings(options = {}) {
    const { limit = 100, courtType = null, date = null } = options;
    const today = new Date().toISOString().split('T')[0];
    
    const filters = [
      ['status', '==', BOOKING_STATUS.CONFIRMED],
      ['date', '>=', date || today],
    ];
    
    if (courtType) {
      filters.push(['courtType', '==', courtType]);
    }

    const queryParams = {
      where: filters,
      orderBy: [['date', 'asc'], ['time', 'asc']],
      limit,
    };

    return DatabaseOptimizer.query(COLLECTIONS.BOOKINGS, queryParams);
  }

  async getBookingHistory(userId, options = {}) {
    const { limit = 20, page = 0 } = options;
    const today = new Date().toISOString().split('T')[0];

    const queryParams = {
      where: [
        ['createdBy', '==', userId],
        ['date', '<', today],
      ],
      orderBy: [['date', 'desc'], ['time', 'desc']],
      limit,
    };

    // Implement pagination
    if (page > 0) {
      // Note: In a real implementation, you'd need to store and pass the last document
      // This is a simplified version
      queryParams.startAfter = page * limit;
    }

    return DatabaseOptimizer.query(COLLECTIONS.BOOKINGS, queryParams);
  }

  async searchBookings(searchParams = {}) {
    const { userId, email, playerName, date, courtType, status } = searchParams;
    
    // Build dynamic query based on available parameters
    const queries = [];
    
    if (userId) {
      queries.push(this._buildSearchQuery([['createdBy', '==', userId]], searchParams));
    }
    
    if (email) {
      queries.push(this._buildSearchQuery([['userEmail', '==', email]], searchParams));
    }
    
    if (playerName) {
      // Note: Firestore doesn't support full-text search natively
      // This would need to be handled differently in production
      queries.push(this._buildSearchQuery([['bookedBy', '==', playerName]], searchParams));
    }

    // Execute all queries in parallel
    const results = await Promise.all(queries);
    
    // Merge and deduplicate results
    const bookingsMap = new Map();
    results.forEach(result => {
      result.data.forEach(booking => {
        bookingsMap.set(booking.id, booking);
      });
    });

    return {
      data: Array.from(bookingsMap.values()),
      fromCache: results.some(r => r.fromCache),
      totalQueries: queries.length,
    };
  }

  _buildSearchQuery(baseFilters, additionalParams) {
    const filters = [...baseFilters];
    
    if (additionalParams.date) {
      filters.push(['date', '==', additionalParams.date]);
    }
    
    if (additionalParams.status) {
      filters.push(['status', '==', additionalParams.status]);
    }
    
    if (additionalParams.courtType) {
      filters.push(['courtType', '==', additionalParams.courtType]);
    }

    return DatabaseOptimizer.query(COLLECTIONS.BOOKINGS, {
      where: filters,
      orderBy: [['date', 'desc'], ['time', 'desc']],
      limit: 50,
    });
  }

  // =============================================
  // WRITE OPERATIONS (WITH BATCHING)
  // =============================================

  async createBooking(bookingData) {
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const booking = {
      ...bookingData,
      id: bookingId,
      status: BOOKING_STATUS.CONFIRMED,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Use batch operation for better performance
    DatabaseOptimizer.batchSet(COLLECTIONS.BOOKINGS, bookingId, booking);
    
    // Optionally flush immediately for critical operations
    await DatabaseOptimizer.flushBatch();
    
    // Invalidate relevant cache entries
    DatabaseOptimizer.invalidateCache(COLLECTIONS.BOOKINGS);
    
    return { id: bookingId, ...booking };
  }

  async updateBooking(bookingId, updates) {
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    DatabaseOptimizer.batchUpdate(COLLECTIONS.BOOKINGS, bookingId, updateData);
    await DatabaseOptimizer.flushBatch();
    
    // Invalidate cache
    DatabaseOptimizer.invalidateCache(COLLECTIONS.BOOKINGS);
    
    return updateData;
  }

  async cancelBooking(bookingId, reason = 'User cancelled') {
    const updates = {
      status: BOOKING_STATUS.CANCELLED,
      cancelledAt: serverTimestamp(),
      cancellationReason: reason,
      updatedAt: serverTimestamp(),
    };

    DatabaseOptimizer.batchUpdate(COLLECTIONS.BOOKINGS, bookingId, updates);
    await DatabaseOptimizer.flushBatch();
    
    DatabaseOptimizer.invalidateCache(COLLECTIONS.BOOKINGS);
    
    return updates;
  }

  async bulkUpdateBookings(bookingIds, updates) {
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Use batch operations for bulk updates
    bookingIds.forEach(id => {
      DatabaseOptimizer.batchUpdate(COLLECTIONS.BOOKINGS, id, updateData);
    });

    await DatabaseOptimizer.flushBatch();
    DatabaseOptimizer.invalidateCache(COLLECTIONS.BOOKINGS);
    
    return { updated: bookingIds.length };
  }

  // =============================================
  // REAL-TIME SUBSCRIPTIONS
  // =============================================

  subscribeToUserBookings(userId, callback, options = {}) {
    const subscriptionKey = `user_bookings_${userId}`;
    
    // Prevent duplicate subscriptions
    if (this.subscriptions.has(subscriptionKey)) {
      return this.subscriptions.get(subscriptionKey);
    }

    const queryParams = {
      where: [['createdBy', '==', userId]],
      orderBy: [['date', 'desc'], ['time', 'desc']],
      limit: options.limit || 50,
    };

    const unsubscribe = DatabaseOptimizer.subscribe(
      COLLECTIONS.BOOKINGS,
      queryParams,
      (result) => {
        callback({
          bookings: result.data,
          fromCache: result.metadata.fromCache,
          isFirstLoad: result.metadata.isFirstLoad,
        });
      },
      {
        onError: (error) => {
          console.error(`Subscription error for user ${userId}:`, error);
          if (options.onError) options.onError(error);
        },
      }
    );

    this.subscriptions.set(subscriptionKey, unsubscribe);
    return unsubscribe;
  }

  subscribeToActiveBookings(callback, options = {}) {
    const subscriptionKey = 'active_bookings';
    
    if (this.subscriptions.has(subscriptionKey)) {
      return this.subscriptions.get(subscriptionKey);
    }

    const today = new Date().toISOString().split('T')[0];
    const queryParams = {
      where: [
        ['status', '==', BOOKING_STATUS.CONFIRMED],
        ['date', '>=', today],
      ],
      orderBy: [['date', 'asc'], ['time', 'asc']],
      limit: options.limit || 100,
    };

    const unsubscribe = DatabaseOptimizer.subscribe(
      COLLECTIONS.BOOKINGS,
      queryParams,
      callback,
      options
    );

    this.subscriptions.set(subscriptionKey, unsubscribe);
    return unsubscribe;
  }

  unsubscribeFromUserBookings(userId) {
    const subscriptionKey = `user_bookings_${userId}`;
    const unsubscribe = this.subscriptions.get(subscriptionKey);
    
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions.clear();
  }

  // =============================================
  // PERFORMANCE & ANALYTICS
  // =============================================

  async preloadFrequentData(userId) {
    // Preload commonly accessed data to improve performance
    const preloadPromises = [
      // User's recent bookings
      this.getUserBookings(userId, { limit: 20 }),
      // Today's active bookings for availability checking
      this.getActiveBookings({ date: new Date().toISOString().split('T')[0], limit: 50 }),
    ];

    try {
      const results = await Promise.all(preloadPromises);
      
      this.preloadedData.set(`user_recent_${userId}`, results[0]);
      this.preloadedData.set('today_active', results[1]);
      
      return {
        success: true,
        preloadedItems: preloadPromises.length,
      };
    } catch (error) {
      console.error('Failed to preload data:', error);
      return { success: false, error: error.message };
    }
  }

  getPerformanceMetrics() {
    return {
      cache: DatabaseOptimizer.getCacheStats(),
      queries: DatabaseOptimizer.getQueryStats(),
      batch: DatabaseOptimizer.getBatchStats(),
      subscriptions: DatabaseOptimizer.getSubscriptionStats(),
      activeSubscriptions: this.subscriptions.size,
    };
  }

  getOptimizationSuggestions() {
    return {
      indexes: DatabaseOptimizer.getIndexSuggestions(),
      queries: DatabaseOptimizer.getQueryStats()
        .filter(q => q.avgTime > 1000)
        .map(q => ({
          query: q.query,
          avgTime: q.avgTime,
          suggestion: 'Consider adding composite index or implementing pagination',
        })),
    };
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  async checkAvailability(date, time, courtType = null, duration = 60) {
    const endTime = this._addMinutes(time, duration);
    
    const queryParams = {
      where: [
        ['date', '==', date],
        ['status', '==', BOOKING_STATUS.CONFIRMED],
        ['time', '<=', endTime],
        ['endTime', '>', time],
      ],
      limit: 100,
    };

    if (courtType) {
      queryParams.where.push(['courtType', '==', courtType]);
    }

    const result = await DatabaseOptimizer.query(COLLECTIONS.BOOKINGS, queryParams);
    
    return {
      available: result.data.length === 0,
      conflictingBookings: result.data,
      fromCache: result.fromCache,
    };
  }

  _addMinutes(timeString, minutes) {
    const [hours, mins] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  }

  // Manual cache management
  invalidateUserCache(userId) {
    DatabaseOptimizer.invalidateCache(`user_bookings_${userId}`);
    this.preloadedData.delete(`user_recent_${userId}`);
  }

  clearAllCaches() {
    DatabaseOptimizer.clearCache();
    this.preloadedData.clear();
  }

  // Offline support
  async enableOfflineMode() {
    return DatabaseOptimizer.goOffline();
  }

  async enableOnlineMode() {
    return DatabaseOptimizer.goOnline();
  }
}

// =============================================
// EXPORTS
// =============================================

export const optimizedBookingService = new OptimizedBookingService();

// Convenience exports for direct usage
export const {
  getUserBookings,
  getActiveBookings,
  getBookingHistory,
  searchBookings,
  createBooking,
  updateBooking,
  cancelBooking,
  bulkUpdateBookings,
  subscribeToUserBookings,
  subscribeToActiveBookings,
  unsubscribeFromUserBookings,
  unsubscribeAll,
  preloadFrequentData,
  getPerformanceMetrics,
  getOptimizationSuggestions,
  checkAvailability,
  invalidateUserCache,
  clearAllCaches,
  enableOfflineMode,
  enableOnlineMode,
} = optimizedBookingService;

export default optimizedBookingService;