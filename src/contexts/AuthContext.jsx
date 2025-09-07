// =============================================
// FILE: src/contexts/AuthContext.jsx
// =============================================
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuth, getUserProfile } from '@services/auth.jsx';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuth(async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
        setError(null);
      } catch (err) {
        console.error('Auth error:', err);
        setError(err);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const isAuthenticated = !!user;
  const isProfileComplete = userProfile?.firstName && userProfile?.phone;

  const value = {
    user,
    userProfile,
    setUserProfile,
    loading,
    error,
    isAuthenticated,
    isProfileComplete,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
