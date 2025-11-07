/**
 * Analytics utilities for tracking notification events
 */

// Cache per evitare chiamate duplicate
let analyticsCache = new Map();

export async function trackNotificationEvent(eventData) {
  try {
    // Crea una chiave unica per evitare duplicati ravvicinati
    const cacheKey = `${eventData.type}-${eventData.userId}-${eventData.clubId}-${Math.floor(Date.now() / 10000)}`; // Cache per 10 secondi

    if (analyticsCache.has(cacheKey)) {
      console.log('[Analytics] Event already tracked recently, skipping:', eventData.type);
      return;
    }

    analyticsCache.set(cacheKey, true);

    // Cleanup cache ogni minuto
    if (analyticsCache.size > 100) {
      const cutoff = Date.now() - 60000;
      for (const [key, timestamp] of analyticsCache) {
        if (timestamp < cutoff) {
          analyticsCache.delete(key);
        }
      }
    }

    const event = {
      id: `frontend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...eventData,
      platform: eventData.platform || 'web',
      userAgent: navigator.userAgent,
      source: 'frontend',
    };

    // Invia analytics al backend
    const response = await fetch('/.netlify/functions/notification-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (response.ok) {
      console.log('[Analytics] Event tracked:', event.type, 'for user:', event.userId);
    } else {
      console.warn('[Analytics] Failed to track event:', event.type, response.status);
    }
  } catch (error) {
    console.warn('[Analytics] Tracking error (non-blocking):', error);
    // Non lanciare errori per non interrompere il flusso dell'app
  }
}

/**
 * Utility per tracciare eventi di engagement dell'utente
 */
export function trackUserEngagement(eventType, metadata = {}) {
  // Ottieni userId dal localStorage o da altre fonti
  const userId = localStorage.getItem('userId') || 'anonymous';

  trackNotificationEvent({
    type: eventType,
    userId,
    channel: 'engagement',
    notificationType: 'user-interaction',
    platform: 'web',
    success: true,
    metadata: {
      url: window.location.href,
      timestamp: Date.now(),
      ...metadata,
    },
  });
}