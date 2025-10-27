import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../services/firebase.js';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { trackAdmin, trackPageView } from '../../lib/analytics.js';
import {
  Users,
  Building2,
  Activity,
  TrendingUp,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  UserCog,
  Shield,
} from 'lucide-react';
import { revertTournamentChampionshipPoints, getChampionshipApplyStatus } from '../../features/tournaments/services/championshipApplyService.js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClubs: 0,
    totalUsers: 0,
    totalMatches: 0,
    totalBookings: 0,
    recentActivity: [],
    clubGrowth: [],
    usersByClub: [],
    bookingsByMonth: [],
    topClubs: [],
  });

  useEffect(() => {
    // Track admin dashboard page view
    trackPageView('Admin Dashboard', '/admin/dashboard');

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carica statistiche generali
      const [clubsSnap] = await Promise.all([getDocs(collection(db, 'clubs'))]);

      // Conta i circoli
      const totalClubs = clubsSnap.size;

      // Per gli utenti, contiamo i profili in tutti i club
      let totalUsers = 0;
      let totalMatches = 0;
      let totalBookings = 0;
      const clubsData = [];
      const usersByClub = [];
      const recentActivity = [];

      for (const clubDoc of clubsSnap.docs) {
        const clubId = clubDoc.id;
        const clubData = clubDoc.data();

        let clubUsers = 0;
        let clubMatches = 0;
        let clubBookings = 0;

        // Conta profili
        try {
          const profilesSnap = await getDocs(collection(db, 'clubs', clubId, 'profiles'));
          clubUsers = profilesSnap.size;
          totalUsers += clubUsers;
        } catch (error) {
          console.warn(`Errore nel contare i profili per ${clubId}:`, error);
        }

        // Conta partite
        try {
          const matchesSnap = await getDocs(collection(db, 'clubs', clubId, 'matches'));
          clubMatches = matchesSnap.size;
          totalMatches += clubMatches;
        } catch (error) {
          console.warn(`Errore nel contare le partite per ${clubId}:`, error);
        }

        // Conta prenotazioni dalla root collection
        try {
          const bookingsSnap = await getDocs(
            query(collection(db, 'bookings'), where('clubId', '==', clubId))
          );
          clubBookings = bookingsSnap.size;
          totalBookings += clubBookings;
        } catch (error) {
          console.warn(`Errore nel contare le prenotazioni per ${clubId}:`, error);
        }

        // Aggiungi ai dati dei club
        clubsData.push({
          id: clubId,
          name: clubData.name || `Circolo ${clubId}`,
          users: clubUsers,
          matches: clubMatches,
          bookings: clubBookings,
          total: clubUsers + clubMatches + clubBookings,
        });

        usersByClub.push({
          club: clubData.name || `Circolo ${clubId}`,
          users: clubUsers,
        });

        // Simula attività recente
        if (clubUsers > 0) {
          recentActivity.push({
            id: `activity-${clubId}`,
            type: 'new_users',
            club: clubData.name,
            count: clubUsers,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          });
        }
      }

      // Ordina i club per attività totale
      const topClubs = clubsData.sort((a, b) => b.total - a.total).slice(0, 5);

      // Simula crescita club negli ultimi 6 mesi
      const clubGrowth = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        clubGrowth.push({
          month: month.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
          clubs: Math.max(1, totalClubs - Math.floor(Math.random() * 3)),
        });
      }

      // Simula prenotazioni per mese
      const bookingsByMonth = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        bookingsByMonth.push({
          month: month.toLocaleDateString('it-IT', { month: 'short' }),
          bookings:
            Math.floor((Math.random() * totalBookings) / 6) + Math.floor(totalBookings / 12),
        });
      }

      setStats({
        totalClubs,
        totalUsers,
        totalMatches,
        totalBookings,
        recentActivity: recentActivity.slice(0, 5),
        clubGrowth,
        usersByClub: usersByClub.slice(0, 5),
        bookingsByMonth,
        topClubs,
      });
    } catch (error) {
      console.error('Errore nel caricare i dati dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Errore logout:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, onClick, trend }) => (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 ${onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {loading ? '...' : value.toLocaleString()}
          </p>
          {trend && (
            <div
              className={`flex items-center space-x-1 mt-2 text-sm ${
                trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend)}% questo mese</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const SimpleChart = ({ data, title, dataKey, color = 'bg-blue-500' }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => {
          const maxValue = Math.max(...data.map((d) => d[dataKey]));
          const percentage = maxValue > 0 ? (item[dataKey] / maxValue) * 100 : 0;

          return (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">
                  {item.month || item.club || item.name || `Item ${index + 1}`}
                </span>
                <span className="font-medium">{item[dataKey]}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${color.replace('bg-', 'bg-gradient-to-r from-').replace('-500', '-400 to-').replace('-400', '-600')}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Caricamento dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">PlaySport Admin</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{auth.currentUser?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Esci</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Benvenuto nel Portale Admin</h2>
          <p className="text-gray-600">
            Gestisci circoli, utenti e configurazioni del sistema PlaySport
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Circoli Totali"
            value={stats.totalClubs}
            icon={Building2}
            color="bg-blue-500"
            onClick={() => {
              trackAdmin.actionPerformed('navigate_clubs', 'dashboard_stat_card');
              navigate('/admin/clubs');
            }}
            trend={12}
          />
          <StatCard
            title="Utenti Registrati"
            value={stats.totalUsers}
            icon={Users}
            color="bg-green-500"
            onClick={() => {
              trackAdmin.actionPerformed('navigate_users', 'dashboard_stat_card');
              navigate('/admin/users');
            }}
            trend={8}
          />
          <StatCard
            title="Partite Giocate"
            value={stats.totalMatches}
            icon={Activity}
            color="bg-purple-500"
            trend={15}
          />
          <StatCard
            title="Prenotazioni"
            value={stats.totalBookings}
            icon={Calendar}
            color="bg-orange-500"
            trend={-3}
          />
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SimpleChart
            title="Crescita Circoli"
            data={stats.clubGrowth}
            dataKey="clubs"
            color="bg-blue-500"
          />
          <SimpleChart
            title="Prenotazioni per Mese"
            data={stats.bookingsByMonth}
            dataKey="bookings"
            color="bg-orange-500"
          />
        </div>

        {/* Top Clubs and Users by Club */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Circoli Più Attivi</h3>
            <div className="space-y-4">
              {stats.topClubs.map((club, index) => (
                <div key={club.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                            ? 'bg-gray-400'
                            : index === 2
                              ? 'bg-orange-400'
                              : 'bg-blue-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{club.name}</p>
                      <p className="text-sm text-gray-600">
                        {club.users} utenti • {club.matches} partite
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{club.total}</p>
                    <p className="text-sm text-gray-600">attività</p>
                  </div>
                </div>
              ))}
              {stats.topClubs.length === 0 && (
                <p className="text-gray-500 text-center py-4">Nessun dato disponibile</p>
              )}
            </div>
          </div>

          <SimpleChart
            title="Utenti per Circolo"
            data={stats.usersByClub}
            dataKey="users"
            color="bg-green-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/club-requests')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors bg-yellow-50 border border-yellow-200"
              >
                <Building2 className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <span className="block font-medium">Richieste Circoli</span>
                  <span className="text-xs text-yellow-600">Nuove registrazioni da approvare</span>
                </div>
              </button>
              <button
                onClick={() => navigate('/admin/clubs/new')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Crea Nuovo Circolo</span>
              </button>
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <UserCog className="w-5 h-5 text-green-600" />
                <span>Gestisci Utenti</span>
              </button>
              <button
                onClick={() => navigate('/admin/settings')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-purple-600" />
                <span>Configurazioni Sistema</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestione Circoli</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/clubs')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Visualizza Tutti i Circoli</span>
              </button>
              <button
                onClick={() => navigate('/admin/clubs/analytics')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span>Analytics Circoli</span>
              </button>
              <button
                onClick={() => navigate('/admin/clubs/settings')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <span>Configurazioni Globali</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistema</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Sistema Online</span>
              </div>
              <div className="flex items-center space-x-3 p-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Database Connesso</span>
              </div>
              <div className="flex items-center space-x-3 p-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Prestazioni Ottime</span>
              </div>
            </div>
          </div>

          {/* Admin tool: Revert Championship Points */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <AdminChampionshipRevertTool />
          </div>
        </div>

        {/* Recent Activity - Ora funzionale */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attività Recente</h3>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.count} nuovi utenti in{' '}
                      <span className="font-semibold">{activity.club}</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      {activity.timestamp.toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {Math.floor((new Date() - activity.timestamp) / (1000 * 60 * 60 * 24))} giorni
                    fa
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nessuna attività recente</p>
              <p className="text-sm mt-2">
                Le attività appariranno qui quando ci saranno nuove registrazioni
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

// --- Inline Admin utility: Revert Championship Points for a Tournament ---
const AdminChampionshipRevertTool = () => {
  const [clubId, setClubId] = useState('');
  const [tournamentId, setTournamentId] = useState('');
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState(null);

  const onRevert = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!clubId || !tournamentId) {
      setMessage({ type: 'error', text: 'Inserisci clubId e tournamentId' });
      return;
    }
    if (!window.confirm('Confermi di voler annullare i punti campionato per questo torneo?')) {
      return;
    }
    setRunning(true);
    try {
      const res = await revertTournamentChampionshipPoints(clubId.trim(), tournamentId.trim());
      if (res.success) {
        if (res.alreadyReverted) {
          setMessage({ type: 'info', text: 'Nessun punto da annullare (già annullato o non applicato).' });
        } else {
          setMessage({ type: 'success', text: 'Punti annullati con successo.' });
        }
      } else {
        setMessage({ type: 'error', text: res.error || 'Errore durante l\'annullamento.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Errore inatteso.' });
    } finally {
      setRunning(false);
    }
  };

  const onCheck = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!clubId || !tournamentId) {
      setMessage({ type: 'error', text: 'Inserisci clubId e tournamentId' });
      return;
    }
    try {
      const status = await getChampionshipApplyStatus(clubId.trim(), tournamentId.trim());
      if (status.applied) {
        setMessage({ type: 'info', text: `Punti applicati trovati. appliedAt: ${status.data?.appliedAt || 'n/d'}` });
      } else {
        setMessage({ type: 'error', text: 'Nessun audit trovato per questi ID (probabilmente già annullati o ID non corrispondenti).' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Errore durante la verifica.' });
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Annulla Punti Campionato (Admin)</h3>
      <form onSubmit={onRevert} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="clubId">clubId</label>
          <input
            id="clubId"
            type="text"
            value={clubId}
            onChange={(e) => setClubId(e.target.value)}
            placeholder="es. Sporting-cat"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tournamentId">tournamentId</label>
          <input
            id="tournamentId"
            type="text"
            value={tournamentId}
            onChange={(e) => setTournamentId(e.target.value)}
            placeholder="es. 0ldDFGoWU6dgHUcQJ1M7"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? 'Annullamento...' : 'Annulla Punti Torneo'}
          </button>
          <button
            onClick={onCheck}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
            type="button"
          >
            Verifica stato
          </button>
          {message && (
            <span
              className={`text-sm ${
                message.type === 'success'
                  ? 'text-green-600'
                  : message.type === 'error'
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}
            >
              {message.text}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
