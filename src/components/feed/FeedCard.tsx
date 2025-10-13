"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Post } from '@/services/postService';
import { formatRelativeTime, formatNumber } from '@/utils/format';
import { Card } from '@/design-system/Card';
import { Button } from '@/design-system/Button';
import { cn } from '@/utils/cn';

interface FeedCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, username: string) => void;
  onShare?: (postId: string, username: string) => void;
  onDelete?: (postId: string) => void;
  isOwnPost?: boolean;
}

// Iconos SVG optimizados
const HeartIcon = ({ filled = false, className }: { filled?: boolean; className?: string }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CommentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const MoreIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const DeleteIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function FeedCard({
  post,
  onLike,
  onComment,
  onShare,
  onDelete,
  isOwnPost = false
}: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(post._id);
  };

  const handleComment = () => {
    onComment?.(post._id, post.user.username);
  };

  const handleShare = () => {
    onShare?.(post._id, post.user.username);
  };

  const handleDelete = () => {
    onDelete?.(post._id);
    setShowMore(false);
  };

  return (
    <Card variant="elevated" className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {post.user.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 text-sm">
              {post.user.fullName || post.user.username}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMore(!showMore)}
          >
            <MoreIcon className="h-5 w-5" />
          </Button>

          {showMore && (
            <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 dark:border-gray-700 py-1 z-10">
              {isOwnPost && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <DeleteIcon className="h-4 w-4" />
                  Eliminar
                </button>
              )}
              <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors duration-200">
                <ShareIcon className="h-4 w-4" />
                Compartir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        {post.caption && (
          <p className="text-gray-900 dark:text-gray-100 dark:text-gray-100 text-sm leading-relaxed mb-3">
            {post.caption}
          </p>
        )}
      </div>

      {/* Media */}
      {post.content.images && post.content.images.length > 0 && post.content.images[0] && !imageError && (
        <div className="relative w-full bg-black">
          <Image
            src={post.content.images[0].url}
            alt={post.caption || post.content.images[0].alt || "Contenido del post"}
            width={600}
            height={384}
            className="w-full h-auto max-h-96 object-contain"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between p-4 pt-2">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              "flex items-center gap-2 transition-colors duration-200",
              isLiked ? "text-red-500" : "text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-red-500"
            )}
          >
            <HeartIcon
              filled={isLiked}
              className="h-5 w-5"
            />
            <span className="text-sm font-medium">
              {formatNumber(post.likes.length)}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors duration-200"
          >
            <CommentIcon className="h-5 w-5" />
            <span className="text-sm font-medium">
              {formatNumber(post.comments.length)}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-green-500 transition-colors duration-200"
          >
            <ShareIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Compartir</span>
          </Button>
        </div>
      </div>

      {/* Comments Preview */}
      {post.comments.length > 0 && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
          <div className="space-y-2">
            {post.comments.slice(0, 2).map((commentId, index) => (
              <div key={commentId || index} className="flex items-start gap-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Comentario #{index + 1}
                  </p>
                </div>
              </div>
            ))}
            {post.comments.length > 2 && (
              <button className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300 transition-colors duration-200">
                Ver {post.comments.length - 2} comentarios más
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
