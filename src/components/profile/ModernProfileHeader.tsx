"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { User } from '@/types';
import { formatNumber } from '@/utils/format';

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
  followButton?: React.ReactNode;
}

export default function ModernProfileHeader({
  user,
  isOwnProfile,
  stats,
  onEditClick,
  onFollowersClick,
  onFollowingClick,
  followButton
}: ModernProfileHeaderProps) {
  const [imageError, setImageError] = useState(false);

  // Reset image error when avatar changes
  React.useEffect(() => {
    setImageError(false);
  }, [user.avatar]);

  // Debug: Log avatar information
  console.log('Avatar debug:', {
    hasAvatar: !!user.avatar,
    avatarUrl: user.avatar,
    imageError,
    username: user.username
  });

  return (
    <div className="relative overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/30"></div>
      
      {/* Decorative Elements - Smaller */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Avatar Section - Compact */}
          <div className="flex-shrink-0 relative group">
            <div className="relative">
              {/* Avatar Ring with Gradient - Smaller */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-0.5 group-hover:p-1 transition-all duration-300">
                <div className="w-full h-full bg-white rounded-full p-0.5">
                  {user.avatar && !imageError ? (
                    <img 
                      src={user.avatar} 
                      alt={`Avatar de ${user.username}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-md transition-transform group-hover:scale-105 duration-300" 
                      onError={(e) => {
                        console.error('Error loading avatar:', user.avatar, e);
                        setImageError(true);
                      }}
                      onLoad={() => {
                        console.log('Avatar loaded successfully:', user.avatar);
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-md">
                      {user.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Verified Badge - Compact */}
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-1 shadow-md">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information - Compact */}
          <div className="flex-1 min-w-0 w-full sm:w-auto text-center sm:text-left">
            {/* Username and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
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
                {!isOwnProfile && followButton}
                
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
                      className="p-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200/50"
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

            {/* Personal Information - Compact */}
            <div className="mb-4">
              {user.fullName && (
                <div className="font-semibold text-gray-900 mb-2 text-base">{user.fullName}</div>
              )}
              {user.bio && (
                <div className="text-gray-700 mb-2 break-words leading-relaxed text-sm">
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

            {/* Statistics Grid - Compact */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <CompactStatCard 
                icon="posts" 
                count={stats.posts} 
                label="Posts" 
              />
              <CompactStatCard 
                icon="reels" 
                count={stats.reels} 
                label="Reels" 
              />
              <CompactStatCard 
                icon="stories" 
                count={stats.stories} 
                label="Stories" 
              />
              <CompactStatCard 
                icon="likes" 
                count={stats.likes} 
                label="Likes" 
              />
            </div>

            {/* Followers and Following - Compact */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm font-medium">
              <button 
                className="hover:underline flex items-center gap-1 transition-all duration-200 hover:text-blue-600" 
                onClick={onFollowersClick}
              >
                <span className="font-bold text-gray-900">{formatNumber(stats.followers)}</span>
                <span className="text-gray-600">seguidores</span>
              </button>
              <button 
                className="hover:underline flex items-center gap-1 transition-all duration-200 hover:text-blue-600" 
                onClick={onFollowingClick}
              >
                <span className="font-bold text-gray-900">{formatNumber(stats.following)}</span>
                <span className="text-gray-600">siguiendo</span>
              </button>
              <div className="flex items-center gap-1">
                <span className="font-bold text-gray-900">{formatNumber(stats.comments)}</span>
                <span className="text-gray-600">comentarios</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CompactStatCardProps {
  icon: 'posts' | 'reels' | 'stories' | 'likes';
  count: number;
  label: string;
}

function CompactStatCard({ icon, count, label }: CompactStatCardProps) {
  const getIcon = () => {
    switch (icon) {
      case 'posts':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'reels':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'stories':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'likes':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="text-center group cursor-pointer">
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50 hover:bg-white/90 hover:border-white/70 transition-all duration-300 hover:scale-105 hover:shadow-md">
        <div className="flex items-center justify-center mb-1 text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
          {getIcon()}
        </div>
        <div className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
          {formatNumber(count)}
        </div>
        <div className="text-xs text-gray-600 font-medium">{label}</div>
      </div>
    </div>
  );
}
