/**
 * @fileoverview Firestore Indexes Configuration per performance ottimale
 * 
 * Questo file definisce gli indici Firestore necessari per le query complesse
 * del sistema push notifications.
 * 
 * Deploy con:
 * firebase deploy --only firestore:indexes
 * 
 * @author Play Sport Pro Team
 * @version 2.0.0
 */

module.exports = {
  indexes: [
    // Indice per query eventi analytics per userId + timestamp
    {
      collectionGroup: 'notificationEvents',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'timestamp', order: 'DESCENDING' }
      ]
    },

    // Indice per query eventi per tipo + timestamp
    {
      collectionGroup: 'notificationEvents',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'event', order: 'ASCENDING' },
        { fieldPath: 'timestamp', order: 'DESCENDING' }
      ]
    },

    // Indice per query eventi per channel + status
    {
      collectionGroup: 'notificationEvents',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'channel', order: 'ASCENDING' },
        { fieldPath: 'event', order: 'ASCENDING' },
        { fieldPath: 'timestamp', order: 'DESCENDING' }
      ]
    },

    // Indice per A/B test results
    {
      collectionGroup: 'notificationEvents',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'abTestId', order: 'ASCENDING' },
        { fieldPath: 'abVariant', order: 'ASCENDING' },
        { fieldPath: 'event', order: 'ASCENDING' }
      ]
    },

    // Indice per scheduled notifications per status + sendAt
    {
      collectionGroup: 'scheduledNotifications',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'sendAt', order: 'ASCENDING' }
      ]
    },

    // Indice per scheduled notifications per userId
    {
      collectionGroup: 'scheduledNotifications',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'sendAt', order: 'DESCENDING' }
      ]
    },

    // Indice per delivery logs cleanup
    {
      collectionGroup: 'notificationDeliveries',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'timestamp', order: 'ASCENDING' }
      ]
    },

    // Indice per delivery logs per userId
    {
      collectionGroup: 'notificationDeliveries',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'timestamp', order: 'DESCENDING' }
      ]
    },

    // Indice per push subscriptions per status
    {
      collectionGroup: 'pushSubscriptions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'updatedAt', order: 'DESCENDING' }
      ]
    },

    // Indice per segments per userId (user segmentation)
    {
      collectionGroup: 'users',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'lastActivityDays', order: 'ASCENDING' },
        { fieldPath: 'bookingCount', order: 'DESCENDING' }
      ]
    },

    // Indice per certificate expiry queries
    {
      collectionGroup: 'users',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'certificateExpiryDays', order: 'ASCENDING' },
        { fieldPath: 'certificateStatus', order: 'ASCENDING' }
      ]
    }
  ],

  fieldOverrides: [
    // Enable single-field index per timestamp (usato in molte query)
    {
      collectionGroup: 'notificationEvents',
      fieldPath: 'timestamp',
      indexes: [
        { order: 'ASCENDING', queryScope: 'COLLECTION' },
        { order: 'DESCENDING', queryScope: 'COLLECTION' }
      ]
    },

    // Enable array-contains per notificationPreferences
    {
      collectionGroup: 'users',
      fieldPath: 'favoriteClubs',
      indexes: [
        { arrayConfig: 'CONTAINS', queryScope: 'COLLECTION' }
      ]
    }
  ]
};
