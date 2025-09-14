// FILE: src/pages/LoginPage.jsx
// =============================================
import React from "react";
import { themeTokens, LOGO_URL } from "@lib/theme.js";
import AuthPanel from "@features/auth/AuthPanel.jsx";
import { useAuth } from "@contexts/AuthContext.jsx";

export default function LoginPage() {
  const { user, userProfile, setUserProfile } = useAuth();
  const T = React.useMemo(() => themeTokens(), []);

  return (
    <div className={`min-h-screen ${T.pageBg} ${T.text}`}>
      <header className={`sticky top-0 z-20 ${T.headerBg}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-10 w-auto rounded-md shadow shrink-0 flex items-center">
              <img
                src={LOGO_URL}
                alt="Play-Sport.pro"
                className="h-10 w-auto select-none dark:bg-white dark:rounded-md dark:p-1"
                draggable={false}
              />
            </div>
            <div className="text-lg sm:text-2xl font-bold tracking-wide truncate text-neutral-900 dark:text-white">
              Play-Sport.pro
            </div>
          </div>
          <div />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-5 sm:py-6">
        <AuthPanel
          T={T}
          user={user}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
        />
      </main>
    </div>
  );
}
