// =============================================
// FILE: src/features/admin/AdminDashboard.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext.jsx';
import { getClubs, createClub } from '@services/clubs.js';
import { getAdminStats, getRecentActivity, getPendingAffiliations } from '@services/admin.js';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';

const StatCard = ({ title, value, icon, color = 'blue', subtitle, trend }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↗️' : '↘️'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
};

const QuickActions = ({
  onCreateClub,
  onManageClubs,
  onManageUsers,
  onViewAffiliations,
  onCreateSportingCAT,
  onMigrateData,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Azioni Rapide</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <button
          onClick={onCreateSportingCAT}
          className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 
                   text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          <span>🏟️</span>
          Crea Sporting CAT
        </button>
        <button
          onClick={onMigrateData}
          className="flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 
                   text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          <span>🔄</span>
          Migra Dati
        </button>
        <button
          onClick={onCreateClub}
          className="flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 
                   text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          <span>➕</span>
          Crea Club
        </button>
        <button
          onClick={onManageClubs}
          className="flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 
                   text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg font-medium
                   hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span>🏟️</span>
          Gestisci Club
        </button>
        <button
          onClick={onManageUsers}
          className="flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 
                   text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg font-medium
                   hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span>👥</span>
          Gestisci Utenti
        </button>
        <button
          onClick={onViewAffiliations}
          className="flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 
                   text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg font-medium
                   hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span>📝</span>
          Affiliazioni
        </button>
      </div>
    </div>
  );
};

const MigrationWarningBanner = ({ onCreateSportingCAT, onMigrateData, clubs }) => {
  const [dismissed, setDismissed] = useState(false);

  // Check if Sporting CAT exists
  const sportingCAT = clubs?.find((club) => club.name === 'Sporting CAT');

  // Don't show if dismissed or if Sporting CAT exists and has migrated data
  if (dismissed || (sportingCAT && sportingCAT.lastMigration)) {
    return null;
  }

  return (
    <div
      className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 
                    border-l-4 border-amber-400 rounded-lg p-6"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
              Migrazione Dati Richiesta
            </h3>
          </div>

          <div className="text-amber-700 dark:text-amber-300 space-y-2">
            <p className="font-medium">
              🔄 I dati esistenti (giocatori, partite, prenotazioni) non sono ancora associati a
              nessun club.
            </p>
            <p className="text-sm">
              Per utilizzare il sistema multi-club, devi prima creare il club "Sporting CAT" e poi
              migrare tutti i dati esistenti a questo club.
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              {!sportingCAT ? (
                <button
                  onClick={onCreateSportingCAT}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg 
                           font-medium flex items-center gap-2 transition-colors"
                >
                  <span>🏟️</span>
                  1. Crea Sporting CAT
                </button>
              ) : (
                <div
                  className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 
                              px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                >
                  <span>✅</span>
                  Sporting CAT creato
                </div>
              )}

              <button
                onClick={onMigrateData}
                disabled={!sportingCAT}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors
                  ${
                    sportingCAT
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <span>🔄</span>
                2. Migra Dati Esistenti
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 
                   p-1 rounded transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Attività Recente
        </h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Data sconosciuta';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Meno di un'ora fa";
    if (diffHours < 24) return `${diffHours} ore fa`;
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return date.toLocaleDateString('it-IT');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attività Recente</h2>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            Nessuna attività recente
          </p>
        ) : (
          activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
            >
              <span className="text-xl flex-shrink-0">{activity.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white truncate">{activity.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const PendingAffiliations = ({ affiliations, loading, onApprove, onReject }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Affiliazioni in Sospeso
        </h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Affiliazioni in Sospeso
        </h2>
        <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {affiliations.length}
        </span>
      </div>

      <div className="space-y-3">
        {affiliations.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            Nessuna affiliazione in sospeso
          </p>
        ) : (
          affiliations.slice(0, 5).map((affiliation) => (
            <div
              key={affiliation.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {affiliation.user?.displayName ||
                      affiliation.user?.email ||
                      'Utente sconosciuto'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    → {affiliation.club?.name || 'Club sconosciuto'}
                  </p>
                  {affiliation.notes && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">
                      "{affiliation.notes}"
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onApprove(affiliation.id)}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    title="Approva"
                  >
                    ✅
                  </button>
                  <button
                    onClick={() => onReject(affiliation.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Rifiuta"
                  >
                    ❌
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Richiesta: {new Date(affiliation.requestedAt).toLocaleDateString('it-IT')}
              </p>
            </div>
          ))
        )}

        {affiliations.length > 5 && (
          <div className="text-center pt-2">
            <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Vedi tutte ({affiliations.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ClubCreateModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    region: '',
    phone: '',
    email: '',
    website: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const clubData = {
        name: formData.name,
        description: formData.description,
        location: {
          address: formData.address,
          city: formData.city,
          region: formData.region,
          coordinates: { lat: 0, lng: 0 }, // You'd use geocoding here
        },
        contact: {
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
        },
      };

      const clubId = await createClub(clubData);
      onSubmit(clubId);
      onClose();

      // Reset form
      setFormData({
        name: '',
        description: '',
        address: '',
        city: '',
        region: '',
        phone: '',
        email: '',
        website: '',
      });
    } catch (error) {
      console.error('Error creating club:', error);
      alert('Errore nella creazione del club: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-90vh overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Crea Nuovo Club</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome Club *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrizione
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Indirizzo
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Città *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Regione *
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sito Web
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg font-medium
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300
                         text-white rounded-lg font-medium transition-colors"
              >
                {isSubmitting ? 'Creazione...' : 'Crea Club'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userRole, USER_ROLES } = useAuth();
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingAffiliations, setPendingAffiliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [affiliationsLoading, setAffiliationsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Redirect if not admin
    if (userRole !== USER_ROLES.ADMIN) {
      navigate('/');
      return;
    }

    loadDashboardData();
  }, [userRole, navigate]);

  const loadDashboardData = async () => {
    try {
      // Load all data in parallel
      const [statsData, activityData, affiliationsData] = await Promise.all([
        getAdminStats().catch((err) => {
          console.error('Error loading stats:', err);
          return {};
        }),
        getRecentActivity().catch((err) => {
          console.error('Error loading activity:', err);
          setActivityLoading(false);
          return [];
        }),
        getPendingAffiliations().catch((err) => {
          console.error('Error loading affiliations:', err);
          setAffiliationsLoading(false);
          return [];
        }),
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
      setPendingAffiliations(affiliationsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setActivityLoading(false);
      setAffiliationsLoading(false);
    }
  };

  const handleCreateClub = () => {
    setShowCreateModal(true);
  };

  const handleCreateSportingCAT = async () => {
    if (window.confirm('Vuoi creare il club "Sporting CAT" con tutti i dati predefiniti?')) {
      try {
        // Dati predefiniti per Sporting CAT
        const sportingCATData = {
          name: 'Sporting CAT',
          description:
            'Club Sportivo specializzato in Padel e Tennis. Il nostro circolo offre campi moderni, istruttori qualificati e un ambiente accogliente per giocatori di tutti i livelli.',
          location: {
            address: 'Via dello Sport, 123',
            city: 'Milano',
            region: 'Lombardia',
            coordinates: { lat: 45.4642, lng: 9.19 },
          },
          contact: {
            phone: '+39 02 1234567',
            email: 'info@sportingcat.it',
            website: 'https://www.sportingcat.it',
          },
        };

        const clubId = await createClub(sportingCATData);

        // Crea automaticamente l'affiliazione per l'admin corrente
        try {
          const { requestAffiliation, updateAffiliationStatus } = await import(
            '@services/clubs.js'
          );

          // Prima crea la richiesta di affiliazione
          const affiliationId = await requestAffiliation(
            clubId,
            currentUser.uid,
            'Affiliazione automatica admin - sviluppo'
          );

          // Poi la approva immediatamente
          await updateAffiliationStatus(
            affiliationId,
            'approved',
            currentUser.uid,
            'Auto-approvazione admin'
          );
        } catch (affiliationError) {
          console.warn("⚠️ Errore nella creazione dell'affiliazione admin:", affiliationError);
        }

        // Chiedi se si vuole migrare i dati esistenti
        if (
          window.confirm(
            'Club creato! Vuoi migrare tutti i dati esistenti (giocatori, partite, prenotazioni) a questo club?'
          )
        ) {
          await handleMigrateData(clubId);
        }

        alert('Club "Sporting CAT" creato con successo!');
        loadDashboardData(); // Refresh dei dati
      } catch (error) {
        console.error('❌ Errore nella creazione di Sporting CAT:', error);
        alert('Errore nella creazione del club: ' + error.message);
      }
    }
  };

  // Aggiungi la funzione per migrare solo i dati
  const handleMigrateDataOnly = async () => {
    const clubId = window.prompt(
      "Inserisci l'ID del club per la migrazione (lascia vuoto per cercare Sporting CAT):"
    );

    if (clubId === null) return; // User cancelled

    let targetClubId = clubId;

    // If no club ID provided, try to find Sporting CAT
    if (!clubId) {
      try {
        const clubs = await getClubs();
        const sportingCAT = clubs.find((club) => club.name === 'Sporting CAT');
        if (sportingCAT) {
          targetClubId = sportingCAT.id;
        } else {
          alert('Club Sporting CAT non trovato. Devi prima crearlo.');
          return;
        }
      } catch (error) {
        alert('Errore nella ricerca del club: ' + error.message);
        return;
      }
    }

    if (window.confirm(`Vuoi migrare tutti i dati esistenti al club con ID: ${targetClubId}?`)) {
      await handleMigrateData(targetClubId);
    }
  };

  const handleMigrateData = async (clubId) => {
    try {
      // Importa dinamicamente lo script di migrazione
      const { migrateSportingCATData } = await import('../../scripts/migrateSportingCATData.js');

      const result = await migrateSportingCATData(clubId);

      alert(
        `Migrazione completata!\n- Giocatori: ${result.migratedPlayers}\n- Partite: ${result.migratedMatches}\n- Prenotazioni: ${result.migratedBookings}\n- Campi: ${result.migratedCourts}`
      );
    } catch (error) {
      console.error('❌ Errore durante la migrazione:', error);
      alert('Errore durante la migrazione dati: ' + error.message);
    }
  };

  const handleClubCreated = (clubId) => {
    loadDashboardData(); // Refresh all data
  };

  const handleAffiliationApprove = async (affiliationId) => {
    try {
      // Here you would call a service to approve the affiliation
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error approving affiliation:', error);
    }
  };

  const handleAffiliationReject = async (affiliationId) => {
    try {
      // Here you would call a service to reject the affiliation
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting affiliation:', error);
    }
  };

  if (userRole !== USER_ROLES.ADMIN) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              PlaySport Admin Dashboard
            </h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Dashboard Utente
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Club Totali"
            value={stats.clubsCount || 0}
            icon="🏟️"
            color="blue"
            subtitle={`${stats.activeClubsCount || 0} attivi`}
          />
          <StatCard
            title="Utenti Registrati"
            value={stats.usersCount || 0}
            icon="👥"
            color="green"
            subtitle={`${stats.newUsersThisMonth || 0} questo mese`}
          />
          <StatCard
            title="Prenotazioni Oggi"
            value={stats.todayBookings || 0}
            icon="📅"
            color="purple"
            subtitle={`${stats.thisWeekBookings || 0} questa settimana`}
          />
          <StatCard
            title="Affiliazioni Pending"
            value={stats.pendingAffiliations || 0}
            icon="�"
            color={stats.pendingAffiliations > 0 ? 'orange' : 'green'}
            subtitle={`${stats.totalAffiliations || 0} totali`}
          />
        </div>

        {/* Migration Warning Banner */}
        <MigrationWarningBanner
          onCreateSportingCAT={handleCreateSportingCAT}
          onMigrateData={handleMigrateDataOnly}
          clubs={clubs}
        />

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions
            onCreateClub={handleCreateClub}
            onCreateSportingCAT={handleCreateSportingCAT}
            onManageClubs={() => navigate('/admin/clubs')}
            onManageUsers={() => navigate('/admin/users')}
            onViewAffiliations={() => navigate('/admin/affiliations')}
          />
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RecentActivity activities={recentActivity} loading={activityLoading} />
            <PendingAffiliations
              affiliations={pendingAffiliations}
              loading={affiliationsLoading}
              onApprove={handleAffiliationApprove}
              onReject={handleAffiliationReject}
            />
          </div>
          <div>
            <SystemStatus stats={stats} loading={loading} />
          </div>
        </div>
      </div>

      {/* Create Club Modal */}
      <ClubCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleClubCreated}
      />
    </div>
  );
};

const SystemStatus = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stato Sistema</h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const healthMetrics = [
    {
      label: 'Clubs Attivi',
      value: stats.clubsCount || 0,
      status: (stats.clubsCount || 0) > 0 ? 'good' : 'warning',
    },
    {
      label: 'Utenti Registrati',
      value: stats.usersCount || 0,
      status: (stats.usersCount || 0) > 10 ? 'good' : 'warning',
    },
    {
      label: 'Prenotazioni Oggi',
      value: stats.todayBookings || 0,
      status: 'good',
    },
    {
      label: 'Affiliazioni Pending',
      value: stats.pendingAffiliations || 0,
      status: (stats.pendingAffiliations || 0) === 0 ? 'good' : 'attention',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'attention':
        return 'text-orange-600 dark:text-orange-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'attention':
        return '🔔';
      case 'error':
        return '❌';
      default:
        return '⚪';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stato Sistema</h2>

      <div className="space-y-3">
        {healthMetrics.map((metric, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{getStatusIcon(metric.status)}</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{metric.label}</span>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
              {metric.value}
            </span>
          </div>
        ))}

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Ultimo aggiornamento: {new Date().toLocaleTimeString('it-IT')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
