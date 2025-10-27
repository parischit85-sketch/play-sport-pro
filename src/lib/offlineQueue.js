// =============================================
// FILE: src/lib/offlineQueue.js
// Offline queue con background sync per bookings
// =============================================

import { openDB } from 'idb';

const DB_NAME = 'playsport-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-actions';

/**
 * Offline Queue Service
 * 
 * Gestisce azioni offline con background sync:
 * - Salva bookings quando offline
 * - Sincronizza automaticamente quando online
 * - Retry failed operations
 */
class OfflineQueue {
  constructor() {
    this.db = null;
    this.syncInProgress = false;
  }

  async init() {
    if (this.db) return this.db;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('type', 'type');
          store.createIndex('status', 'status');
          store.createIndex('createdAt', 'createdAt');
        }
      },
    });

    // Listener online/offline
    window.addEventListener('online', () => this.syncPendingActions());
    
    return this.db;
  }

  /**
   * Aggiungi azione alla queue
   */
  async addAction(type, data) {
    await this.init();

    const action = {
      type, // 'booking', 'match', 'player-update', etc.
      data,
      status: 'pending',
      attempts: 0,
      createdAt: new Date().toISOString(),
      lastAttempt: null,
      error: null,
    };

    const id = await this.db.add(STORE_NAME, action);
    console.log(`✅ [OfflineQueue] Action added: ${type} (ID: ${id})`);

    // Registra background sync se supportato
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-offline-queue');
        console.log('🔄 [OfflineQueue] Background sync registered');
      } catch (error) {
        console.error('❌ [OfflineQueue] Background sync error:', error);
        // Fallback: sync immediato se online
        if (navigator.onLine) {
          this.syncPendingActions();
        }
      }
    } else if (navigator.onLine) {
      // No background sync support, sync now
      this.syncPendingActions();
    }

    return id;
  }

  /**
   * Ottieni azioni pending
   */
  async getPendingActions(type = null) {
    await this.init();

    let actions;
    if (type) {
      actions = await this.db.getAllFromIndex(STORE_NAME, 'type', type);
    } else {
      actions = await this.db.getAll(STORE_NAME);
    }

    return actions.filter(a => a.status === 'pending');
  }

  /**
   * Sincronizza azioni pending
   */
  async syncPendingActions() {
    if (this.syncInProgress) {
      console.log('⏳ [OfflineQueue] Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('📴 [OfflineQueue] Offline, skipping sync');
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 [OfflineQueue] Starting sync...');

    try {
      const actions = await this.getPendingActions();
      console.log(`📋 [OfflineQueue] Found ${actions.length} pending actions`);

      for (const action of actions) {
        try {
          await this.processAction(action);
          
          // Marca come completata
          await this.db.put(STORE_NAME, {
            ...action,
            status: 'completed',
            completedAt: new Date().toISOString(),
          });

          console.log(`✅ [OfflineQueue] Action completed: ${action.type} (ID: ${action.id})`);
        } catch (error) {
          console.error(`❌ [OfflineQueue] Action failed: ${action.type} (ID: ${action.id})`, error);

          // Incrementa tentativi
          const updatedAction = {
            ...action,
            attempts: action.attempts + 1,
            lastAttempt: new Date().toISOString(),
            error: error.message,
          };

          // Dopo 3 tentativi, marca come failed
          if (updatedAction.attempts >= 3) {
            updatedAction.status = 'failed';
          }

          await this.db.put(STORE_NAME, updatedAction);
        }
      }

      console.log('✅ [OfflineQueue] Sync completed');
    } catch (error) {
      console.error('❌ [OfflineQueue] Sync error:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Processa singola azione
   */
  async processAction(action) {
    console.log(`🔄 [OfflineQueue] Processing action: ${action.type}`);

    switch (action.type) {
      case 'booking':
        return await this.createBooking(action.data);
      
      case 'booking-cancel':
        return await this.cancelBooking(action.data);
      
      case 'match':
        return await this.createMatch(action.data);
      
      case 'player-update':
        return await this.updatePlayer(action.data);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Crea booking (chiamata API)
   */
  async createBooking(data) {
    // Importa dinamicamente per evitare circular dependencies
    const { createBooking } = await import('@/services/unifiedBookingService');
    return await createBooking(data);
  }

  /**
   * Cancella booking
   */
  async cancelBooking(data) {
    const { deleteBooking } = await import('@/services/unifiedBookingService');
    return await deleteBooking(data.bookingId);
  }

  /**
   * Crea match
   */
  async createMatch(data) {
    const { createMatch } = await import('@/services/matchService');
    return await createMatch(data);
  }

  /**
   * Aggiorna player
   */
  async updatePlayer(data) {
    const { updatePlayer } = await import('@/services/playerService');
    return await updatePlayer(data.playerId, data.updates);
  }

  /**
   * Ottieni statistiche queue
   */
  async getStats() {
    await this.init();

    const all = await this.db.getAll(STORE_NAME);
    
    return {
      total: all.length,
      pending: all.filter(a => a.status === 'pending').length,
      completed: all.filter(a => a.status === 'completed').length,
      failed: all.filter(a => a.status === 'failed').length,
      byType: all.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  /**
   * Pulisci azioni completate (older than 7 days)
   */
  async cleanup() {
    await this.init();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const all = await this.db.getAll(STORE_NAME);
    
    for (const action of all) {
      if (action.status === 'completed' && new Date(action.completedAt) < sevenDaysAgo) {
        await this.db.delete(STORE_NAME, action.id);
      }
    }

    console.log('🧹 [OfflineQueue] Cleanup completed');
  }

  /**
   * Riprova azione fallita
   */
  async retryAction(actionId) {
    await this.init();

    const action = await this.db.get(STORE_NAME, actionId);
    if (!action) throw new Error('Action not found');

    await this.db.put(STORE_NAME, {
      ...action,
      status: 'pending',
      attempts: 0,
      error: null,
    });

    console.log(`🔄 [OfflineQueue] Action retry queued: ${actionId}`);
    
    if (navigator.onLine) {
      this.syncPendingActions();
    }
  }

  /**
   * Elimina azione
   */
  async deleteAction(actionId) {
    await this.init();
    await this.db.delete(STORE_NAME, actionId);
    console.log(`🗑️ [OfflineQueue] Action deleted: ${actionId}`);
  }

  /**
   * Pulisci tutto
   */
  async clear() {
    await this.init();
    await this.db.clear(STORE_NAME);
    console.log('🧹 [OfflineQueue] All actions cleared');
  }
}

// Singleton
const offlineQueue = new OfflineQueue();
export default offlineQueue;

/**
 * Hook React per offline queue
 */
export function useOfflineQueue() {
  const [stats, setStats] = React.useState(null);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const updateStats = async () => {
      const queueStats = await offlineQueue.getStats();
      setStats(queueStats);
    };

    const handleOnline = () => {
      setIsOnline(true);
      updateStats();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateStats();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5s

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    stats,
    isOnline,
    addAction: offlineQueue.addAction.bind(offlineQueue),
    syncNow: offlineQueue.syncPendingActions.bind(offlineQueue),
    retryAction: offlineQueue.retryAction.bind(offlineQueue),
    deleteAction: offlineQueue.deleteAction.bind(offlineQueue),
  };
}

// React import
import React from 'react';
