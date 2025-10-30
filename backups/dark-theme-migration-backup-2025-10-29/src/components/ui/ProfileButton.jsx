// =============================================
// FILE: src/components/ui/ProfileButton.jsx
// Top-right profile button with notifications badge
// =============================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext.jsx';
import { User, Bell, MessageCircle, LogIn } from 'lucide-react';

export default function ProfileButton() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasNotifications, setHasNotifications] = useState(false);
  const [hasMessages, setHasMessages] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  // TODO: Integra con il sistema di notifiche reale quando sarà implementato
  // Per ora mostriamo badge di esempio
  useEffect(() => {
    if (!user) {
      setHasNotifications(false);
      setHasMessages(false);
      setNotificationCount(0);
      setMessageCount(0);
      return;
    }

    // Placeholder per future integrazioni
    // setNotificationCount(countFromFirestore);
    // setMessageCount(countFromFirestore);
  }, [user]);

  const handleClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login', { state: { from: location } });
    }
  };

  const isActive = location.pathname === '/profile' || location.pathname === '/login';

  return (
    <button
      onClick={handleClick}
      className={`
        relative flex items-center justify-center
        h-10 w-10 rounded-full
        transition-all duration-200
        ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
        }
        active:scale-95
      `}
      aria-label={user ? 'Profilo utente' : 'Accedi'}
      title={user ? 'Profilo utente' : 'Accedi'}
    >
      {/* Icona principale */}
      {user ? (
        <User className="h-5 w-5" strokeWidth={2} />
      ) : (
        <LogIn className="h-5 w-5" strokeWidth={2} />
      )}

      {/* Badge notifiche */}
      {user && notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}

      {/* Indicatore messaggi (dot) */}
      {user && messageCount > 0 && notificationCount === 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-blue-500 rounded-full shadow-lg border-2 border-white dark:border-gray-900" />
      )}

      {/* Badge combinato se entrambi presenti */}
      {user && notificationCount > 0 && messageCount > 0 && (
        <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-900">
          {messageCount > 9 ? '9' : messageCount}
        </span>
      )}
    </button>
  );
}
