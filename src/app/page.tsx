import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/features/auth/useAuth';

export default function FeedPage() {
  const { user } = useAuth();
  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">¡Bienvenido, {user?.username}!</h1>
        <p className="text-gray-600">Este es tu feed privado de CircleSfera.</p>
      </div>
    </ProtectedRoute>
  );
}
