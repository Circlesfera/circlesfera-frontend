'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { searchUsers, type PublicProfile } from '@/services/api/users';
import { searchHashtags, getTrendingHashtags, type Hashtag } from '@/services/api/hashtags';

export function SearchBar(): ReactElement {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const hasQuery = query.trim().length >= 2;

  // Búsqueda de usuarios
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['search', 'users', query],
    queryFn: () => searchUsers({ q: query, limit: 5 }),
    enabled: hasQuery,
    staleTime: 30000
  });

  // Búsqueda de hashtags
  const { data: hashtagsData, isLoading: isLoadingHashtags } = useQuery({
    queryKey: ['search', 'hashtags', query],
    queryFn: () => searchHashtags(query, 5),
    enabled: hasQuery,
    staleTime: 30000
  });

  const hashtags = hashtagsData?.hashtags ?? [];

  // Trending hashtags (cuando no hay query)
  const { data: trendingData } = useQuery({
    queryKey: ['hashtags', 'trending'],
    queryFn: () => getTrendingHashtags(10),
    enabled: showTrending && !hasQuery,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  const trendingHashtags = trendingData?.hashtags ?? [];

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
    const hasValue = value.trim().length >= 2;
    setIsOpen(hasValue || showTrending);
    setShowTrending(!hasValue);
  };

  const handleItemClick = (): void => {
    setQuery('');
    setIsOpen(false);
    setShowTrending(false);
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
              setShowTrending(false);
            } else {
              setShowTrending(true);
              setIsOpen(true);
            }
          }}
          placeholder="Buscar usuarios, hashtags..."
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

      {isOpen ? (
        <div className="absolute top-full z-50 mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-md shadow-xl">
          {showTrending && !hasQuery ? (
            // Mostrar trending hashtags cuando no hay query
            <div className="max-h-96 overflow-y-auto">
              <div className="border-b border-white/10 px-4 py-3">
                <h3 className="text-sm font-semibold text-white">Trending</h3>
              </div>
              {trendingHashtags.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">No hay hashtags trending</div>
              ) : (
                trendingHashtags.map((hashtag: Hashtag) => (
                  <Link
                    key={hashtag.id}
                    href={`/hashtags/${hashtag.tag}`}
                    onClick={handleItemClick}
                    className="flex items-center gap-3 border-b border-white/5 px-4 py-3 transition hover:bg-white/5 last:border-b-0"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary-500/20">
                      <svg className="size-5 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.5 2h9a5.5 5.5 0 010 11h-9a5.5 5.5 0 010-11z" />
                      </svg>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate font-medium text-white">#{hashtag.tag}</div>
                      <div className="truncate text-sm text-slate-400">
                        {hashtag.postCount.toLocaleString('es')} publicaciones
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          ) : hasQuery ? (
            // Mostrar resultados de búsqueda
            <div className="max-h-96 overflow-y-auto">
              {isLoadingUsers || isLoadingHashtags ? (
                <div className="p-6 text-center text-sm text-slate-400">Buscando...</div>
              ) : users.length === 0 && hashtags.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">No se encontraron resultados</div>
              ) : (
                <>
                  {users.length > 0 && (
                    <>
                      <div className="border-b border-white/10 px-4 py-3">
                        <h3 className="text-sm font-semibold text-white">Usuarios</h3>
                      </div>
                      {users.map((user: PublicProfile) => (
                        <Link
                          key={user.id}
                          href={`/${user.handle}`}
                          onClick={handleItemClick}
                          className="flex items-center gap-3 border-b border-white/5 px-4 py-3 transition hover:bg-white/5"
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
                    </>
                  )}

                  {hashtags.length > 0 && (
                    <>
                      <div className="border-b border-white/10 px-4 py-3">
                        <h3 className="text-sm font-semibold text-white">Hashtags</h3>
                      </div>
                      {hashtags.map((hashtag: Hashtag) => (
                        <Link
                          key={hashtag.id}
                          href={`/hashtags/${hashtag.tag}`}
                          onClick={handleItemClick}
                          className="flex items-center gap-3 border-b border-white/5 px-4 py-3 transition hover:bg-white/5 last:border-b-0"
                        >
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary-500/20">
                            <svg className="size-5 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M7.5 2h9a5.5 5.5 0 010 11h-9a5.5 5.5 0 010-11z" />
                            </svg>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="truncate font-medium text-white">#{hashtag.tag}</div>
                            <div className="truncate text-sm text-slate-400">
                              {hashtag.postCount.toLocaleString('es')} publicaciones
                            </div>
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

