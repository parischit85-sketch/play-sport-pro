import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../../services/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { Shield } from 'lucide-react';

const AdminProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Lista degli admin autorizzati - sincronizzata con AdminLogin
  const AUTHORIZED_ADMINS = [
    'paris.andrea@live.it',
    'admin@playsport.it',
    // Aggiungi qui altri email admin
  ];

  useEffect(() => {
    // Use Firebase auth
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Shield className="w-5 h-5" />
            <span>Verifica autorizzazioni admin...</span>
          </div>
        </div>
      </div>
    );
  }

  // Se l'utente non è loggato, reindirizza al login admin
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Se l'utente non è autorizzato come admin, reindirizza al login admin
  if (!AUTHORIZED_ADMINS.includes(user.email)) {
    // Logout dell'utente non autorizzato
    auth.signOut();
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // L'utente è autenticato e autorizzato come admin
  return children;
};

export default AdminProtectedRoute;
