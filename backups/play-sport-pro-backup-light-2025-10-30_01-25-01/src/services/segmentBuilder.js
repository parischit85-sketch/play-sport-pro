/**
 * @fileoverview SegmentBuilder - Sistema avanzato di segmentazione utenti
 * per targeting personalizzato delle notifiche
 *
 * Features:
 * - Demographic filters (età, genere, località)
 * - Behavioral filters (booking count, last activity, engagement)
 * - Certificate-based filters (status, expiry date)
 * - Custom attribute filters
 * - Segment chaining (AND/OR logic)
 * - Segment persistence in Firestore
 * - Real-time segment size estimation
 *
 * @author Play Sport Pro Team
 * @version 2.0.0
 * @since Phase 3
 */

import { db } from '@/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  Timestamp,
  orderBy,
  limit,
} from 'firebase/firestore';

/**
 * Segment Operators per comparazioni
 */
export const SEGMENT_OPERATORS = {
  EQUALS: '==',
  NOT_EQUALS: '!=',
  GREATER_THAN: '>',
  GREATER_THAN_OR_EQUAL: '>=',
  LESS_THAN: '<',
  LESS_THAN_OR_EQUAL: '<=',
  IN: 'in',
  NOT_IN: 'not-in',
  ARRAY_CONTAINS: 'array-contains',
  ARRAY_CONTAINS_ANY: 'array-contains-any',
};

/**
 * Pre-built Segment Templates
 */
export const SEGMENT_TEMPLATES = {
  VIP_USERS: {
    name: 'VIP Users',
    description: 'High-value users with 10+ bookings',
    filters: [{ field: 'bookingCount', operator: '>=', value: 10 }],
  },

  AT_RISK: {
    name: 'At Risk',
    description: 'Users inactive for 30+ days',
    filters: [{ field: 'lastActivityDays', operator: '>=', value: 30 }],
  },

  CERTIFICATE_EXPIRING_SOON: {
    name: 'Certificate Expiring Soon',
    description: 'Certificate expires in 7 days',
    filters: [
      { field: 'certificateExpiryDays', operator: '<=', value: 7 },
      { field: 'certificateExpiryDays', operator: '>', value: 0 },
    ],
  },

  NEW_USERS: {
    name: 'New Users',
    description: 'Registered in last 7 days',
    filters: [{ field: 'accountAgeDays', operator: '<=', value: 7 }],
  },

  HIGH_ENGAGEMENT: {
    name: 'High Engagement',
    description: 'Active in last 7 days with 3+ bookings',
    filters: [
      { field: 'lastActivityDays', operator: '<=', value: 7 },
      { field: 'bookingCount', operator: '>=', value: 3 },
    ],
  },

  PAYMENT_DUE: {
    name: 'Payment Due',
    description: 'Unpaid invoices',
    filters: [{ field: 'hasPendingPayment', operator: '==', value: true }],
  },
};

/**
 * SegmentBuilder Class - Fluent API per costruire segmenti
 */
class SegmentBuilder {
  constructor() {
    this.filters = [];
    this.segmentName = '';
    this.segmentDescription = '';
    this.logic = 'AND'; // AND | OR
  }

  /**
   * Set segment name
   */
  name(name) {
    this.segmentName = name;
    return this;
  }

  /**
   * Set segment description
   */
  description(description) {
    this.segmentDescription = description;
    return this;
  }

  /**
   * Set logic combiner (AND | OR)
   */
  combineWith(logic) {
    this.logic = logic.toUpperCase();
    return this;
  }

  /**
   * Filter: Last booking within N days
   */
  whereLastBookingWithin(days) {
    this.filters.push({
      field: 'lastBookingDays',
      operator: SEGMENT_OPERATORS.LESS_THAN_OR_EQUAL,
      value: days,
      description: `Last booking within ${days} days`,
    });
    return this;
  }

  /**
   * Filter: Booking count comparison
   */
  whereBookingCount(operator, count) {
    this.filters.push({
      field: 'bookingCount',
      operator,
      value: count,
      description: `Booking count ${operator} ${count}`,
    });
    return this;
  }

  /**
   * Filter: Certificate expiring within N days
   */
  whereCertificateExpiring(days) {
    this.filters.push({
      field: 'certificateExpiryDays',
      operator: SEGMENT_OPERATORS.LESS_THAN_OR_EQUAL,
      value: days,
      description: `Certificate expires within ${days} days`,
    });
    this.filters.push({
      field: 'certificateExpiryDays',
      operator: SEGMENT_OPERATORS.GREATER_THAN,
      value: 0,
      description: 'Certificate not yet expired',
    });
    return this;
  }

  /**
   * Filter: Certificate status
   */
  whereCertificateStatus(status) {
    this.filters.push({
      field: 'certificateStatus',
      operator: SEGMENT_OPERATORS.EQUALS,
      value: status,
      description: `Certificate status: ${status}`,
    });
    return this;
  }

  /**
   * Filter: Last activity within N days
   */
  whereLastActivityWithin(days) {
    this.filters.push({
      field: 'lastActivityDays',
      operator: SEGMENT_OPERATORS.LESS_THAN_OR_EQUAL,
      value: days,
      description: `Active within ${days} days`,
    });
    return this;
  }

  /**
   * Filter: Inactive for N days
   */
  whereInactiveFor(days) {
    this.filters.push({
      field: 'lastActivityDays',
      operator: SEGMENT_OPERATORS.GREATER_THAN_OR_EQUAL,
      value: days,
      description: `Inactive for ${days}+ days`,
    });
    return this;
  }

  /**
   * Filter: Age range
   */
  whereAge(minAge, maxAge) {
    if (minAge) {
      this.filters.push({
        field: 'age',
        operator: SEGMENT_OPERATORS.GREATER_THAN_OR_EQUAL,
        value: minAge,
        description: `Age >= ${minAge}`,
      });
    }
    if (maxAge) {
      this.filters.push({
        field: 'age',
        operator: SEGMENT_OPERATORS.LESS_THAN_OR_EQUAL,
        value: maxAge,
        description: `Age <= ${maxAge}`,
      });
    }
    return this;
  }

  /**
   * Filter: Gender
   */
  whereGender(gender) {
    this.filters.push({
      field: 'gender',
      operator: SEGMENT_OPERATORS.EQUALS,
      value: gender,
      description: `Gender: ${gender}`,
    });
    return this;
  }

  /**
   * Filter: City
   */
  whereCity(city) {
    this.filters.push({
      field: 'city',
      operator: SEGMENT_OPERATORS.EQUALS,
      value: city,
      description: `City: ${city}`,
    });
    return this;
  }

  /**
   * Filter: Cities (multiple)
   */
  whereCityIn(cities) {
    this.filters.push({
      field: 'city',
      operator: SEGMENT_OPERATORS.IN,
      value: cities,
      description: `City in: ${cities.join(', ')}`,
    });
    return this;
  }

  /**
   * Filter: Opted in to notification type
   */
  whereOptedIn(notificationType) {
    this.filters.push({
      field: `notificationPreferences.${notificationType}`,
      operator: SEGMENT_OPERATORS.EQUALS,
      value: true,
      description: `Opted in to: ${notificationType}`,
    });
    return this;
  }

  /**
   * Filter: Has pending payment
   */
  whereHasPendingPayment() {
    this.filters.push({
      field: 'hasPendingPayment',
      operator: SEGMENT_OPERATORS.EQUALS,
      value: true,
      description: 'Has pending payment',
    });
    return this;
  }

  /**
   * Filter: Favorite clubs contains
   */
  whereFavoriteClub(clubId) {
    this.filters.push({
      field: 'favoriteClubs',
      operator: SEGMENT_OPERATORS.ARRAY_CONTAINS,
      value: clubId,
      description: `Favorite club: ${clubId}`,
    });
    return this;
  }

  /**
   * Filter: Custom field
   */
  where(field, operator, value) {
    this.filters.push({
      field,
      operator,
      value,
      description: `${field} ${operator} ${value}`,
    });
    return this;
  }

  /**
   * Estimate segment size (senza eseguire query completa)
   */
  async estimateSize() {
    try {
      // Per ora, esegue query completa
      // In produzione, usa count aggregation o statistics pre-calcolate
      const users = await this.execute();
      return users.length;
    } catch (error) {
      console.error('Error estimating segment size:', error);
      return 0;
    }
  }

  /**
   * Execute segment query e ritorna user IDs
   */
  async execute() {
    try {
      const usersRef = collection(db, 'users');

      // NOTA: Firestore limita a 10 where clauses e non supporta OR nativo
      // Per segmenti complessi, usa composite indexes o post-filtering

      if (this.logic === 'AND') {
        // Esegui query con tutti i filtri (AND logic)
        let q = query(usersRef);

        // Applica max 10 filtri (Firestore limit)
        const applicableFilters = this.filters.slice(0, 10);

        applicableFilters.forEach((filter) => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });

        const snapshot = await getDocs(q);

        let users = snapshot.docs.map((doc) => ({
          userId: doc.id,
          ...doc.data(),
        }));

        // Post-filter per filtri > 10
        if (this.filters.length > 10) {
          const additionalFilters = this.filters.slice(10);
          users = users.filter((user) => {
            return additionalFilters.every((filter) => {
              const userValue = this._getNestedValue(user, filter.field);
              return this._compareValues(userValue, filter.operator, filter.value);
            });
          });
        }

        return users;
      } else {
        // OR logic - esegui query separate e merge results
        const userSets = await Promise.all(
          this.filters.map(async (filter) => {
            const q = query(usersRef, where(filter.field, filter.operator, filter.value));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
              userId: doc.id,
              ...doc.data(),
            }));
          })
        );

        // Merge e deduplica
        const userMap = new Map();
        userSets.forEach((users) => {
          users.forEach((user) => {
            userMap.set(user.userId, user);
          });
        });

        return Array.from(userMap.values());
      }
    } catch (error) {
      console.error('Error executing segment query:', error);
      throw error;
    }
  }

  /**
   * Save segment to Firestore
   */
  async save(segmentId) {
    try {
      const segmentRef = doc(db, 'segments', segmentId);

      const segmentData = {
        segmentId,
        name: this.segmentName,
        description: this.segmentDescription,
        filters: this.filters,
        logic: this.logic,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        estimatedSize: await this.estimateSize(),
      };

      await setDoc(segmentRef, segmentData);

      console.log(`✅ Segment saved: ${segmentId}`);
      return segmentData;
    } catch (error) {
      console.error('Error saving segment:', error);
      throw error;
    }
  }

  /**
   * Load segment from Firestore
   */
  static async load(segmentId) {
    try {
      const segmentRef = doc(db, 'segments', segmentId);
      const segmentDoc = await getDoc(segmentRef);

      if (!segmentDoc.exists()) {
        throw new Error(`Segment not found: ${segmentId}`);
      }

      const data = segmentDoc.data();

      const builder = new SegmentBuilder();
      builder.segmentName = data.name;
      builder.segmentDescription = data.description;
      builder.filters = data.filters;
      builder.logic = data.logic;

      return builder;
    } catch (error) {
      console.error('Error loading segment:', error);
      throw error;
    }
  }

  /**
   * Get nested object value by dot notation
   * @private
   */
  _getNestedValue(obj, path) {
    return path.split('.').reduce((value, key) => value?.[key], obj);
  }

  /**
   * Compare values based on operator
   * @private
   */
  _compareValues(userValue, operator, filterValue) {
    switch (operator) {
      case SEGMENT_OPERATORS.EQUALS:
        return userValue === filterValue;
      case SEGMENT_OPERATORS.NOT_EQUALS:
        return userValue !== filterValue;
      case SEGMENT_OPERATORS.GREATER_THAN:
        return userValue > filterValue;
      case SEGMENT_OPERATORS.GREATER_THAN_OR_EQUAL:
        return userValue >= filterValue;
      case SEGMENT_OPERATORS.LESS_THAN:
        return userValue < filterValue;
      case SEGMENT_OPERATORS.LESS_THAN_OR_EQUAL:
        return userValue <= filterValue;
      case SEGMENT_OPERATORS.IN:
        return Array.isArray(filterValue) && filterValue.includes(userValue);
      case SEGMENT_OPERATORS.NOT_IN:
        return Array.isArray(filterValue) && !filterValue.includes(userValue);
      case SEGMENT_OPERATORS.ARRAY_CONTAINS:
        return Array.isArray(userValue) && userValue.includes(filterValue);
      case SEGMENT_OPERATORS.ARRAY_CONTAINS_ANY:
        return (
          Array.isArray(userValue) &&
          Array.isArray(filterValue) &&
          filterValue.some((v) => userValue.includes(v))
        );
      default:
        return false;
    }
  }

  /**
   * Get segment summary
   */
  getSummary() {
    return {
      name: this.segmentName,
      description: this.segmentDescription,
      logic: this.logic,
      filterCount: this.filters.length,
      filters: this.filters.map((f) => f.description),
    };
  }
}

export default SegmentBuilder;
