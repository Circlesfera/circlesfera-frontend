import ProtectedRoute from '@/components/ProtectedRoute';
import NotificationList from '@/components/NotificationList';

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationList />
    </ProtectedRoute>
  );
}
