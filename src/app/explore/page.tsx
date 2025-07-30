import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/features/auth/useAuth';

export default function ExplorePage() {
  const { user } = useAuth();
  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">Explorar como {user?.username}</h1>
        <p className="text-gray-600">Aquí podrás descubrir nuevos posts y usuarios.</p>
      </div>
    </ProtectedRoute>
  );
}
