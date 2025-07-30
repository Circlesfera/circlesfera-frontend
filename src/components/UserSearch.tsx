import React, { useState } from 'react';
import { searchUsers, UserSearchResult } from '@/services/exploreService';
import Link from 'next/link';

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    if (query.trim()) {
      const users = await searchUsers(query.trim());
      setResults(users);
    }
    setLoading(false);
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Buscar usuarios..."
          className="flex-1 px-3 py-2 border rounded focus:outline-none"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loading}>
          Buscar
        </button>
      </form>
      {loading && <div className="text-gray-400 text-sm">Buscando...</div>}
      {results.length > 0 && (
        <ul className="flex flex-col gap-2">
          {results.map(u => (
            <li key={u._id}>
              <Link href={`/${u.username}`} className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded">
                {u.avatar ? (
                  <img src={u.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                    {u.username[0].toUpperCase()}
                  </span>
                )}
                <span className="font-semibold">{u.username}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
