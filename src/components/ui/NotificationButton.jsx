// =============================================
// FILE: src/components/ui/NotificationButton.jsx
// Notification center button with unread count badge
// =============================================
import React, { useState } from 'react';
import { useAuth } from '@contexts/AuthContext.jsx';
import { Bell } from 'lucide-react';
import { useUnreadNotifications } from '@hooks/useUnreadNotifications';
import NotificationCenter from '@features/notifications/NotificationCenter';

export default function NotificationButton() {
  const { user } = useAuth();
  const [showPanel, setShowPanel] = useState(false);
  const { unreadCount } = useUnreadNotifications();

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`
          relative flex items-center justify-center
          h-10 w-10 rounded-full
          transition-all duration-200
          ${
            showPanel
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }
          active:scale-95
        `}
        aria-label="Notifiche"
        title={`Notifiche${unreadCount > 0 ? ` (${unreadCount} non lette)` : ''}`}
      >
        <Bell className="h-5 w-5" strokeWidth={2} />

        {/* Badge notifiche non lette */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-gray-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop opaco */}
      {showPanel && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setShowPanel(false)}
          aria-label="Chiudi pannello notifiche"
        />
      )}

      {/* Pannello notifiche */}
      {showPanel && (
        <div className="absolute top-14 right-4 z-50 w-[90vw] max-w-md animate-scale-in">
          <NotificationCenter onClose={() => setShowPanel(false)} />
        </div>
      )}
    </>
  );
}
