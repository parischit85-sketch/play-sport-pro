// =============================================
// FILE: src/contexts/UIContext.jsx
// =============================================
import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext(null);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export function UIProvider({ children }) {
  const [clubMode, setClubMode] = useState(() => {
    try {
      const unlocked = sessionStorage.getItem('ml-extra-unlocked') === '1';
      const saved = sessionStorage.getItem('ml-club-mode') === '1';
      return unlocked && saved;
    } catch {
      return false;
    }
  });

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  React.useEffect(() => {
    try {
      if (clubMode) sessionStorage.setItem('ml-club-mode', '1');
      else sessionStorage.removeItem('ml-club-mode');
    } catch {
      void 0;
    }
  }, [clubMode]);

  const addNotification = (notification) => {
    const id = Math.random().toString(36).slice(2);
    const newNotification = { id, ...notification };
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showModal = (modalConfig) => {
    setModal(modalConfig);
  };

  const hideModal = () => {
    setModal(null);
  };

  const value = {
    clubMode,
    setClubMode,
    notifications,
    addNotification,
    removeNotification,
    loading,
    setLoading,
    modal,
    showModal,
    hideModal,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}
