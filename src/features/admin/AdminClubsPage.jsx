// =============================================
// FILE: src/features/admin/AdminClubsPage.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext.jsx';
import { getClubsForAdmin, deleteClub } from '@services/admin.js';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';

const ClubCard = ({ club, onEdit, onDelete, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'Attivo';
      case 'suspended':
        return 'Sospeso';
      case 'pending':
        return 'In Attesa';
      default:
        return 'Sconosciuto';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{club.name}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(club.status)}`}
            >
              {getStatusText(club.status)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            📍{' '}
            {typeof club.location === 'string'
              ? club.location
              : club.location?.address || club.location?.city || 'Posizione non specificata'}
          </p>
          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>👥 {club.stats?.totalMembers || 0} membri</span>
            <span>🏟️ {club.stats?.totalCourts || 0} campi</span>
            <span>📅 {club.stats?.monthlyBookings || 0} prenotazioni/mese</span>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onViewDetails(club.id)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 dark:border-blue-600 dark:hover:bg-blue-900/20"
          >
            Dettagli
          </button>
          <button
            onClick={() => onEdit(club.id)}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 text-sm px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Modifica
          </button>
          <button
            onClick={() => onDelete(club.id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm px-3 py-1 rounded border border-red-200 hover:bg-red-50 dark:border-red-600 dark:hover:bg-red-900/20"
          >
            Elimina
          </button>
        </div>
      </div>

      {club.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          {club.description.length > 150
            ? `${club.description.substring(0, 150)}...`
            : club.description}
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>Creato: {new Date(club.createdAt).toLocaleDateString('it-IT')}</span>
        <span>ID: {club.id}</span>
      </div>
    </div>
  );
};

const FilterBar = ({ filters, onFiltersChange, clubsCount }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stato:</label>
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Tutti</option>
            <option value="active">Attivi</option>
            <option value="suspended">Sospesi</option>
            <option value="pending">In Attesa</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cerca:</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Nome club..."
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ordina per:
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="name">Nome</option>
            <option value="createdAt">Data Creazione</option>
            <option value="members">Numero Membri</option>
            <option value="bookings">Prenotazioni</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {clubsCount} club{clubsCount !== 1 ? 's' : ''} trovati
          </span>
          <button
            onClick={() => onFiltersChange({ status: '', search: '', sortBy: 'name' })}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Reset Filtri
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminClubsPage = () => {
  const navigate = useNavigate();
  const { userRole, USER_ROLES } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sortBy: 'name',
  });

  useEffect(() => {
    if (userRole !== USER_ROLES.SUPER_ADMIN) {
      navigate('/');
      return;
    }

    loadClubs();
  }, [userRole, navigate]);

  useEffect(() => {
    applyFilters();
  }, [clubs, filters]);

  const loadClubs = async () => {
    try {
      setLoading(true);
      const clubsData = await getClubsForAdmin();
      setClubs(clubsData);
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...clubs];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((club) => club.status === filters.status);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((club) => {
        const locationText =
          typeof club.location === 'string'
            ? club.location
            : club.location?.address || club.location?.city || '';

        return (
          club.name.toLowerCase().includes(searchLower) ||
          locationText.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'members':
          return (b.stats?.totalMembers || 0) - (a.stats?.totalMembers || 0);
        case 'bookings':
          return (b.stats?.monthlyBookings || 0) - (a.stats?.monthlyBookings || 0);
        default:
          return 0;
      }
    });

    setFilteredClubs(filtered);
  };

  const handleEdit = (clubId) => {
    navigate(`/admin/clubs/${clubId}/edit`);
  };

  const handleViewDetails = (clubId) => {
    navigate(`/admin/clubs/${clubId}`);
  };

  const handleDelete = async (clubId) => {
    if (
      !confirm('Sei sicuro di voler eliminare questo club? Questa azione non può essere annullata.')
    ) {
      return;
    }

    try {
      await deleteClub(clubId);
      loadClubs(); // Refresh list
    } catch (error) {
      console.error('Error deleting club:', error);
      alert("Errore durante l'eliminazione del club");
    }
  };

  if (userRole !== USER_ROLES.ADMIN) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Admin Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Gestione Club</h1>
            </div>
            <button
              onClick={() => navigate('/admin/clubs/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + Nuovo Club
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          clubsCount={filteredClubs.length}
        />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredClubs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏟️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {clubs.length === 0 ? 'Nessun club registrato' : 'Nessun club trovato'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {clubs.length === 0
                ? 'Inizia creando il primo club della piattaforma.'
                : 'Prova a modificare i filtri di ricerca.'}
            </p>
            {clubs.length === 0 && (
              <button
                onClick={() => navigate('/admin/clubs/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Crea il primo club
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClubsPage;
