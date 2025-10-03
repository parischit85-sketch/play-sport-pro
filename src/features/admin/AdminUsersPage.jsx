// =============================================
// FILE: src/features/admin/AdminUsersPage.jsx
// =============================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, USER_ROLES } from '@contexts/AuthContext.jsx';
import UserManagement from './UserManagement.jsx';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  if (userRole !== USER_ROLES.SUPER_ADMIN) {
    navigate('/');
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Gestione Utenti
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserManagement />
      </div>
    </div>
  );
};

export default AdminUsersPage;