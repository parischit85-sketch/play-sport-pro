// =============================================
// FILE: src/features/admin/UserManagement.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';
import { listAllUserProfiles } from '@services/auth.jsx';
import { setUserClubRole, removeUserClubRole } from '@services/clubs.js';
import { getClubsForAdmin } from '@services/admin.js';
import { USER_ROLES } from '@contexts/AuthContext.jsx';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, clubsData] = await Promise.all([listAllUserProfiles(), getClubsForAdmin()]);

      setUsers(usersData);
      setClubs(clubsData);
    } catch (error) {
      console.error('Error loading user management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetRole = async (userId, clubId, role) => {
    try {
      await setUserClubRole(userId, clubId, role);
      // Refresh user data
      await loadData();
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error setting user role:', error);
      alert("Errore nell'assegnazione del ruolo");
    }
  };

  const handleRemoveRole = async (userId, clubId) => {
    try {
      await removeUserClubRole(userId, clubId);
      // Refresh user data
      await loadData();
    } catch (error) {
      console.error('Error removing user role:', error);
      alert('Errore nella rimozione del ruolo');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 text-white">
            Gestione Utenti ({users.length})
          </h2>
          <p className="text-sm text-gray-600 text-gray-400 mt-1">
            Promuovi utenti ad amministratori di circolo o istruttori
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-gray-400 uppercase tracking-wider">
                  Utente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-gray-400 uppercase tracking-wider">
                  Telefono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-gray-400 uppercase tracking-wider">
                  Ruoli
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-gray-400 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white bg-gray-800 divide-y divide-gray-200 divide-gray-700">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50 hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar ? (
                          <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 bg-gray-600 flex items-center justify-center">
                            <span className="text-gray-600 text-gray-400 text-sm font-medium">
                              {(user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500 text-gray-400">
                          ID: {user.uid.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-white">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-white">
                    {user.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {user.role === 'ADMIN' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 bg-purple-900 text-purple-200">
                          System Admin
                        </span>
                      )}
                      {/* TODO: Show club-specific roles */}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.role !== 'ADMIN' && (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 text-blue-400 hover:text-blue-300"
                      >
                        Gestisci Ruoli
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Management Modal */}
      {showRoleModal && selectedUser && (
        <RoleManagementModal
          user={selectedUser}
          clubs={clubs}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
          onSetRole={handleSetRole}
          onRemoveRole={handleRemoveRole}
        />
      )}
    </div>
  );
};

const RoleManagementModal = ({ user, clubs, onClose, onSetRole, onRemoveRole }) => {
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClub || !selectedRole) return;

    onSetRole(user.uid, selectedClub, selectedRole);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 text-white">
            Gestisci Ruoli - {user.firstName} {user.lastName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
              Circolo
            </label>
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              required
            >
              <option value="">Seleziona un circolo</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
              Ruolo
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              required
            >
              <option value="">Seleziona un ruolo</option>
              <option value={USER_ROLES.CLUB_ADMIN}>Amministratore di Circolo</option>
              <option value={USER_ROLES.INSTRUCTOR}>Istruttore</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Assegna Ruolo
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 bg-gray-600 text-gray-700 text-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 hover:bg-gray-500 transition-colors"
            >
              Annulla
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 text-gray-300 mb-2">Ruoli Attuali</h4>
          <div className="text-sm text-gray-600 text-gray-400">
            {/* TODO: Display current user roles */}
            Implementazione in corso...
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
