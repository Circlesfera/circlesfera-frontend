"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { User } from '@/types';
import { formatNumber } from '@/utils/format';
import { SettingsIcon, EditIcon, VerifiedIcon } from './ProfileIcons';

interface ProfileHeaderProps {
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

export default function ProfileHeader({
  user,
  isOwnProfile,
  stats,
  onEditClick,
  onFollowersClick,
  onFollowingClick,
  followButton
}: ProfileHeaderProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Avatar Section */}
        <div className="flex-shrink-0 relative">
          <div className="relative">
            {user.avatar && !imageError ? (
              <img 
                src={user.avatar} 
                alt={`Avatar de ${user.username}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg transition-transform hover:scale-105" 
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg">
                {user.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            
            {/* Verified Badge */}
            {user.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg">
                <VerifiedIcon className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="flex-1 min-w-0">
          {/* Username and Actions */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
              {user.isVerified && (
                <VerifiedIcon className="w-6 h-6 text-blue-500" />
              )}
            </div>
            
            {!isOwnProfile && followButton}
            
            {isOwnProfile && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={onEditClick}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm font-semibold border border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <EditIcon className="w-4 h-4" />
                  Editar perfil
                </button>
                <Link 
                  href="/settings" 
                  className="p-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Configuración"
                >
                  <SettingsIcon className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="mb-6">
            {user.fullName && (
              <div className="font-semibold text-gray-900 mb-2 text-lg">{user.fullName}</div>
            )}
            {user.bio && (
              <div className="text-gray-700 mb-2 break-words leading-relaxed">{user.bio}</div>
            )}
            {user.website && (
              <a 
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                {user.website}
              </a>
            )}
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <StatCard 
              icon="posts" 
              count={stats.posts} 
              label="Publicaciones" 
            />
            <StatCard 
              icon="reels" 
              count={stats.reels} 
              label="Reels" 
            />
            <StatCard 
              icon="stories" 
              count={stats.stories} 
              label="Stories" 
            />
            <StatCard 
              icon="likes" 
              count={stats.likes} 
              label="Me gusta" 
            />
          </div>

          {/* Followers and Following */}
          <div className="flex gap-8 text-base font-medium">
            <button 
              className="hover:underline flex items-center gap-2 transition-colors duration-200 hover:text-blue-600" 
              onClick={onFollowersClick}
            >
              <span className="font-bold text-gray-900">{formatNumber(stats.followers)}</span>
              <span className="text-gray-600">seguidores</span>
            </button>
            <button 
              className="hover:underline flex items-center gap-2 transition-colors duration-200 hover:text-blue-600" 
              onClick={onFollowingClick}
            >
              <span className="font-bold text-gray-900">{formatNumber(stats.following)}</span>
              <span className="text-gray-600">siguiendo</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{formatNumber(stats.comments)}</span>
              <span className="text-gray-600">comentarios</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: 'posts' | 'reels' | 'stories' | 'likes';
  count: number;
  label: string;
}

function StatCard({ icon, count, label }: StatCardProps) {
  const getIcon = () => {
    switch (icon) {
      case 'posts':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'reels':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'stories':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'likes':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="text-center group">
      <div className="flex items-center justify-center mb-2 text-gray-600 group-hover:text-blue-600 transition-colors duration-200">
        {getIcon()}
      </div>
      <div className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
        {formatNumber(count)}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
