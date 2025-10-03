// =============================================
// FILE: src/features/admin/AdminClubEditPage.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext.jsx';
import { createClub, updateClub, getClub } from '@services/clubs.js';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';

const AdminClubEditPage = () => {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const { userRole, USER_ROLES } = useAuth();
  const isEditing = Boolean(clubId);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [club, setClub] = useState({
    name: '',
    description: '',
    status: 'approved',
    location: {
      address: '',
      city: '',
      region: '',
      coordinates: null,
    },
    contact: {
      email: '',
      phone: '',
      website: '',
    },
    settings: {
      allowPublicBookings: true,
      requireApproval: false,
      maxBookingsPerUser: 10,
    },
  });

  useEffect(() => {
    if (userRole !== USER_ROLES.ADMIN) {
      navigate('/');
      return;
    }

    if (isEditing) {
      loadClub();
    }
  }, [userRole, clubId, navigate, isEditing]);

  const loadClub = async () => {
    try {
      setLoading(true);
      const clubData = await getClub(clubId);
      setClub({
        ...club,
        ...clubData,
        location: {
          ...club.location,
          ...clubData.location,
        },
        contact: {
          ...club.contact,
          ...clubData.contact,
        },
        settings: {
          ...club.settings,
          ...clubData.settings,
        },
      });
    } catch (error) {
      console.error('Error loading club:', error);
      alert('Errore nel caricamento del club');
      navigate('/admin/clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value, section = null) => {
    if (section) {
      setClub((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setClub((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!club.name.trim()) {
      alert('Il nome del club è obbligatorio');
      return;
    }

    try {
      setSaving(true);

      const clubData = {
        ...club,
        name: club.name.trim(),
        updatedAt: new Date().toISOString(),
      };

      if (isEditing) {
        await updateClub(clubId, clubData);
        alert('Club aggiornato con successo!');
      } else {
        clubData.createdAt = new Date().toISOString();
        await createClub(clubData);
        alert('Club creato con successo!');
      }

      navigate('/admin/clubs');
    } catch (error) {
      console.error('Error saving club:', error);
      alert('Errore nel salvataggio del club: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/clubs');
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
                {isEditing ? 'Modifica Club' : 'Nuovo Club'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informazioni Base
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome Club *
                </label>
                <input
                  type="text"
                  value={club.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Nome del club"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrizione
                </label>
                <textarea
                  value={club.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Descrizione del club"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stato
                </label>
                <select
                  value={club.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Attivo</option>
                  <option value="suspended">Sospeso</option>
                  <option value="pending">In Attesa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Localizzazione
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Indirizzo
                </label>
                <input
                  type="text"
                  value={club.location.address}
                  onChange={(e) => handleInputChange('address', e.target.value, 'location')}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Via, numero civico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Città
                </label>
                <input
                  type="text"
                  value={club.location.city}
                  onChange={(e) => handleInputChange('city', e.target.value, 'location')}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Città"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Regione
                </label>
                <input
                  type="text"
                  value={club.location.region}
                  onChange={(e) => handleInputChange('region', e.target.value, 'location')}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Regione"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contatti</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={club.contact.email}
                  onChange={(e) => handleInputChange('email', e.target.value, 'contact')}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="email@club.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={club.contact.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value, 'contact')}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="+39 123 456 7890"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sito Web
                </label>
                <input
                  type="url"
                  value={club.contact.website}
                  onChange={(e) => handleInputChange('website', e.target.value, 'contact')}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://www.club.com"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Impostazioni
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowPublicBookings"
                  checked={club.settings.allowPublicBookings}
                  onChange={(e) =>
                    handleInputChange('allowPublicBookings', e.target.checked, 'settings')
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="allowPublicBookings"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Consenti prenotazioni pubbliche
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireApproval"
                  checked={club.settings.requireApproval}
                  onChange={(e) =>
                    handleInputChange('requireApproval', e.target.checked, 'settings')
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="requireApproval"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Richiedi approvazione per le prenotazioni
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max prenotazioni per utente
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={club.settings.maxBookingsPerUser}
                  onChange={(e) =>
                    handleInputChange('maxBookingsPerUser', parseInt(e.target.value), 'settings')
                  }
                  className="w-32 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annulla
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md flex items-center gap-2"
            >
              {saving && <LoadingSpinner size="sm" />}
              {saving ? 'Salvando...' : isEditing ? 'Aggiorna Club' : 'Crea Club'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminClubEditPage;
