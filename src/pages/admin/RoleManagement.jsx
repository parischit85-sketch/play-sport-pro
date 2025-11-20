/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, functions } from '../../services/firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  Shield,
  UserCog,
  ChevronLeft,
  Search,
  CheckCircle,
  AlertCircle,
  Crown,
  Users,
} from 'lucide-react';
import { logAdminAction } from '../../services/auditService.js';

const RoleManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState(null);

  const ROLES = [
    { value: 'admin', label: 'Super Admin', icon: Crown, color: 'text-purple-600 bg-purple-50' },
    { value: 'club_admin', label: 'Club Admin', icon: Shield, color: 'text-blue-600 bg-blue-50' },
    { value: 'instructor', label: 'Istruttore', icon: UserCog, color: 'text-green-600 bg-green-50' },
    { value: 'user', label: 'Utente', icon: Users, color: 'text-gray-600 bg-gray-50' },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedRole, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Errore caricamento utenti:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId, newRole, userEmail) => {
    if (!window.confirm(`Confermi di voler cambiare il ruolo a ${newRole}?`)) {
      return;
    }

    try {
      setUpdating(userId);
      setMessage(null);

      // Call Cloud Function to update role
      const setUserRole = httpsCallable(functions, 'setUserRole');
      await setUserRole({
        userId,
        role: newRole,
      });

      // Update local state
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      );

      // Log the action
      await logAdminAction({
        action: 'role_change',
        targetType: 'user',
        targetId: userId,
        metadata: {
          userEmail,
          newRole,
          previousRole: users.find((u) => u.id === userId)?.role,
        },
      });

      setMessage({
        type: 'success',
        text: 'Ruolo aggiornato con successo',
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Errore aggiornamento ruolo:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Errore durante l\'aggiornamento del ruolo',
      });
    } finally {
      setUpdating(null);
    }
  };

  const getRoleInfo = (role) => {
    return ROLES.find((r) => r.value === role) || ROLES[3];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Gestione Ruoli</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cerca Utente</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Email, nome o ID utente..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtra per Ruolo</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tutti i ruoli</option>
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Utenti ({filteredUsers.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Caricamento utenti...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nessun utente trovato</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ruolo Attuale
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cambia Ruolo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ultima Modifica
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    const RoleIcon = roleInfo.icon;

                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              {user.photoURL ? (
                                <img
                                  src={user.photoURL}
                                  alt={user.displayName}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <span className="text-gray-600 font-medium">
                                  {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.displayName || 'Senza nome'}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${roleInfo.color}`}>
                            <RoleIcon className="w-4 h-4" />
                            <span className="text-xs font-medium">{roleInfo.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role || 'user'}
                            onChange={(e) => handleRoleChange(user.id, e.target.value, user.email)}
                            disabled={updating === user.id}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {ROLES.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.updatedAt?.toDate
                            ? new Date(user.updatedAt.toDate()).toLocaleDateString('it-IT')
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Role Descriptions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <div key={role.value} className="bg-white rounded-xl shadow-lg p-6">
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${role.color} mb-3`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{role.label}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {role.value === 'admin' && 'Accesso completo a tutte le funzionalità di amministrazione'}
                  {role.value === 'club_admin' && 'Gestione di un circolo specifico e dei suoi utenti'}
                  {role.value === 'instructor' && 'Gestione lezioni e prenotazioni del circolo'}
                  {role.value === 'user' && 'Accesso base alle funzionalità dell\'app'}
                </p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default RoleManagement;
