// FILE: src/pages/LoginPage.jsx
// =============================================
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { themeTokens, LOGO_URL } from '@lib/theme.js';
import AuthPanel from '@features/auth/AuthPanel.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';

export default function LoginPage() {
  const { user, userProfile, setUserProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const T = React.useMemo(() => themeTokens(), []);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 [LoginPage] User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className={`min-h-screen ${T.pageBg} ${T.text}`}>
      <header className={`sticky top-0 z-20 ${T.headerBg}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-10 w-auto rounded-md shadow shrink-0 flex items-center">
              <img
                src={LOGO_URL}
                alt="Play-Sport.pro"
                className="h-10 w-auto select-none"
                draggable={false}
              />
            </div>
            <div className="text-lg sm:text-2xl font-bold tracking-wide truncate text-white">
              Play-Sport.pro
            </div>
          </div>
          <div />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-5 sm:py-6">
        <AuthPanel T={T} user={user} userProfile={userProfile} setUserProfile={setUserProfile} />
      </main>
    </div>
  );
}
