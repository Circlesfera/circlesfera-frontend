"use client";
import { useUnreadNotifications } from '@/features/notifications/useUnreadNotifications';
import { BellIcon } from '@heroicons/react/24/outline';

interface NotificationBadgeProps {
  className?: string;
  onClick?: () => void;
}

export default function NotificationBadge({ className = '', onClick }: NotificationBadgeProps) {
  const unreadCount = useUnreadNotifications();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-colors ${className}`}
      aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} no leídas)` : ''}`}
    >
      <BellIcon className="h-6 w-6" />
      
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
