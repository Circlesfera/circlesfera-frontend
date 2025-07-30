import ProtectedRoute from '@/components/ProtectedRoute';
import UserSearch from '@/components/UserSearch';
import ExploreGrid from '@/components/ExploreGrid';

export default function ExplorePage() {
  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto mt-8">
        <UserSearch />
        <ExploreGrid />
      </div>
    </ProtectedRoute>
  );
}
