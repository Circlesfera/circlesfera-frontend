"use client";

import React, { useState, useRef } from 'react';
import { Post } from '@/services/postService';
import LikeButton from './LikeButton';
import CommentsSection from './CommentsSection';
import { useAuth } from '@/features/auth/useAuth';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Iconos SVG modernos
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CommentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? 0 : 2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const MoreIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const likedByUser = post.likes.includes(user?._id || '');
  const [isSaved, setIsSaved] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'ahora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    return postDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const renderContent = () => {
    switch (post.type) {
      case 'image':
        if (post.content.images && post.content.images.length > 1) {
          return (
            <div className="relative overflow-hidden">
              <div className="relative">
                <img 
                  src={post.content.images[currentImageIndex].url} 
                  alt={post.content.images[currentImageIndex].alt || "post"} 
                  className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105" 
                />
                {/* Indicadores de imagen */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {post.content.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
                {/* Navegación de imágenes */}
                {currentImageIndex > 0 && (
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                {currentImageIndex < post.content.images.length - 1 && (
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        } else {
          return (
            <div className="relative overflow-hidden">
              <img 
                src={post.content.images?.[0]?.url || post.content.image} 
                alt={post.content.images?.[0]?.alt || "post"} 
                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105" 
              />
            </div>
          );
        }

      case 'video':
        return (
          <div className="relative overflow-hidden">
            <video 
              ref={videoRef}
              src={post.content.video?.url} 
              poster={post.content.video?.thumbnail}
              className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
              preload="metadata"
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            />
            {!isVideoPlaying && (
              <button
                onClick={handleVideoPlay}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all duration-200"
              >
                <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                  <PlayIcon />
                </div>
              </button>
            )}
            {post.content.video?.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {formatDuration(post.content.video.duration)}
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="text-gray-900 text-lg leading-relaxed whitespace-pre-wrap">
              {post.content.text}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="animate-fade-in"
    >
      {/* Header del usuario */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <Link href={`/${post.user.username}`} className="group">
            {post.user.avatar ? (
              <img 
                src={post.user.avatar} 
                alt="avatar" 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-200" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                {post.user.username[0].toUpperCase()}
              </div>
            )}
          </Link>
          <div className="flex flex-col">
            <Link href={`/${post.user.username}`} className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition-colors">
              {post.user.username}
            </Link>
            <div className="flex items-center space-x-2 text-gray-500 text-xs">
              <span>{formatTimeAgo(post.createdAt)}</span>
              {post.location?.name && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <LocationIcon />
                    <span>{post.location.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setShowMore(!showMore)}
          className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
        >
          <MoreIcon />
        </button>
      </div>

      {/* Contenido según el tipo */}
      {renderContent()}

      {/* Acciones */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <LikeButton postId={post._id} initialLiked={likedByUser} initialCount={post.likes.length} />
            
            <button className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group hover:scale-105">
              <CommentIcon />
            </button>
            
            <button className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group hover:scale-105">
              <ShareIcon />
            </button>
          </div>
          
          <button 
            onClick={() => setIsSaved(!isSaved)}
            className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group hover:scale-105"
          >
            <BookmarkIcon filled={isSaved} />
          </button>
        </div>

        {/* Likes */}
        {post.likes.length > 0 && (
          <div className="font-semibold text-gray-900 text-sm mb-3">
            {post.likes.length} me gusta
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="mb-3">
            <span className="font-semibold text-gray-900 text-sm mr-2">
              {post.user.username}
            </span>
            <span className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
              {showFullCaption ? (
                post.caption
              ) : post.caption.length > 100 ? (
                <>
                  {post.caption.substring(0, 100)}...
                  <button 
                    onClick={() => setShowFullCaption(true)}
                    className="text-gray-500 hover:text-gray-700 ml-1 font-medium"
                  >
                    más
                  </button>
                </>
              ) : (
                post.caption
              )}
            </span>
            {showFullCaption && (
              <button 
                onClick={() => setShowFullCaption(false)}
                className="text-gray-500 hover:text-gray-700 ml-1 font-medium text-sm"
              >
                menos
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <TagIcon />
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="text-blue-600 text-xs font-medium hover:text-blue-700 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comentarios */}
        <CommentsSection postId={post._id} />
      </div>
    </motion.div>
  );
}
