// =============================================
// FILE: src/ui/Toast.jsx
// Sistema di notifiche toast
// =============================================

import React, { useState, useEffect } from 'react';

let toastId = 0;
const toasts = [];
const listeners = [];

const addToast = (message, type = 'info', duration = 4000) => {
  const id = ++toastId;
  const toast = { id, message, type, duration };
  toasts.push(toast);
  listeners.forEach(listener => listener([...toasts]));
  return id;
};

const removeToast = (id) => {
  const index = toasts.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
    listeners.forEach(listener => listener([...toasts]));
  }
};

export const toast = {
  success: (message, duration) => addToast(message, 'success', duration),
  error: (message, duration) => addToast(message, 'error', duration),
  warning: (message, duration) => addToast(message, 'warning', duration),
  info: (message, duration) => addToast(message, 'info', duration),
};

export default function ToastContainer({ T }) {
  const [currentToasts, setCurrentToasts] = useState([]);

  useEffect(() => {
    const listener = (newToasts) => {
      setCurrentToasts(newToasts);
    };

    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const getToastStyles = (type) => {
    const base = `${T.cardBg} ${T.border} rounded-lg p-4 shadow-lg border-l-4 flex items-center gap-3 min-w-[300px] max-w-[500px]`;
    switch (type) {
      case 'success':
        return `${base} border-l-green-500 bg-green-50 dark:bg-green-900/20`;
      case 'error':
        return `${base} border-l-red-500 bg-red-50 dark:bg-red-900/20`;
      case 'warning':
        return `${base} border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20`;
      default:
        return `${base} border-l-blue-500 bg-blue-50 dark:bg-blue-900/20`;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastStyles(toast.type)} animate-in slide-in-from-right`}
        >
          <span className="text-xl">{getIcon(toast.type)}</span>
          <div className="flex-1">
            <p className={`${T.text} text-sm`}>{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className={`${T.text} hover:opacity-70 text-lg`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}