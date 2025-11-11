/**
 * Example: How to integrate NativePushTestPanel into your app
 * 
 * This file shows different integration options for the native push test panel
 */

// ============================================
// Option 1: Add to User Profile Page
// ============================================
// File: src/pages/ProfilePage.jsx or similar

import NativePushTestPanel from '@/components/debug/NativePushTestPanel';

function ProfilePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Profilo</h1>
      
      {/* Existing profile content */}
      <ProfileInfo />
      
      {/* Add Native Push Panel */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Notifiche Push</h2>
        <NativePushTestPanel />
      </div>
    </div>
  );
}

// ============================================
// Option 2: Add as Tab in Settings
// ============================================
// File: src/pages/SettingsPage.jsx

import { useState } from 'react';
import NativePushTestPanel from '@/components/debug/NativePushTestPanel';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('general')}
          className={activeTab === 'general' ? 'active' : ''}
        >
          Generale
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          className={activeTab === 'notifications' ? 'active' : ''}
        >
          Notifiche
        </button>
      </div>

      {activeTab === 'general' && <GeneralSettings />}
      {activeTab === 'notifications' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Configurazione Notifiche</h2>
          <NativePushTestPanel />
        </div>
      )}
    </div>
  );
}

// ============================================
// Option 3: Admin Dashboard Integration
// ============================================
// File: src/features/admin/AdminDashboard.jsx

import NativePushTestPanel from '@/components/debug/NativePushTestPanel';
import AdminAnnouncements from '@/features/admin/AdminAnnouncements';

function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Left Column: Send Announcements */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Invia Annunci</h2>
        <AdminAnnouncements />
      </div>

      {/* Right Column: Test & Monitor */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Test & Monitoring</h2>
        <NativePushTestPanel />
        
        {/* Optional: Add push analytics dashboard here */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Analytics Globali</h3>
          <PushAnalyticsDashboard />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Option 4: Standalone Debug Page (Development Only)
// ============================================
// File: src/pages/DebugPage.jsx

import { useAuth } from '@contexts/AuthContext';
import NativePushTestPanel from '@/components/debug/NativePushTestPanel';
import PushNotificationPanel from '@/components/debug/PushNotificationPanel';

function DebugPage() {
  const { user, isAdmin } = useAuth();

  // Only show in development or for admins
  if (import.meta.env.PROD && !isAdmin) {
    return <div>Access Denied</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🔧 Debug Tools</h1>
      
      <div className="space-y-6">
        {/* Native Push Panel */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Native Push Notifications</h2>
          <p className="text-sm text-gray-600 mb-4">
            Test and monitor native push (FCM/APNs) for Android and iOS
          </p>
          <NativePushTestPanel />
        </section>

        {/* Web Push Panel (existing) */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Web Push Notifications</h2>
          <p className="text-sm text-gray-600 mb-4">
            Test and monitor web push (VAPID) for desktop browsers
          </p>
          <PushNotificationPanel />
        </section>
      </div>
    </div>
  );
}

// Add route in your router
// File: src/App.jsx or routes.jsx
/*
import DebugPage from '@/pages/DebugPage';

// In routes array:
{
  path: '/debug',
  element: <DebugPage />,
  // Optional: protect route
  // loader: requireAuth,
}
*/

// ============================================
// Option 5: Modal/Drawer Integration
// ============================================
// For apps with limited space or mobile-first design

import { useState } from 'react';
import { Button } from '@ui/button';
import { Dialog, DialogContent } from '@ui/dialog';
import NativePushTestPanel from '@/components/debug/NativePushTestPanel';

function NotificationSettings() {
  const [showTestPanel, setShowTestPanel] = useState(false);

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Notifiche Push</h3>
      <p className="text-sm text-gray-600 mb-4">
        Gestisci le tue preferenze di notifica
      </p>

      <Button onClick={() => setShowTestPanel(true)}>
        🧪 Test & Diagnostica
      </Button>

      <Dialog open={showTestPanel} onOpenChange={setShowTestPanel}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <NativePushTestPanel />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// Option 6: Conditional Rendering (Beta Users Only)
// ============================================

import { useAuth } from '@contexts/AuthContext';
import NativePushTestPanel from '@/components/debug/NativePushTestPanel';

function SettingsNotifications() {
  const { user } = useAuth();
  
  // Check if user is beta tester
  const isBetaTester = user?.roles?.includes('beta_tester') || user?.email?.includes('@playsport.pro');

  return (
    <div>
      <h2>Notifiche</h2>
      
      {/* Standard notification settings */}
      <NotificationPreferences />

      {/* Advanced panel only for beta testers */}
      {isBetaTester && (
        <div className="mt-6 p-4 border-2 border-dashed border-blue-300 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🧪</span>
            <h3 className="text-lg font-semibold">Beta Features</h3>
            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">BETA</span>
          </div>
          <NativePushTestPanel />
        </div>
      )}
    </div>
  );
}

// ============================================
// Recommended Integration Path
// ============================================

/**
 * 1. DEVELOPMENT PHASE:
 *    - Add to /debug page (Option 4)
 *    - Test thoroughly with team
 * 
 * 2. BETA TESTING:
 *    - Add to user profile with beta flag (Option 6)
 *    - Collect feedback from beta users
 * 
 * 3. PRODUCTION:
 *    - Move to Settings > Notifications tab (Option 2)
 *    - Add admin version to Admin Dashboard (Option 3)
 *    - Keep debug page for super admins only
 * 
 * 4. MAINTENANCE:
 *    - Monitor statistics from panel
 *    - Use diagnostics to troubleshoot user issues
 *    - Track platform distribution and delivery rates
 */

export {
  // Export for easy import
  NativePushTestPanel,
};
