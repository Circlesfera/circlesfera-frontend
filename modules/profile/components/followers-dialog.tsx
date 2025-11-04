'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
// Icono X inline
const XIcon = () => (
  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

import { getAvatarUrl } from '@/lib/image-utils';
import { apiClient } from '@/services/api/client';
import type { PublicProfile } from '@/services/api/users';

interface FollowersDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly handle: string;
  readonly type: 'followers' | 'following';
}

interface FollowersResponse {
  users: Array<PublicProfile & { isFollowing?: boolean }>;
  nextCursor: string | null;
}

export function FollowersDialog({ isOpen, onClose, handle, type }: FollowersDialogProps): ReactElement | null {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery<FollowersResponse>({
    queryKey: [`${type}`, handle, searchQuery],
    queryFn: async ({ pageParam }) => {
      const endpoint = `/follows/${handle}/${type}`;
      const { data } = await apiClient.get<FollowersResponse>(endpoint, {
        params: {
          cursor: pageParam as string | undefined,
          limit: 20,
          q: searchQuery || undefined
        }
      });
      return data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isOpen
  });

  const users = data?.pages.flatMap((page) => page.users) ?? [];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-md max-h-[80vh] rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-900/95 backdrop-blur-xl shadow-elegant-lg overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">
              {type === 'followers' ? 'Seguidores' : 'Siguiendo'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70"
            >
              <XIcon />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-4 border-b border-white/10">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="size-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="size-16 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-4">
                  <svg className="size-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-white mb-1">
                  No hay {type === 'followers' ? 'seguidores' : 'seguidos'} aún
                </p>
                <p className="text-xs text-slate-400">
                  {type === 'followers' ? 'Los seguidores aparecerán aquí' : 'Las cuentas que sigues aparecerán aquí'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 4 }}
                    className="group"
                  >
                    <Link
                      href={`/${user.handle}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-white/5"
                    >
                      <div className="relative size-12 flex-shrink-0">
                        <Image
                          src={getAvatarUrl(user.avatarUrl, user.handle)}
                          alt={user.displayName}
                          fill
                          className="rounded-full object-cover ring-2 ring-slate-800 group-hover:ring-primary-500/50 transition-all"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white truncate">{user.displayName}</p>
                          {user.isVerified && (
                            <svg className="size-4 text-primary-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 truncate">@{user.handle}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {hasNextPage && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    void fetchNextPage();
                  }}
                  disabled={isFetchingNextPage}
                  className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isFetchingNextPage ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Cargando...
                    </span>
                  ) : (
                    'Cargar más'
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

