import React, { useEffect, useState } from 'react';
import { getSuggestions, UserSuggestion } from '@/services/userService';
import { useAuth } from '@/features/auth/useAuth';
import FollowButton from './FollowButton';

export default function UserSuggestions() {
  const { token, user } = useAuth();
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getSuggestions(token).then(data => {
      setSuggestions(data);
      setLoading(false);
    });
  }, [token]);

  if (!user) return null;

  return (
    <aside className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-8 w-full md:w-80">
      <h2 className="text-lg font-bold mb-4 text-[var(--accent)]">Sugerencias para ti</h2>
      {loading ? (
        <div className="text-gray-400 text-sm">Cargando sugerencias...</div>
      ) : suggestions.length === 0 ? (
        <div className="text-gray-400 text-sm">No hay sugerencias por ahora.</div>
      ) : (
        <ul className="flex flex-col gap-4">
          {suggestions.map(s => (
            <li key={s._id} className="flex items-center gap-3">
              {s.avatar ? (
                <img src={s.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[var(--accent)] shadow-sm" />
              ) : (
                <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent)] to-blue-400 flex items-center justify-center font-bold text-white text-lg border-2 border-white shadow-sm">
                  {s.username[0].toUpperCase()}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 truncate">{s.username}</div>
                {s.bio && <div className="text-xs text-gray-500 truncate">{s.bio}</div>}
              </div>
              <FollowButton userId={s._id} initialFollowing={false} onChange={() => setSuggestions(suggestions.filter(u => u._id !== s._id))} />
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}