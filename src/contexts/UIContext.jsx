// =============================================
// FILE: src/contexts/UIContext.jsx
// =============================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import PerformanceDashboard from '../components/debug/PerformanceDashboard.jsx';
import DatabaseDashboard from '../components/debug/DatabaseDashboard.jsx';
import NotificationTestPanel from '../components/debug/NotificationTestPanel.jsx';

const UIContext = createContext(null);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export function UIProvider({ children }) {
  const auth = useAuth();

  // Theme management
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('play-sport-pro-theme');
      if (saved) {
        return saved === 'dark';
      }
      // Default to system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [clubMode, setClubMode] = useState(() => {
    try {
      const unlocked = sessionStorage.getItem('ml-extra-unlocked') === '1';
      const saved = sessionStorage.getItem('ml-club-mode') === '1';
      return unlocked && saved;
    } catch {
      return false;
    }
  });

  // Auto-attiva clubMode per admin di club e super admin
  useEffect(() => {
    if (!auth || !auth.user) return;

    const isAdmin = auth.userRole === 'super_admin' || auth.isClubAdmin();

    // console.log("🔍 UIContext clubMode auto-activation check:", {
    //   userRole: auth.userRole,
    //   isClubAdmin: auth.isClubAdmin(),
    //   isAdmin,
    //   currentClubMode: clubMode
    // });

    // SICUREZZA: Solo amministratori reali possono attivare la modalità club
    if (isAdmin && !clubMode) {
      console.log('✅ Auto-activating club mode for admin user');
      sessionStorage.setItem('ml-extra-unlocked', '1');
      sessionStorage.setItem('ml-club-mode', '1');
      setClubMode(true);
    } else if (!isAdmin && clubMode) {
      // Se un utente non admin ha la modalità club attiva, disattivarla
      console.log('🔒 Disabling club mode for non-admin user');
      sessionStorage.removeItem('ml-club-mode');
      sessionStorage.removeItem('ml-extra-unlocked');
      setClubMode(false);
    }
  }, [auth?.user, auth?.userRole, auth?.userAffiliations, clubMode]);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  // Apply theme to document
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('play-sport-pro-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('play-sport-pro-theme', 'light');
      }
    } catch {
      void 0;
    }
  }, [darkMode]);

  // Club mode persistence
  React.useEffect(() => {
    try {
      if (clubMode) sessionStorage.setItem('ml-club-mode', '1');
      else sessionStorage.removeItem('ml-club-mode');
    } catch {
      void 0;
    }
  }, [clubMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const addNotification = (notification) => {
    const id = Math.random().toString(36).slice(2);
    const newNotification = { id, ...notification };
    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);

    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const showModal = (modalConfig) => {
    setModal(modalConfig);
  };

  const hideModal = () => {
    setModal(null);
  };

  const value = {
    darkMode,
    setDarkMode,
    toggleTheme,
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

  // Bridge: allow triggering notifications via window.dispatchEvent(new CustomEvent('notify', {detail:{...}}))
  React.useEffect(() => {
    function handleNotify(e) {
      if (!e || !e.detail) return;
      const { type = 'info', title, message, autoClose = true } = e.detail;
      addNotification({ type, title, message, autoClose });
    }
    window.addEventListener('notify', handleNotify);
    return () => window.removeEventListener('notify', handleNotify);
  }, []);

  return (
    <UIContext.Provider value={value}>
      {children}
      {/* Performance Dashboard for development and debugging */}
      {(import.meta.env.DEV || auth?.userRole === 'super_admin') && (
        <>
          <PerformanceDashboard T={getTheme(darkMode)} />
          <div className="mt-4">
            <DatabaseDashboard />
          </div>
          <NotificationTestPanel />
        </>
      )}
    </UIContext.Provider>
  );
}

// Helper function to get theme classes (simplified)
const getTheme = (isDark) => ({
  cardBg: isDark ? 'bg-gray-800' : 'bg-white',
  border: isDark ? 'border-gray-700' : 'border-gray-200',
  btnSecondary: isDark
    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300',
  btnGhost: isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600',
});
