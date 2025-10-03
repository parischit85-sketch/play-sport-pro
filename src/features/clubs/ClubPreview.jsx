// =============================================
// FILE: src/features/clubs/ClubPreview.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext.jsx';
import { getClub, requestAffiliation, getExistingAffiliation } from '@services/clubs.js';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';

const ClubPreview = () => {
  const params = useParams();
  const clubId = params.clubId;
  const navigate = useNavigate();
  const { user, userAffiliations, loadUserAffiliations, AFFILIATION_STATUS } = useAuth();
  
  console.log('👁️ [ClubPreview] Component mounting/updating:', {
    params,
    clubId,
    timestamp: new Date().toISOString()
  });
  
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAffiliation, setUserAffiliation] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    console.log('🔄 [ClubPreview] Loading club data for clubId:', clubId);
    loadClubData();
  }, [clubId]);

  useEffect(() => {
    // Check existing affiliation
    const existing = userAffiliations.find(a => a.clubId === clubId);
    setUserAffiliation(existing || null);
  }, [userAffiliations, clubId]);

  const loadClubData = async () => {
    if (!clubId) return;

    setLoading(true);
    setError(null);

    try {
      const clubData = await getClub(clubId);
      setClub(clubData);
    } catch (err) {
      console.error('Error loading club:', err);
      setError('Club non trovato');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsRequesting(true);
    setMessage(null);

    try {
      await requestAffiliation(clubId, user.uid, '');
      setMessage({
        type: 'success',
        text: 'Richiesta di affiliazione inviata con successo!'
      });
      
      // Reload user affiliations
      await loadUserAffiliations();
    } catch (error) {
      console.error('Error requesting affiliation:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Errore durante la richiesta di affiliazione'
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const getAffiliationStatus = () => {
    if (!userAffiliation) {
      return (
        <button
          onClick={handleJoinClub}
          disabled={isRequesting}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 
                   text-white px-6 py-3 rounded-lg font-medium transition-colors
                   inline-flex items-center justify-center gap-2"
        >
          {isRequesting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Invio richiesta...
            </>
          ) : (
            <>🤝 Richiedi Affiliazione</>
          )}
        </button>
      );
    }

    switch (userAffiliation.status) {
      case AFFILIATION_STATUS.PENDING:
        return (
          <div className="w-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 
                        px-6 py-3 rounded-lg text-center font-medium border border-yellow-200 dark:border-yellow-700">
            ⏳ Richiesta in attesa di approvazione
          </div>
        );
      
      case AFFILIATION_STATUS.APPROVED:
        return (
          <button
            onClick={() => navigate(`/club/${clubId}`)}
            className="w-full bg-green-500 hover:bg-green-600 text-white 
                     px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ✅ Entra nel Club
          </button>
        );
      
      case AFFILIATION_STATUS.REJECTED:
        return (
          <div className="w-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 
                        px-6 py-3 rounded-lg text-center font-medium border border-red-200 dark:border-red-700">
            ❌ Richiesta rifiutata
            {userAffiliation.adminNotes && (
              <div className="text-sm mt-1 opacity-75">
                {userAffiliation.adminNotes}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Club non trovato
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Il club richiesto non esiste o non è disponibile.
          </p>
          <button
            onClick={() => navigate('/search-clubs')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Cerca Altri Club
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                       font-medium transition-colors"
            >
              ← Indietro
            </button>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 
                           px-3 py-1 rounded-full text-sm font-medium">
              Anteprima Club
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {club.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  📍 {club.location?.city}, {club.location?.region}
                </p>
              </div>
              
              {/* Club Logo Placeholder */}
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {club.name.charAt(0)}
                </span>
              </div>
            </div>

            {club.description && (
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
                {club.description}
              </p>
            )}

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-700'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Affiliation Button */}
            {getAffiliationStatus()}
          </div>
        </div>

        {/* Club Info Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Statistiche
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">🎾 Campi</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {club.stats?.totalCourts || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">👥 Membri</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {club.stats?.totalMembers || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">📅 Prenotazioni</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {club.stats?.totalBookings || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Contatti
            </h2>
            <div className="space-y-3">
              {club.location?.address && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 mt-0.5">📍</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {club.location.address}
                  </span>
                </div>
              )}
              {club.contact?.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">📞</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {club.contact.phone}
                  </span>
                </div>
              )}
              {club.contact?.email && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">✉️</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {club.contact.email}
                  </span>
                </div>
              )}
              {club.contact?.website && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">🌐</span>
                  <a 
                    href={club.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {club.contact.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Caratteristiche
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {club.settings?.allowGuestBookings && (
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-sm font-medium text-green-800 dark:text-green-400">
                  Prenotazioni Ospiti
                </div>
              </div>
            )}
            {club.settings?.autoApproveAffiliations && (
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-sm font-medium text-blue-800 dark:text-blue-400">
                  Affiliazione Rapida
                </div>
              </div>
            )}
            {club.subscription?.type === 'premium' && (
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-sm font-medium text-purple-800 dark:text-purple-400">
                  Premium
                </div>
              </div>
            )}
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm font-medium text-gray-800 dark:text-gray-400">
                Tornei
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubPreview;