// =============================================
// FILE: src/features/admin/AdminPushNotificationsPanel.jsx
// DESCRIPTION: Admin section for managing and testing push notifications
// =============================================

import React, { useState } from 'react';
import NativePushTestPanel from '@components/debug/NativePushTestPanel.jsx';

/**
 * Admin Panel for Push Notifications Management
 * Shows testing panel and provides quick access to notification tools
 */
const AdminPushNotificationsPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Push Notifications
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Test and monitor native push notifications (Android/iOS)
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                   font-medium transition-colors flex items-center gap-2"
        >
          {isExpanded ? '▲ Nascondi' : '▼ Mostra'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <NativePushTestPanel />
        </div>
      )}

      {!isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📱</span>
              <span className="font-semibold text-blue-900 dark:text-blue-400">Native Push</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">Android FCM + iOS APNs</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🌐</span>
              <span className="font-semibold text-green-900 dark:text-green-400">Web Push</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Desktop VAPID (Chrome/Firefox)
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📊</span>
              <span className="font-semibold text-purple-900 dark:text-purple-400">Analytics</span>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">Delivery & CTR tracking</p>
          </div>
        </div>
      )}

      <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="font-semibold text-yellow-900 dark:text-yellow-400 mb-1">Quick Tips</p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Test panel available for superadmin users only</li>
              <li>• Android requires APK build for native push testing</li>
              <li>• iOS requires Apple Developer Account ($99/year)</li>
              <li>• Web push works on desktop browsers (Chrome, Firefox, Edge)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPushNotificationsPanel;
