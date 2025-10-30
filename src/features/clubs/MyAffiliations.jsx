// =============================================
// FILE: src/features/clubs/MyAffiliations.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext.jsx';
import { getUserAffiliations } from '@services/clubs.js';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';

const AffiliationCard = ({ affiliation, onEnterClub }) => {
  const { AFFILIATION_STATUS, isClubAdmin } = useAuth();
  const navigate = useNavigate();

  const getStatusBadge = () => {
    switch (affiliation.status) {
      case AFFILIATION_STATUS.PENDING:
        return (
          <span
            className="bg-yellow-900/30 text-yellow-400 
                         px-3 py-1 rounded-full text-sm font-medium"
          >
            ⏳ In attesa
          </span>
        );
      case AFFILIATION_STATUS.APPROVED:
        return (
          <span
            className="bg-green-900/30 text-green-400 
                         px-3 py-1 rounded-full text-sm font-medium"
          >
            ✅ Approvata
          </span>
        );
      case AFFILIATION_STATUS.REJECTED:
        return (
          <span
            className="bg-red-900/30 text-red-400 
                         px-3 py-1 rounded-full text-sm font-medium"
          >
            ❌ Rifiutata
          </span>
        );
      default:
        return null;
    }
  };

  const getActionButton = () => {
    switch (affiliation.status) {
      case AFFILIATION_STATUS.APPROVED:
        // Gli admin club non hanno bisogno del bottone "Entra nel Club" - sono già nel loro club
        if (isClubAdmin(affiliation.clubId)) {
          return (
            <span
              className="text-blue-600 text-blue-400 px-4 py-2 rounded-lg
                           font-medium text-sm"
            >
              👑 Amministratore
            </span>
          );
        }
        return (
          <button
            onClick={() => onEnterClub(affiliation.clubId)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg
                     font-medium transition-colors"
          >
            Entra nel Club
          </button>
        );
      case AFFILIATION_STATUS.PENDING:
        return (
          <button
            onClick={() => navigate(`/club/${affiliation.clubId}/preview`)}
            className="border border-gray-300 border-gray-600 text-gray-700 text-gray-300 
                     px-4 py-2 rounded-lg font-medium hover:bg-gray-50 hover:bg-gray-700 
                     transition-colors"
          >
            Vedi Club
          </button>
        );
      case AFFILIATION_STATUS.REJECTED:
        return (
          <div className="text-sm text-gray-500 text-gray-400">
            {affiliation.adminNotes && <p className="italic">"{affiliation.adminNotes}"</p>}
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 text-white mb-1">
            {affiliation.club?.name || 'Club non trovato'}
          </h3>
          {affiliation.club?.location && (
            <p className="text-gray-600 text-gray-400 text-sm">
              📍 {affiliation.club.location.city}, {affiliation.club.location.region}
            </p>
          )}
        </div>
        {getStatusBadge()}
      </div>

      {/* Club details */}
      {affiliation.club && (
        <div className="mb-4 space-y-2 text-sm text-gray-600 text-gray-400">
          {affiliation.club.stats?.totalCourts && (
            <div>🎾 {affiliation.club.stats.totalCourts} campi</div>
          )}
          {affiliation.club.stats?.totalMembers && (
            <div>👥 {affiliation.club.stats.totalMembers} membri</div>
          )}
        </div>
      )}

      {/* Request details */}
      <div className="text-sm text-gray-500 text-gray-400 mb-4">
        <div>Richiesta inviata: {formatDate(affiliation.requestedAt)}</div>
        {affiliation.approvedAt && <div>Approvata: {formatDate(affiliation.approvedAt)}</div>}
        {affiliation.notes && (
          <div className="mt-2">
            <span className="font-medium">Nota:</span> {affiliation.notes}
          </div>
        )}
      </div>

      <div className="flex justify-end">{getActionButton()}</div>
    </div>
  );
};

const MyAffiliations = () => {
  const { user, switchToClub, userAffiliations, loadUserAffiliations } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAffiliations();
  }, [user]);

  const loadAffiliations = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Use the AuthContext method to ensure consistency
      await loadUserAffiliations();
    } catch (err) {
      console.error('Error loading affiliations:', err);
      setError('Errore nel caricamento delle affiliazioni');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterClub = async (clubId) => {
    try {
      await switchToClub(clubId);
      navigate(`/club/${clubId}`);
    } catch (error) {
      console.error('Error switching to club:', error);
      alert('Errore: ' + error.message);
    }
  };

  const groupedAffiliations = {
    approved: userAffiliations.filter((a) => a.status === 'approved'),
    pending: userAffiliations.filter((a) => a.status === 'pending'),
    rejected: userAffiliations.filter((a) => a.status === 'rejected'),
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 text-white mb-2">
          Le mie Affiliazioni
        </h1>
        <p className="text-gray-600 text-gray-400">
          Gestisci i tuoi club e le richieste di affiliazione
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/search-clubs')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg
                     font-medium transition-colors inline-flex items-center gap-2"
          >
            🔍 Cerca nuovi club
          </button>
          <button
            onClick={loadAffiliations}
            className="border border-gray-300 border-gray-600 text-gray-700 text-gray-300 
                     px-6 py-3 rounded-lg font-medium hover:bg-gray-50 hover:bg-gray-700 
                     transition-colors"
          >
            🔄 Aggiorna
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-6 bg-red-50 bg-red-900/20 border border-red-200 border-red-800 
                      rounded-lg p-4 text-red-700 text-red-400"
        >
          {error}
        </div>
      )}

      {/* No affiliations */}
      {!loading && userAffiliations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏟️</div>
          <h3 className="text-xl font-medium text-gray-900 text-white mb-2">
            Nessuna affiliazione
          </h3>
          <p className="text-gray-600 text-gray-400 mb-6">
            Inizia cercando e richiedendo l'affiliazione ai club di tuo interesse
          </p>
          <button
            onClick={() => navigate('/search-clubs')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg
                     font-medium transition-colors"
          >
            Cerca Club
          </button>
        </div>
      )}

      {/* Approved Affiliations */}
      {groupedAffiliations.approved.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 text-white mb-4">
            Club Attivi ({groupedAffiliations.approved.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {groupedAffiliations.approved.map((affiliation) => (
              <AffiliationCard
                key={affiliation.id}
                affiliation={affiliation}
                onEnterClub={handleEnterClub}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Affiliations */}
      {groupedAffiliations.pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 text-white mb-4">
            Richieste in Attesa ({groupedAffiliations.pending.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {groupedAffiliations.pending.map((affiliation) => (
              <AffiliationCard
                key={affiliation.id}
                affiliation={affiliation}
                onEnterClub={handleEnterClub}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected Affiliations */}
      {groupedAffiliations.rejected.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 text-white mb-4">
            Richieste Rifiutate ({groupedAffiliations.rejected.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {groupedAffiliations.rejected.map((affiliation) => (
              <AffiliationCard
                key={affiliation.id}
                affiliation={affiliation}
                onEnterClub={handleEnterClub}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAffiliations;


