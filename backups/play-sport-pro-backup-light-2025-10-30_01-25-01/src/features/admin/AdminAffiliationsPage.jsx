// =============================================
// FILE: src/features/admin/AdminAffiliationsPage.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext.jsx';
import {
  getPendingAffiliations,
  getAllAffiliations,
  approveAffiliation,
  rejectAffiliation,
} from '@services/admin.js';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';

const AffiliationCard = ({
  affiliation,
  onApprove,
  onReject,
  onViewDetails,
  showActions = true,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 bg-green-900 text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 bg-red-900 text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 bg-yellow-900 text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 bg-gray-900 text-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approvata';
      case 'rejected':
        return 'Rifiutata';
      case 'pending':
        return 'In Attesa';
      default:
        return 'Sconosciuto';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white bg-gray-800 rounded-lg shadow-sm border border-gray-200 border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 text-white">
              {affiliation.user?.displayName || affiliation.user?.email || 'Utente sconosciuto'}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(affiliation.status)}`}
            >
              {getStatusText(affiliation.status)}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600 text-gray-400">
            <p>📧 {affiliation.user?.email || 'Email non disponibile'}</p>
            <p>
              🏟️ <strong>{affiliation.club?.name || 'Club sconosciuto'}</strong>
            </p>
            {affiliation.club?.location && (
              <p>
                📍{' '}
                {typeof affiliation.club.location === 'string'
                  ? affiliation.club.location
                  : affiliation.club.location?.address ||
                    affiliation.club.location?.city ||
                    'Posizione non specificata'}
              </p>
            )}
          </div>
        </div>

        {showActions && affiliation.status === 'pending' && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onApprove(affiliation.id)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
              title="Approva"
            >
              ✅ Approva
            </button>
            <button
              onClick={() => onReject(affiliation.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
              title="Rifiuta"
            >
              ❌ Rifiuta
            </button>
          </div>
        )}

        {!showActions && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onViewDetails(affiliation.id)}
              className="text-blue-600 hover:text-blue-800 text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 border-blue-600 hover:bg-blue-900/20"
            >
              Dettagli
            </button>
          </div>
        )}
      </div>

      {affiliation.notes && (
        <div className="mt-3 p-3 bg-gray-50 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-700 text-gray-300">
            <strong>Note:</strong> "{affiliation.notes}"
          </p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 border-gray-700 space-y-1">
        <div className="flex justify-between items-center text-xs text-gray-500 text-gray-400">
          <span>Richiesta: {formatDate(affiliation.requestedAt)}</span>
          <span>ID: {affiliation.id}</span>
        </div>

        {affiliation.status !== 'pending' && affiliation.processedAt && (
          <div className="flex justify-between items-center text-xs text-gray-500 text-gray-400">
            <span>
              {affiliation.status === 'approved' ? 'Approvata' : 'Rifiutata'}:{' '}
              {formatDate(affiliation.processedAt)}
            </span>
            {affiliation.processedBy && <span>da {affiliation.processedBy}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

const AffiliationFilterBar = ({ filters, onFiltersChange, affiliationsCount }) => {
  return (
    <div className="bg-white bg-gray-800 rounded-lg shadow-sm border border-gray-200 border-gray-700 p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 text-gray-300">Stato:</label>
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
            className="border border-gray-300 border-gray-600 rounded-md px-3 py-1 text-sm bg-white bg-gray-700 text-gray-900 text-white"
          >
            <option value="">Tutti</option>
            <option value="pending">In Attesa</option>
            <option value="approved">Approvate</option>
            <option value="rejected">Rifiutate</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 text-gray-300">Cerca:</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Nome utente o club..."
            className="border border-gray-300 border-gray-600 rounded-md px-3 py-1 text-sm bg-white bg-gray-700 text-gray-900 text-white placeholder-gray-500 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 text-gray-300">
            Ordina per:
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
            className="border border-gray-300 border-gray-600 rounded-md px-3 py-1 text-sm bg-white bg-gray-700 text-gray-900 text-white"
          >
            <option value="requestedAt">Data Richiesta</option>
            <option value="processedAt">Data Elaborazione</option>
            <option value="userName">Nome Utente</option>
            <option value="clubName">Nome Club</option>
            <option value="status">Stato</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-gray-600 text-gray-400">
            {affiliationsCount} affiliazioni trovate
          </span>
          <button
            onClick={() => onFiltersChange({ status: '', search: '', sortBy: 'requestedAt' })}
            className="text-sm text-blue-600 hover:text-blue-800 text-blue-400 hover:text-blue-300"
          >
            Reset Filtri
          </button>
        </div>
      </div>
    </div>
  );
};

const StatsOverview = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="bg-white bg-gray-800 rounded-lg shadow-sm border border-gray-200 border-gray-700 p-6 mb-6">
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-yellow-50 bg-yellow-900/20 border border-yellow-200 border-yellow-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">⏳</div>
          <div>
            <p className="text-sm font-medium text-yellow-700 text-yellow-300">In Attesa</p>
            <p className="text-xl font-semibold text-yellow-900 text-yellow-100">
              {stats.pending || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 bg-green-900/20 border border-green-200 border-green-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">✅</div>
          <div>
            <p className="text-sm font-medium text-green-700 text-green-300">Approvate</p>
            <p className="text-xl font-semibold text-green-900 text-green-100">
              {stats.approved || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-red-50 bg-red-900/20 border border-red-200 border-red-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">❌</div>
          <div>
            <p className="text-sm font-medium text-red-700 text-red-300">Rifiutate</p>
            <p className="text-xl font-semibold text-red-900 text-red-100">
              {stats.rejected || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 bg-blue-900/20 border border-blue-200 border-blue-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📊</div>
          <div>
            <p className="text-sm font-medium text-blue-700 text-blue-300">Totale</p>
            <p className="text-xl font-semibold text-blue-900 text-blue-100">
              {(stats.pending || 0) + (stats.approved || 0) + (stats.rejected || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminAffiliationsPage = () => {
  const navigate = useNavigate();
  const { userRole, USER_ROLES } = useAuth();
  const [affiliations, setAffiliations] = useState([]);
  const [filteredAffiliations, setFilteredAffiliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [showPendingOnly, setShowPendingOnly] = useState(true);
  const [filters, setFilters] = useState({
    status: 'pending',
    search: '',
    sortBy: 'requestedAt',
  });

  useEffect(() => {
    if (userRole !== USER_ROLES.ADMIN) {
      navigate('/');
      return;
    }

    loadAffiliations();
  }, [userRole, navigate, showPendingOnly]);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [affiliations, filters]);

  const loadAffiliations = async () => {
    try {
      setLoading(true);
      const affiliationsData = showPendingOnly
        ? await getPendingAffiliations()
        : await getAllAffiliations();
      setAffiliations(affiliationsData);
    } catch (error) {
      console.error('Error loading affiliations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const stats = affiliations.reduce((acc, affiliation) => {
      acc[affiliation.status] = (acc[affiliation.status] || 0) + 1;
      return acc;
    }, {});
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...affiliations];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((affiliation) => affiliation.status === filters.status);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (affiliation) =>
          (affiliation.user?.displayName &&
            affiliation.user.displayName.toLowerCase().includes(searchLower)) ||
          (affiliation.user?.email && affiliation.user.email.toLowerCase().includes(searchLower)) ||
          (affiliation.club?.name && affiliation.club.name.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'requestedAt':
          return new Date(b.requestedAt) - new Date(a.requestedAt);
        case 'processedAt':
          if (!a.processedAt && !b.processedAt) return 0;
          if (!a.processedAt) return 1;
          if (!b.processedAt) return -1;
          return new Date(b.processedAt) - new Date(a.processedAt);
        case 'userName':
          const nameA = a.user?.displayName || a.user?.email || '';
          const nameB = b.user?.displayName || b.user?.email || '';
          return nameA.localeCompare(nameB);
        case 'clubName':
          const clubA = a.club?.name || '';
          const clubB = b.club?.name || '';
          return clubA.localeCompare(clubB);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    setFilteredAffiliations(filtered);
  };

  const handleApprove = async (affiliationId) => {
    if (!confirm('Sei sicuro di voler approvare questa affiliazione?')) {
      return;
    }

    try {
      await approveAffiliation(affiliationId);
      loadAffiliations(); // Refresh list
    } catch (error) {
      console.error('Error approving affiliation:', error);
      alert("Errore durante l'approvazione dell'affiliazione");
    }
  };

  const handleReject = async (affiliationId) => {
    const reason = prompt('Inserisci il motivo del rifiuto (opzionale):');

    try {
      await rejectAffiliation(affiliationId, reason);
      loadAffiliations(); // Refresh list
    } catch (error) {
      console.error('Error rejecting affiliation:', error);
      alert("Errore durante il rifiuto dell'affiliazione");
    }
  };

  const handleViewDetails = (affiliationId) => {
    navigate(`/admin/affiliations/${affiliationId}`);
  };

  const handleToggleView = () => {
    setShowPendingOnly(!showPendingOnly);
    // Reset filters when switching views
    setFilters({
      status: showPendingOnly ? '' : 'pending',
      search: '',
      sortBy: 'requestedAt',
    });
  };

  if (userRole !== USER_ROLES.ADMIN) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-gray-900">
      {/* Header */}
      <div className="bg-white bg-gray-800 border-b border-gray-200 border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-500 hover:text-gray-700 text-gray-400 hover:text-gray-200"
              >
                ← Admin Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900 text-white">
                Gestione Affiliazioni
              </h1>
            </div>
            <button
              onClick={handleToggleView}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {showPendingOnly ? 'Mostra Tutte' : 'Solo Pending'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showPendingOnly && <StatsOverview stats={stats} loading={loading} />}

        <AffiliationFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          affiliationsCount={filteredAffiliations.length}
        />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredAffiliations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 text-white mb-2">
              {affiliations.length === 0
                ? showPendingOnly
                  ? 'Nessuna affiliazione in attesa'
                  : 'Nessuna affiliazione trovata'
                : 'Nessuna affiliazione corrisponde ai filtri'}
            </h3>
            <p className="text-gray-500 text-gray-400">
              {affiliations.length === 0
                ? 'Le richieste di affiliazione compariranno qui quando gli utenti si iscriveranno ai club.'
                : 'Prova a modificare i filtri di ricerca.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAffiliations.map((affiliation) => (
              <AffiliationCard
                key={affiliation.id}
                affiliation={affiliation}
                onApprove={handleApprove}
                onReject={handleReject}
                onViewDetails={handleViewDetails}
                showActions={showPendingOnly || affiliation.status === 'pending'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAffiliationsPage;

