import ProtectedRoute from '@/components/ProtectedRoute';
import NotificationList from '@/components/NotificationList';

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Notificaciones</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Mantente al día con la actividad de tu cuenta</p>
        </div>
        <NotificationList />
      </div>
    </ProtectedRoute>
  );
}
