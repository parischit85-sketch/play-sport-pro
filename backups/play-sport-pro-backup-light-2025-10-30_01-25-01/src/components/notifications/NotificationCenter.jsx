/**
 * NotificationCenter Component
 * Main notification panel with tabs, filters, and batch actions
 *
 * Features:
 * - Real-time notification updates
 * - Category tabs (All, Booking, System, Promo, Social)
 * - Mark all as read
 * - Delete all notifications
 * - Infinite scroll / pagination
 * - Empty states
 * - Loading states
 */

import { useState, useEffect } from 'react';
import { useNotifications } from '@contexts/NotificationContext';
import { Bell, CheckCheck, Trash2, Calendar, Settings, Gift, MessageCircle, X } from 'lucide-react';
import notificationService, { NOTIFICATION_CATEGORIES } from '@services/notificationService';
import { useAuth } from '@context/AuthContext';
import NotificationItem from './NotificationItem';

const NotificationCenter = ({ isOpen = false, onClose, maxHeight = '600px' }) => {
  const { confirm } = useNotifications();
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // Category tabs configuration
  const tabs = [
    { id: 'all', label: 'Tutte', icon: Bell, category: null },
    {
      id: 'booking',
      label: 'Prenotazioni',
      icon: Calendar,
      category: NOTIFICATION_CATEGORIES.BOOKING,
    },
    { id: 'system', label: 'Sistema', icon: Settings, category: NOTIFICATION_CATEGORIES.SYSTEM },
    { id: 'promo', label: 'Offerte', icon: Gift, category: NOTIFICATION_CATEGORIES.PROMO },
    {
      id: 'social',
      label: 'Social',
      icon: MessageCircle,
      category: NOTIFICATION_CATEGORIES.SOCIAL,
    },
  ];

  const activeTabConfig = tabs.find((t) => t.id === activeTab);

  useEffect(() => {
    if (!currentUser?.uid || !isOpen) {
      return;
    }

    setLoading(true);

    // Subscribe to notifications with optional category filter
    const unsubscribe = notificationService.subscribeToNotifications(
      currentUser.uid,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
        setLoading(false);
      },
      {
        category: activeTabConfig?.category,
        maxCount: 50, // Limit to 50 notifications
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid, activeTab, isOpen]);

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.uid) return;

    setMarkingAllRead(true);
    try {
      await notificationService.markAllAsRead(currentUser.uid);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!currentUser?.uid) return;

    const confirmed = await confirm({
      title: 'Elimina Tutte',
      message:
        'Sei sicuro di voler eliminare tutte le notifiche? Questa azione non può essere annullata.',
      variant: 'danger',
      confirmText: 'Elimina Tutte',
      cancelText: 'Annulla',
    });

    if (!confirmed) return;

    setDeletingAll(true);
    try {
      await notificationService.deleteAllNotifications(currentUser.uid);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    } finally {
      setDeletingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white bg-gray-900 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell size={24} className="text-blue-600 text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 text-white">Notifiche</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:text-gray-300 rounded-lg hover:bg-gray-100 hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAllRead || unreadCount === 0}
                className="
                  flex-1 flex items-center justify-center gap-2
                  px-3 py-2 text-sm font-medium
                  text-blue-600 text-blue-400
                  bg-blue-50 bg-blue-900
                  rounded-lg
                  hover:bg-blue-100 hover:bg-blue-800
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                <CheckCheck size={16} />
                <span>Segna tutte lette</span>
              </button>

              <button
                onClick={handleDeleteAll}
                disabled={deletingAll || notifications.length === 0}
                className="
                  flex-1 flex items-center justify-center gap-2
                  px-3 py-2 text-sm font-medium
                  text-red-600 text-red-400
                  bg-red-50 bg-red-900
                  rounded-lg
                  hover:bg-red-100 hover:bg-red-800
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                <Trash2 size={16} />
                <span>Elimina tutte</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-shrink-0 px-6 py-3 border-b border-gray-200 border-gray-700 overflow-x-auto">
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const count = tab.category
                  ? notifications.filter((n) => n.category === tab.category).length
                  : notifications.length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg
                      text-sm font-medium whitespace-nowrap
                      transition-colors
                      ${
                        activeTab === tab.id
                          ? 'bg-blue-100 bg-blue-900 text-blue-600 text-blue-300'
                          : 'text-gray-600 text-gray-400 hover:bg-gray-100 hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span
                        className={`
                        px-1.5 py-0.5 text-xs font-bold rounded-full
                        ${
                          activeTab === tab.id
                            ? 'bg-blue-600 bg-blue-600 text-white'
                            : 'bg-gray-200 bg-gray-700 text-gray-600 text-gray-300'
                        }
                      `}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight }}>
            {loading ? (
              // Loading State
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-500 text-gray-400">Caricamento notifiche...</p>
              </div>
            ) : notifications.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-12">
                <Bell size={48} className="text-gray-300 text-gray-600 mb-4" />
                <p className="text-lg font-medium text-gray-900 text-white mb-2">
                  Nessuna notifica
                </p>
                <p className="text-gray-500 text-gray-400 text-center">
                  {activeTab === 'all'
                    ? 'Non hai ancora ricevuto notifiche.'
                    : `Non hai notifiche nella categoria "${activeTabConfig?.label}".`}
                </p>
              </div>
            ) : (
              // Notifications
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;

