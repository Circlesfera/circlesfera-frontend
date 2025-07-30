"use client";

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
    <div className="mb-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Buscar usuarios..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-base shadow-sm"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" className="bg-[var(--accent)] text-white px-6 py-2 rounded-full font-semibold hover:bg-violet-700 transition-all shadow-md disabled:opacity-60" disabled={loading}>
          Buscar
        </button>
      </form>
      {loading && <div className="text-gray-400 text-sm">Buscando...</div>}
      {results.length > 0 && (
        <ul className="flex flex-col gap-2 mt-2">
          {results.map(u => (
            <li key={u._id}>
              <Link href={`/${u.username}`} className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors">
                {u.avatar ? (
                  <img src={u.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-[var(--accent)] shadow-sm" />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--accent)] to-blue-400 flex items-center justify-center font-bold text-white text-lg border-2 border-white shadow-sm">
                    {u.username[0].toUpperCase()}
                  </span>
                )}
                <span className="font-semibold text-gray-800">{u.username}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
