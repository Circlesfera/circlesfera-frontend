"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import Avatar from './Avatar';
import Button from './Button';

export interface PostCardProps {
  post: {
    id: string;
    user: {
      id: string;
      username: string;
      avatar?: string;
      fullName?: string;
    };
    content: {
      type: 'image' | 'video' | 'text';
      url?: string;
      text?: string;
      aspectRatio?: '1:1' | '4:5';
    };
    caption?: string;
    likes: number;
    comments: number;
    isLiked?: boolean;
    createdAt: string;
  };
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onUserClick?: (userId: string) => void;
  onDelete?: (postId: string) => void;
  onPostClick?: (postId: string, username: string) => void;
  className?: string;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onUserClick,
  onDelete,
  onPostClick,
  className,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    onLike?.(post.id);
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      onDelete?.(post.id);
      setShowMenu(false);
    }
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'hace un momento';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  const LikeIcon = ({ filled }: { filled: boolean }) => (
    <svg
      className={cn(
        "w-6 h-6 transition-all duration-200",
        filled ? "text-red-500 scale-110" : "text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400"
      )}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={filled ? 0 : 2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );

  const CommentIcon = () => (
    <svg
      className="w-6 h-6 text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );

  const ShareIcon = () => (
    <svg
      className="w-6 h-6 text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
      />
    </svg>
  );

  const MoreIcon = () => (
    <svg
      className="w-6 h-6 text-gray-600 dark:text-gray-400 dark:text-gray-500"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );

  return (
    <div className={cn("bg-white dark:bg-gray-900 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm dark:shadow-gray-900/50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => onUserClick?.(post.user.id)}
        >
          <Avatar
            src={post.user.avatar}
            alt={post.user.username}
            size="sm"
            fallback={post.user.fullName || post.user.username}
            interactive
          />
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {post.user.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuToggle}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 rounded-full transition-colors duration-200"
          >
            <MoreIcon />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-32">
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="relative cursor-pointer"
        onClick={() => onPostClick?.(post.id, post.user.username)}
      >
        <div className={cn(
          "relative w-full overflow-hidden bg-black",
          post.content.aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square'
        )}>
          {post.content.type === 'image' && post.content.url && (
            <Image
              src={post.content.url}
              alt={post.caption || 'Imagen del post'}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}

          {post.content.type === 'video' && post.content.url && (
            <video
              src={post.content.url}
              className="absolute inset-0 w-full h-full object-contain"
              controls
            />
          )}

          {post.content.type === 'text' && (
            <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50">
              <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed text-center">
                {post.content.text}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={cn(
                "p-1 rounded-full transition-all duration-200",
                isLiked ? "hover:bg-red-50" : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800"
              )}
            >
              <LikeIcon filled={isLiked} />
            </button>

            <button
              onClick={() => onComment?.(post.id)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 transition-colors duration-200"
            >
              <CommentIcon />
            </button>

            <button
              onClick={() => onShare?.(post.id)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 transition-colors duration-200"
            >
              <ShareIcon />
            </button>
          </div>
        </div>

        {/* Likes count */}
        {likesCount > 0 && (
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {likesCount.toLocaleString()} {likesCount === 1 ? 'me gusta' : 'me gustas'}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="space-y-1">
            <p className="text-gray-900 dark:text-gray-100 text-sm">
              <span className="font-semibold mr-2">{post.user.username}</span>
              {post.caption}
            </p>
          </div>
        )}

        {/* Comments count */}
        {post.comments > 0 && (
          <button
            onClick={() => onComment?.(post.id)}
            className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300 transition-colors duration-200"
          >
            Ver {post.comments} {post.comments === 1 ? 'comentario' : 'comentarios'}
          </button>
        )}

        {/* Add comment */}
        <div className="flex items-center space-x-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <Avatar
            src={post.user.avatar}
            alt="Tu avatar"
            size="xs"
            fallback="Tú"
          />
          <div className="flex-1">
            <input
              type="text"
              placeholder="Añade un comentario..."
              className="w-full px-3 py-2 text-sm bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 hover:text-blue-600"
          >
            Publicar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
