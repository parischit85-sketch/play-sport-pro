/**
 * NotificationBadge Component
 * Displays notification count badge with real-time updates
 * 
 * Features:
 * - Real-time unread count via Firebase listener
 * - Animated badge appearance
 * - Customizable size and position
 * - Click handler for opening notification center
 */

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import notificationService from '@services/notificationService';
import { useAuth } from '@context/AuthContext';

const NotificationBadge = ({ 
  size = 'md',
  onClick,
  showCount = true,
  className = '',
}) => {
  const { currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) {
      setUnreadCount(0);
      return;
    }

    // Subscribe to unread count updates
    const unsubscribe = notificationService.subscribeToUnreadCount(
      currentUser.uid,
      (count) => {
        // Trigger animation on new notification
        if (count > unreadCount) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 500);
        }
        setUnreadCount(count);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 16,
      badge: 'w-3.5 h-3.5 text-[10px]',
    },
    md: {
      icon: 20,
      badge: 'w-4 h-4 text-xs',
    },
    lg: {
      icon: 24,
      badge: 'w-5 h-5 text-sm',
    },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center justify-center transition-all ${className}`}
      aria-label={`Notifiche (${unreadCount} non lette)`}
    >
      <Bell 
        size={config.icon}
        className={`
          text-gray-600 dark:text-gray-300
          transition-all duration-300
          ${isAnimating ? 'scale-110 text-blue-600' : ''}
          ${unreadCount > 0 ? 'text-blue-600 dark:text-blue-400' : ''}
        `}
      />
      
      {unreadCount > 0 && showCount && (
        <span 
          className={`
            absolute -top-1 -right-1
            ${config.badge}
            bg-red-500 text-white
            rounded-full
            flex items-center justify-center
            font-bold
            animate-pulse
            ${isAnimating ? 'scale-125' : 'scale-100'}
            transition-transform duration-300
          `}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      
      {unreadCount > 0 && !showCount && (
        <span 
          className="
            absolute -top-0.5 -right-0.5
            w-2 h-2
            bg-red-500
            rounded-full
            animate-pulse
          "
        />
      )}
    </button>
  );
};

export default NotificationBadge;
