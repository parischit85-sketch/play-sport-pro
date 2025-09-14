// =============================================
// FILE: src/contexts/UIContext.jsx
// =============================================
import React, { createContext, useContext, useState, useEffect } from "react";

const UIContext = createContext(null);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};

export function UIProvider({ children }) {
  // Theme management
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("play-sport-pro-theme");
      if (saved) {
        return saved === "dark";
      }
      // Default to system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  const [clubMode, setClubMode] = useState(() => {
    try {
      const unlocked = sessionStorage.getItem("ml-extra-unlocked") === "1";
      const saved = sessionStorage.getItem("ml-club-mode") === "1";
      return unlocked && saved;
    } catch {
      return false;
    }
  });

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  // Apply theme to document
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("play-sport-pro-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("play-sport-pro-theme", "light");
      }
    } catch {
      void 0;
    }
  }, [darkMode]);

  // Club mode persistence
  React.useEffect(() => {
    try {
      if (clubMode) sessionStorage.setItem("ml-club-mode", "1");
      else sessionStorage.removeItem("ml-club-mode");
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

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
