// =============================================
// FILE: src/features/admin/AdminClubDetailPage.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext.jsx';
import { getClub, deleteClub } from '@services/clubs.js';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';

const AdminClubDetailPage = () => {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const { userRole, USER_ROLES } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState(null);

  useEffect(() => {
    if (userRole !== USER_ROLES.SUPER_ADMIN) {
      navigate('/');
      return;
    }

    loadClub();
  }, [userRole, clubId, navigate]);

  const loadClub = async () => {
    try {
      setLoading(true);
      const clubData = await getClub(clubId);
      setClub(clubData);
    } catch (error) {
      console.error('Error loading club:', error);
      alert('Errore nel caricamento del club');
      navigate('/admin/clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/clubs/${clubId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo club? Questa azione non può essere annullata.')) {
      return;
    }

    try {
      await deleteClub(clubId);
      alert('Club eliminato con successo');
      navigate('/admin/clubs');
    } catch (error) {
      console.error('Error deleting club:', error);
      alert('Errore durante l\'eliminazione del club');
    }
  };

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

  if (userRole !== USER_ROLES.ADMIN) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Club non trovato
          </h2>
          <button
            onClick={() => navigate('/admin/clubs')}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Torna alla gestione club
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/clubs')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Gestione Club
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Dettagli Club
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Modifica
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {club.name}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(club.status)}`}>
                  {getStatusText(club.status)}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                ID: {club.id}
              </div>
            </div>
            
            {club.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                {club.description}
              </p>
            )}
          </div>

          {/* Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Statistiche
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {club.stats?.totalMembers || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Membri Totali
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {club.stats?.totalCourts || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Campi
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {club.stats?.monthlyBookings || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Prenotazioni/Mese
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          {(club.location?.address || club.location?.city) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📍 Localizzazione
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                {club.location.address && (
                  <div>
                    <span className="font-medium">Indirizzo:</span> {club.location.address}
                  </div>
                )}
                {club.location.city && (
                  <div>
                    <span className="font-medium">Città:</span> {club.location.city}
                  </div>
                )}
                {club.location.region && (
                  <div>
                    <span className="font-medium">Regione:</span> {club.location.region}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact */}
          {(club.contact?.email || club.contact?.phone || club.contact?.website) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📞 Contatti
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                {club.contact.email && (
                  <div>
                    <span className="font-medium">Email:</span> 
                    <a href={`mailto:${club.contact.email}`} className="text-blue-600 dark:text-blue-400 ml-2">
                      {club.contact.email}
                    </a>
                  </div>
                )}
                {club.contact.phone && (
                  <div>
                    <span className="font-medium">Telefono:</span> 
                    <a href={`tel:${club.contact.phone}`} className="text-blue-600 dark:text-blue-400 ml-2">
                      {club.contact.phone}
                    </a>
                  </div>
                )}
                {club.contact.website && (
                  <div>
                    <span className="font-medium">Sito Web:</span> 
                    <a 
                      href={club.contact.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 ml-2"
                    >
                      {club.contact.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ⚙️ Impostazioni
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Prenotazioni pubbliche:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  club.settings?.allowPublicBookings 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {club.settings?.allowPublicBookings ? 'Abilitate' : 'Disabilitate'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Approvazione richiesta:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  club.settings?.requireApproval 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {club.settings?.requireApproval ? 'Sì' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Max prenotazioni per utente:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm">
                  {club.settings?.maxBookingsPerUser || 10}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📅 Informazioni Temporali
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">Creato il:</span><br />
                {new Date(club.createdAt).toLocaleString('it-IT')}
              </div>
              {club.updatedAt && (
                <div>
                  <span className="font-medium">Ultimo aggiornamento:</span><br />
                  {new Date(club.updatedAt).toLocaleString('it-IT')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClubDetailPage;