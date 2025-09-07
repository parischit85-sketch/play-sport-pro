// =============================================
// FILE: src/components/NotificationSystem.jsx
// =============================================
import React from 'react';
import { useUI } from '@contexts/UIContext.jsx';

export default function NotificationSystem() {
  const { notifications, removeNotification } = useUI();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}

function NotificationItem({ notification, onRemove }) {
  const { id, type = 'info', title, message, autoClose = true } = notification;

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white',
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [id, autoClose, onRemove]);

  return (
    <div
      className={`${typeStyles[type]} px-4 py-3 rounded-lg shadow-lg max-w-sm animate-slide-in-right`}
      role="alert"
    >
      <div className="flex items-start">
        <span className="text-lg mr-2">{icons[type]}</span>
        <div className="flex-1">
          {title && <div className="font-medium">{title}</div>}
          {message && <div className="text-sm opacity-90">{message}</div>}
        </div>
        <button
          onClick={() => onRemove(id)}
          className="ml-2 text-lg leading-none opacity-70 hover:opacity-100"
          aria-label="Chiudi notifica"
        >
          ×
        </button>
      </div>
    </div>
  );
}
