// =============================================
// FILE: src/hooks/useUnreadNotifications.js
// Hook per monitorare notifiche non lette in real-time
// =============================================
import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '@contexts/AuthContext';

export function useUnreadNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const functions = getFunctions();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchUnreadCount = async () => {
      try {
        const getNotifications = httpsCallable(functions, 'getUserNotifications');
        const result = await getNotifications({ limit: 1, unreadOnly: true });
        
        if (mounted) {
          setUnreadCount(result.data.unreadCount || 0);
          setLoading(false);
        }
      } catch (error) {
        console.error('[useUnreadNotifications] Error:', error);
        if (mounted) {
          setUnreadCount(0);
          setLoading(false);
        }
      }
    };

    // Fetch iniziale
    fetchUnreadCount();

    // Refresh ogni 2 minuti
    const interval = setInterval(fetchUnreadCount, 120000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user, functions]);

  return { unreadCount, loading };
}
