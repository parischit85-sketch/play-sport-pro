// =============================================
// FILE: src/pages/InstructorDashboardPage.jsx
// Pagina dedicata per la dashboard istruttore
// =============================================
import React from 'react';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { useNavigate } from 'react-router-dom';
import PWABanner from '../components/ui/PWABanner.jsx';

const InstructorDashboard = React.lazy(
  () => import('@features/instructor/InstructorDashboard.jsx')
);

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const { clubId, playersLoaded, isUserInstructor } = useClub();
  const navigate = useNavigate();

  // Check if user is instructor in current club
  // IMPORTANTE: usa isUserInstructor da ClubContext che controlla i players del circolo corrente
  const isInstructor = playersLoaded && isUserInstructor(user?.uid);

  console.log('👨‍🏫 [InstructorDashboardPage] Instructor check:', {
    clubId,
    userId: user?.uid,
    playersLoaded,
    isInstructor,
  });

  // Redirect if not instructor
  React.useEffect(() => {
    if (user && clubId && playersLoaded && !isInstructor) {
      console.log('⚠️ User is not an instructor, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, clubId, playersLoaded, isInstructor, navigate]);

  if (!playersLoaded || !isInstructor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 from-gray-900 via-slate-900 to-gray-800 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 text-white mb-4">Accesso Riservato</h2>
          <p className="text-gray-600 text-gray-400 mb-6">
            Questa pagina è riservata agli istruttori
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 from-gray-900 via-slate-900 to-gray-800">
      <PWABanner />
      <React.Suspense
        fallback={
          <div className="p-4">
            <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
              <div className="h-12 bg-white/60 bg-gray-800/60 rounded-2xl"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-white/60 bg-gray-800/60 rounded-2xl"></div>
                ))}
              </div>
              <div className="h-96 bg-white/60 bg-gray-800/60 rounded-2xl"></div>
            </div>
          </div>
        }
      >
        <InstructorDashboard />
      </React.Suspense>
    </div>
  );
}
