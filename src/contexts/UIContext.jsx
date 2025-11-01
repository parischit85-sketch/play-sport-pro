// =============================================
// FILE: src/contexts/UIContext.jsx
// =============================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { themeTokens } from '@lib/theme.js';
import PerformanceDashboard from '../components/debug/PerformanceDashboard.jsx';
import DatabaseDashboard from '../components/debug/DatabaseDashboard.jsx';

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

  // Tema scuro forzato - nessun supporto per tema chiaro
  const [darkMode] = useState(true);

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

  // Apply theme to document - SEMPRE SCURO
  useEffect(() => {
    // Forza sempre il tema scuro
    document.documentElement.classList.add('dark');
  }, []);

  // Club mode persistence
  React.useEffect(() => {
    try {
      if (clubMode) sessionStorage.setItem('ml-club-mode', '1');
      else sessionStorage.removeItem('ml-club-mode');
    } catch {
      void 0;
    }
  }, [clubMode]);

  // Nessun toggle del tema - sempre scuro
  // const toggleTheme = () => {
  //   setDarkMode((prev) => !prev);
  // };

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
    // setDarkMode e toggleTheme rimossi - tema scuro forzato
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

  const T = React.useMemo(() => themeTokens(), []);

  return (
    <UIContext.Provider value={value}>
      {children}
      {/* Performance Dashboard for development and debugging */}
      {(import.meta.env.DEV || auth?.userRole === 'super_admin') && (
        <>
          <PerformanceDashboard T={T} />
          <div className="mt-4">
            <DatabaseDashboard />
          </div>
        </>
      )}
    </UIContext.Provider>
  );
}
