'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { searchUsers, type PublicProfile } from '@/services/api/users';

export function SearchBar(): ReactElement {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['search', 'users', query],
    queryFn: () => searchUsers({ q: query, limit: 10 }),
    enabled: query.trim().length >= 2,
    staleTime: 30000
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (value: string): void => {
    setQuery(value);
    setIsOpen(value.trim().length >= 2);
  };

  const handleUserClick = (): void => {
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            handleInputChange(e.target.value);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          placeholder="Buscar usuarios..."
          className="w-full rounded-full border border-white/10 bg-slate-800/60 px-4 py-2 pl-10 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40"
        />
        <svg
          className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {isOpen && query.trim().length >= 2 ? (
        <div className="absolute top-full z-50 mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-md shadow-xl">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-slate-400">Buscando...</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400">No se encontraron usuarios</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {users.map((user: PublicProfile) => (
                <Link
                  key={user.id}
                  href={`/${user.handle}`}
                  onClick={handleUserClick}
                  className="flex items-center gap-3 border-b border-white/5 px-4 py-3 transition hover:bg-white/5 last:border-b-0"
                >
                  <Image
                    src={user.avatarUrl ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.handle}`}
                    alt={user.displayName}
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover"
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate font-medium text-white">{user.displayName}</div>
                    <div className="truncate text-sm text-slate-400">@{user.handle}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

