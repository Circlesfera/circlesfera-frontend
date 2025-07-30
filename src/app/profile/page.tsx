import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/features/auth/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">Perfil de {user?.username}</h1>
        <p className="text-gray-600">Aquí irá la información del perfil.</p>
      </div>
    </ProtectedRoute>
  );
}
