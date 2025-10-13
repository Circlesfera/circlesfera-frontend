"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/types';
import { formatNumber, formatDate } from '@/utils/format';

interface ModernProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
  stats: {
    posts: number;
    reels: number;
    stories: number;
    followers: number;
    following: number;
    likes: number;
    comments: number;
  };
  onEditClick: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  onMessageClick?: () => void;
  followButton?: React.ReactNode;
}

export default function ModernProfileHeader({
  user,
  isOwnProfile,
  stats,
  onEditClick,
  onFollowersClick,
  onFollowingClick,
  onMessageClick,
  followButton
}: ModernProfileHeaderProps) {
  const [imageError, setImageError] = useState(false);

  // Reset image error when avatar changes
  useEffect(() => {
    setImageError(false);
  }, [user.avatar]);

  // Debug: Log avatar information

  // Check if we have additional info to show
  const hasAdditionalInfo = user.location || user.birthDate || user.website;

  return (
    <div className="relative">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/20 rounded-2xl"></div>

      <div className="relative bg-white dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 p-4 sm:p-6 lg:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 lg:gap-8">
          {/* Avatar Section */}
          <div className="flex-shrink-0 relative group">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-lg overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                {user.avatar && !imageError ? (
                  <Image
                    src={user.avatar}
                    alt={`Avatar de ${user.username}`}
                    fill
                    className="object-cover rounded-full"
                    sizes="(max-width: 640px) 80px, 96px"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold rounded-full">
                    {user.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>

              {/* Verified Badge */}
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-1 shadow-md">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="flex-1 min-w-0 w-full sm:w-auto text-center sm:text-left">
            {/* Username and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.username}
                </h1>
                {user.isVerified && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2">
                {!isOwnProfile && (
                  <>
                    {followButton}
                    {onMessageClick && (
                      <button
                        onClick={onMessageClick}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-1.5 text-sm"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Mensaje
                      </button>
                    )}
                  </>
                )}

                {isOwnProfile && (
                  <>
                    <button
                      onClick={onEditClick}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-1.5 text-sm"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <Link
                      href="/settings"
                      className="p-2 bg-white dark:bg-gray-900/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white dark:bg-gray-900 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700/50"
                      title="Configuración"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="mb-4">
              {user.fullName && (
                <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-base">{user.fullName}</div>
              )}
              {user.bio && (
                <div className="text-gray-700 dark:text-gray-300 mb-2 break-words leading-relaxed text-sm">
                  {user.bio}
                </div>
              )}
              {user.website && (
                <a
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 text-sm"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {user.website}
                </a>
              )}
            </div>

            {/* Followers and Following */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-base font-medium mb-4">
              <button
                className="hover:underline flex items-center gap-2 transition-all duration-200 hover:text-blue-600 hover:scale-105"
                onClick={onFollowersClick}
              >
                <span className="font-bold text-gray-900 dark:text-gray-100 text-xl">{formatNumber(stats.followers)}</span>
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">seguidores</span>
              </button>
              <button
                className="hover:underline flex items-center gap-2 transition-all duration-200 hover:text-blue-600 hover:scale-105"
                onClick={onFollowingClick}
              >
                <span className="font-bold text-gray-900 dark:text-gray-100 text-xl">{formatNumber(stats.following)}</span>
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">seguidos</span>
              </button>
            </div>

            {/* Additional Profile Info - Compact Grid */}
            {(hasAdditionalInfo || isOwnProfile) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                {/* Account Status */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100">
                    {user.isPrivate ? (
                      <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Estado</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                      {user.isPrivate ? 'Privada' : 'Pública'}
                    </div>
                  </div>
                </div>

                {/* Location */}
                {user.location && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100">
                      <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Ubicación</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-xs truncate">{user.location}</div>
                    </div>
                  </div>
                )}

                {/* Birth Date (only for own profile) */}
                {isOwnProfile && user.birthDate && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100">
                      <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Nacimiento</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                        {formatDate(user.birthDate)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Member Since */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100">
                    <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Miembro desde</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Last Seen */}
                {user.lastSeen && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Última actividad</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                        {formatDate(user.lastSeen)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

