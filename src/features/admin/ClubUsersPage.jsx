// =============================================
// FILE: src/features/admin/ClubUsersPage.jsx
// Gestione utenti del circolo (nuovo sistema)
// =============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext.jsx';
import { 
  searchRegisteredUsers, 
  getClubUsers, 
  addUserToClub, 
  linkProfileToUser, 
  removeUserFromClub,
  updateClubUser 
} from '@services/club-users.js';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';

const UserSearchModal = ({ isOpen, onClose, onAddUser, onLinkUser, existingProfiles = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchRegisteredUsers(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (user) => {
    try {
      if (selectedProfile) {
        // Link to existing profile
        await onLinkUser(selectedProfile.id, user.uid);
      } else {
        // Add as new user
        await onAddUser(user.uid);
      }
      onClose();
    } catch (error) {
      console.error('Error adding/linking user:', error);
      alert('Errore durante l\'aggiunta dell\'utente');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Cerca Utenti Registrati
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Search Form */}
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per nome, email o telefono..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cerca...' : 'Cerca'}
            </button>
          </div>

          {/* Link to existing profile option */}
          {existingProfiles.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Collega a profilo esistente (opzionale):
              </label>
              <select
                value={selectedProfile?.id || ''}
                onChange={(e) => {
                  const profile = existingProfiles.find(p => p.id === e.target.value);
                  setSelectedProfile(profile || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Crea nuovo utente</option>
                {existingProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name || profile.displayName || 'Profilo senza nome'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Risultati ({searchResults.length})
            </h3>
            {searchResults.map(user => (
              <div key={user.uid} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utente senza nome'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">📧 {user.email}</p>
                    {user.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">📱 {user.phone}</p>
                    )}
                    {selectedProfile && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        Verrà collegato a: {selectedProfile.name || selectedProfile.displayName}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddUser(user)}
                    className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {selectedProfile ? 'Collega' : 'Aggiungi'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && searchTerm && !loading && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nessun utente trovato per "{searchTerm}"
          </p>
        )}
      </div>
    </div>
  );
};

const ClubUserCard = ({ user, onEdit, onRemove }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user.userName || 'Utente senza nome'}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
              {user.status === 'active' ? 'Attivo' : 'Inattivo'}
            </span>
            {user.isLinked && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Collegato
              </span>
            )}
          </div>
          
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>📧 {user.userEmail || 'Email non disponibile'}</p>
            {user.userPhone && <p>📱 {user.userPhone}</p>}
            <p>🎯 Ruolo: {user.role === 'player' ? 'Giocatore' : user.role}</p>
            {user.mergedData?.rating && (
              <p>⭐ Rating: {user.mergedData.rating}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(user)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            title="Modifica"
          >
            ✏️ Modifica
          </button>
          <button
            onClick={() => onRemove(user)}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
            title="Rimuovi"
          >
            🗑️ Rimuovi
          </button>
        </div>
      </div>
    </div>
  );
};

const ClubUsersPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isClubAdmin } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [existingProfiles, setExistingProfiles] = useState([]);

  // Check permissions
  useEffect(() => {
    if (!isClubAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [isClubAdmin, navigate]);

  // Load club users
  useEffect(() => {
    if (!clubId) return;
    
    loadClubUsers();
  }, [clubId]);

  const loadClubUsers = async () => {
    setLoading(true);
    try {
      const clubUsers = await getClubUsers(clubId);
      setUsers(clubUsers);
    } catch (error) {
      console.error('Error loading club users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userId) => {
    try {
      await addUserToClub(clubId, userId, {
        addedBy: currentUser?.uid
      });
      
      // Reload users
      await loadClubUsers();
      
      console.log('✅ User added to club');
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const handleLinkUser = async (existingProfileId, registeredUserId) => {
    try {
      await linkProfileToUser(clubId, existingProfileId, registeredUserId);
      
      // Reload users
      await loadClubUsers();
      
      console.log('✅ User linked to existing profile');
    } catch (error) {
      console.error('Error linking user:', error);
      throw error;
    }
  };

  const handleRemoveUser = async (user) => {
    if (!confirm(`Sei sicuro di voler rimuovere ${user.userName} dal club?`)) return;
    
    try {
      await removeUserFromClub(clubId, user.id);
      
      // Reload users
      await loadClubUsers();
      
      console.log('✅ User removed from club');
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Errore durante la rimozione dell\'utente');
    }
  };

  const handleEditUser = (user) => {
    // TODO: Implement edit user modal
    console.log('Edit user:', user);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestione Utenti Club
        </h1>
        <button
          onClick={() => setShowSearchModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Aggiungi Utente
        </button>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Nessun utente nel club
          </p>
          <button
            onClick={() => setShowSearchModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Aggiungi il primo utente
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {users.length} utent{users.length === 1 ? 'e' : 'i'} nel club
          </p>
          
          {users.map(user => (
            <ClubUserCard
              key={user.id}
              user={user}
              onEdit={handleEditUser}
              onRemove={handleRemoveUser}
            />
          ))}
        </div>
      )}

      {/* Search Modal */}
      <UserSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onAddUser={handleAddUser}
        onLinkUser={handleLinkUser}
        existingProfiles={existingProfiles}
      />
    </div>
  );
};

export default ClubUsersPage;