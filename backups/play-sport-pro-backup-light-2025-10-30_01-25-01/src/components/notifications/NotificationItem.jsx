/**
 * NotificationItem Component
 * Single notification card with actions
 *
 * Features:
 * - Category icon and color coding
 * - Read/unread visual states
 * - Mark as read/unread toggle
 * - Delete action
 * - Action button (optional)
 * - Relative timestamp
 */

import { useState } from 'react';
import {
  Calendar,
  Bell,
  Gift,
  MessageCircle,
  Check,
  X,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import notificationService, { NOTIFICATION_CATEGORIES } from '@services/notificationService';

const NotificationItem = ({ notification, onRead, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Category configurations
  const categoryConfig = {
    [NOTIFICATION_CATEGORIES.BOOKING]: {
      icon: Calendar,
      bgColor: 'bg-blue-100 bg-blue-900',
      iconColor: 'text-blue-600 text-blue-300',
      borderColor: 'border-blue-300 border-blue-700',
    },
    [NOTIFICATION_CATEGORIES.SYSTEM]: {
      icon: Bell,
      bgColor: 'bg-gray-100 bg-gray-700',
      iconColor: 'text-gray-600 text-gray-300',
      borderColor: 'border-gray-300 border-gray-600',
    },
    [NOTIFICATION_CATEGORIES.PROMO]: {
      icon: Gift,
      bgColor: 'bg-purple-100 bg-purple-900',
      iconColor: 'text-purple-600 text-purple-300',
      borderColor: 'border-purple-300 border-purple-700',
    },
    [NOTIFICATION_CATEGORIES.SOCIAL]: {
      icon: MessageCircle,
      bgColor: 'bg-green-100 bg-green-900',
      iconColor: 'text-green-600 text-green-300',
      borderColor: 'border-green-300 border-green-700',
    },
  };

  const config = categoryConfig[notification.category] || categoryConfig.system;
  const Icon = config.icon;

  const handleToggleRead = async () => {
    setIsUpdating(true);
    try {
      if (notification.read) {
        await notificationService.markAsUnread(notification.id);
      } else {
        await notificationService.markAsRead(notification.id);
      }
      onRead?.();
    } catch (error) {
      console.error('Error toggling read status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await notificationService.deleteNotification(notification.id);
      onDelete?.(notification.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
      setIsDeleting(false);
    }
  };

  const getTimeAgo = () => {
    if (!notification.createdAt) return '';

    try {
      return formatDistanceToNow(notification.createdAt, {
        addSuffix: true,
        locale: it,
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <div
      className={`
        relative
        p-4
        rounded-lg
        border-l-4
        ${config.borderColor}
        ${notification.read ? 'bg-gray-50 bg-gray-800' : 'bg-white bg-gray-750 shadow-md'}
        transition-all duration-300
        ${isDeleting ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
      `}
    >
      <div className="flex gap-3">
        {/* Category Icon */}
        <div
          className={`
          flex-shrink-0
          w-10 h-10
          rounded-full
          ${config.bgColor}
          flex items-center justify-center
        `}
        >
          <Icon size={20} className={config.iconColor} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={`
              text-sm font-semibold
              ${
                notification.read
                  ? 'text-gray-600 text-gray-400'
                  : 'text-gray-900 text-white'
              }
            `}
            >
              {notification.title}
            </h4>

            {!notification.read && (
              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>

          {/* Message */}
          <p
            className={`
            text-sm mb-2
            ${
              notification.read
                ? 'text-gray-500 text-gray-500'
                : 'text-gray-700 text-gray-300'
            }
          `}
          >
            {notification.message}
          </p>

          {/* Timestamp */}
          <p className="text-xs text-gray-400 text-gray-500">{getTimeAgo()}</p>

          {/* Action Button */}
          {notification.actionUrl && notification.actionLabel && (
            <a
              href={notification.actionUrl}
              className="
                inline-flex items-center gap-1
                mt-2 px-3 py-1.5
                text-xs font-medium
                text-blue-600 text-blue-400
                bg-blue-50 bg-blue-900
                rounded-md
                hover:bg-blue-100 hover:bg-blue-800
                transition-colors
              "
            >
              {notification.actionLabel}
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex flex-col gap-1">
          {/* Toggle Read/Unread */}
          <button
            onClick={handleToggleRead}
            disabled={isUpdating}
            className="
              p-1.5
              text-gray-400
              hover:text-blue-600 hover:text-blue-400
              hover:bg-blue-50 hover:bg-blue-900
              rounded
              transition-colors
              disabled:opacity-50
            "
            title={notification.read ? 'Segna come non letto' : 'Segna come letto'}
          >
            {notification.read ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="
              p-1.5
              text-gray-400
              hover:text-red-600 hover:text-red-400
              hover:bg-red-50 hover:bg-red-900
              rounded
              transition-colors
              disabled:opacity-50
            "
            title="Elimina notifica"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;

