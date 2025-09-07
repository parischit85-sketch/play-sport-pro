// =============================================
// FILE: src/utils/notifications.js
// =============================================

/**
 * Utilities per gestire le notifiche push in Paris League
 */

// ============================================
// NOTIFICATION HELPERS
// ============================================

/**
 * Invia notifica di conferma prenotazione
 */
export async function notifyBookingConfirmed(bookingDetails) {
  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const { court, date, time, price, userName } = bookingDetails;
    
    new Notification('🎾 Prenotazione Confermata!', {
      body: `Campo ${court} prenotato per ${date} alle ${time} - €${price}`,
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      tag: `booking-${Date.now()}`,
      data: { 
        url: '/profile?tab=bookings',
        type: 'booking_confirmed',
        bookingId: bookingDetails.id
      },
      actions: [
        {
          action: 'view',
          title: 'Visualizza',
          icon: '/icons/icon.svg'
        },
        {
          action: 'dismiss',
          title: 'OK',
          icon: '/icons/icon.svg'
        }
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200]
    });

    console.log('✅ Booking notification sent');
    return true;
  } catch (error) {
    console.error('❌ Booking notification failed:', error);
    return false;
  }
}

/**
 * Invia promemoria partita
 */
export async function notifyMatchReminder(matchDetails) {
  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const { court, time, players, minutesLeft = 30 } = matchDetails;
    
    new Notification('⏰ Partita in arrivo!', {
      body: `La tua partita al Campo ${court} inizia tra ${minutesLeft} minuti`,
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      tag: `reminder-${matchDetails.id}`,
      data: { 
        url: '/booking',
        type: 'match_reminder',
        matchId: matchDetails.id
      },
      actions: [
        {
          action: 'navigate',
          title: 'Vedi Campo',
          icon: '/icons/icon.svg'
        }
      ],
      requireInteraction: true,
      vibrate: [300, 200, 300, 200, 300],
      timestamp: Date.now()
    });

    console.log('✅ Match reminder sent');
    return true;
  } catch (error) {
    console.error('❌ Match reminder failed:', error);
    return false;
  }
}

/**
 * Invia notifica aggiornamento classifica
 */
export async function notifyRankingUpdate(rankingData) {
  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const { playerName, newPosition, change } = rankingData;
    
    let body = `Sei ora ${newPosition}° in classifica`;
    if (change > 0) {
      body += ` (+${change} posizioni!)`;
    } else if (change < 0) {
      body += ` (${change} posizioni)`;
    }

    new Notification('📈 Classifica Aggiornata!', {
      body,
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      tag: 'ranking-update',
      data: { 
        url: '/classifica',
        type: 'ranking_update'
      },
      actions: [
        {
          action: 'view_ranking',
          title: 'Vedi Classifica',
          icon: '/icons/icon.svg'
        }
      ],
      vibrate: [100, 50, 100]
    });

    console.log('✅ Ranking notification sent');
    return true;
  } catch (error) {
    console.error('❌ Ranking notification failed:', error);
    return false;
  }
}

/**
 * Invia notifica torneo
 */
export async function notifyTournamentUpdate(tournamentData) {
  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const { title, message, tournamentId, actionText = 'Vedi Torneo' } = tournamentData;
    
    new Notification(`🏆 ${title}`, {
      body: message,
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      tag: `tournament-${tournamentId}`,
      data: { 
        url: '/tournaments',
        type: 'tournament_update',
        tournamentId
      },
      actions: [
        {
          action: 'view_tournament',
          title: actionText,
          icon: '/icons/icon.svg'
        }
      ],
      vibrate: [150, 100, 150]
    });

    console.log('✅ Tournament notification sent');
    return true;
  } catch (error) {
    console.error('❌ Tournament notification failed:', error);
    return false;
  }
}

// ============================================
// NOTIFICATION SCHEDULING
// ============================================

/**
 * Schedula notifica promemoria
 */
export function scheduleMatchReminder(matchDetails, minutesBefore = 30) {
  const { startTime } = matchDetails;
  const reminderTime = new Date(startTime).getTime() - (minutesBefore * 60 * 1000);
  const now = Date.now();
  
  if (reminderTime <= now) {
    console.warn('Match reminder time is in the past');
    return null;
  }
  
  const timeoutId = setTimeout(() => {
    notifyMatchReminder({
      ...matchDetails,
      minutesLeft: minutesBefore
    });
  }, reminderTime - now);
  
  console.log(`✅ Match reminder scheduled for ${new Date(reminderTime).toLocaleString()}`);
  return timeoutId;
}

/**
 * Cancella promemoria schedulato
 */
export function cancelScheduledReminder(timeoutId) {
  if (timeoutId) {
    clearTimeout(timeoutId);
    console.log('✅ Scheduled reminder cancelled');
  }
}

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

const NOTIFICATION_PREFERENCES_KEY = 'paris_league_notification_prefs';

export const NotificationTypes = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  MATCH_REMINDER: 'match_reminder', 
  RANKING_UPDATE: 'ranking_update',
  TOURNAMENT_UPDATE: 'tournament_update'
};

/**
 * Carica preferenze notifiche dal localStorage
 */
export function loadNotificationPreferences() {
  try {
    const saved = localStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
    if (saved) {
      return { 
        ...getDefaultPreferences(),
        ...JSON.parse(saved) 
      };
    }
  } catch (error) {
    console.error('Error loading notification preferences:', error);
  }
  
  return getDefaultPreferences();
}

/**
 * Salva preferenze notifiche nel localStorage
 */
export function saveNotificationPreferences(preferences) {
  try {
    localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
    console.log('✅ Notification preferences saved');
    return true;
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    return false;
  }
}

/**
 * Preferenze default
 */
function getDefaultPreferences() {
  return {
    [NotificationTypes.BOOKING_CONFIRMED]: true,
    [NotificationTypes.MATCH_REMINDER]: true,
    [NotificationTypes.RANKING_UPDATE]: true,
    [NotificationTypes.TOURNAMENT_UPDATE]: true,
    reminderMinutes: 30,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    enableVibration: true,
    enableSound: true
  };
}

/**
 * Controlla se le notifiche sono abilitate per un tipo
 */
export function isNotificationEnabled(type) {
  const prefs = loadNotificationPreferences();
  return prefs[type] === true;
}

/**
 * Controlla se siamo in ore di silenzio
 */
export function isQuietTime() {
  const prefs = loadNotificationPreferences();
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMin] = prefs.quietHoursStart.split(':').map(Number);
  const [endHour, endMin] = prefs.quietHoursEnd.split(':').map(Number);
  
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  if (startTime < endTime) {
    // Stesso giorno (es. 22:00 - 08:00 del giorno dopo)
    return currentTime >= startTime || currentTime <= endTime;
  } else {
    // Attraversa mezzanotte (es. 08:00 - 22:00)
    return currentTime >= startTime && currentTime <= endTime;
  }
}

// ============================================
// NOTIFICATION TESTING
// ============================================

/**
 * Invia notifica di test per ogni tipo
 */
export async function sendAllTestNotifications() {
  const tests = [
    () => notifyBookingConfirmed({
      court: '1',
      date: 'oggi',
      time: '15:30',
      price: '25',
      userName: 'Test User',
      id: 'test-booking'
    }),
    
    () => notifyMatchReminder({
      court: '2', 
      time: '16:00',
      players: ['Test User'],
      id: 'test-match',
      minutesLeft: 30
    }),
    
    () => notifyRankingUpdate({
      playerName: 'Test User',
      newPosition: 5,
      change: 2
    }),
    
    () => notifyTournamentUpdate({
      title: 'Torneo Test',
      message: 'Nuovi risultati disponibili!',
      tournamentId: 'test-tournament'
    })
  ];
  
  const results = await Promise.all(tests.map(test => test()));
  const successful = results.filter(Boolean).length;
  
  console.log(`✅ Sent ${successful}/${tests.length} test notifications`);
  return successful;
}
