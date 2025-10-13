/**
 * ❤️ POST CARD ACTIONS
 * ====================
 * Botones de acción del post: like, comentar, compartir, guardar
 * ✅ WCAG 2.1 AA Compliant
 * ✅ Touch targets mínimo 44x44px
 * ✅ ARIA labels completos
 */

'use client'

import React from 'react'
import LikeButton from '@/components/LikeButton'
import { CommentIcon, ShareIcon, BookmarkIcon, TagIcon } from '@/components/icons/PostIcons'
import { formatCount } from '@/utils/formatters'
import { ARIA_LABELS, getButtonA11yProps, TOUCH_TARGET_CLASSES } from '@/utils/accessibilityHelpers'
import type { Post } from '@/services/postService'

export interface PostCardActionsProps {
  post: Post
  currentUserId: string | undefined
  isSaved: boolean
  isEditing: boolean
  editCaption: string
  showFullCaption: boolean
  onComment: ((postId: string, postAuthor: string, postImage?: string) => void) | undefined
  onShare: ((postId: string, postUrl?: string, postCaption?: string) => void) | undefined
  onSave: () => void
  onToggleCaption: () => void
  onEditCaption: (caption: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}

export function PostCardActions({
  post,
  currentUserId,
  isSaved,
  isEditing,
  editCaption,
  showFullCaption,
  onComment,
  onShare,
  onSave,
  onToggleCaption,
  onEditCaption,
  onSaveEdit,
  onCancelEdit,
}: PostCardActionsProps) {
  const likedByUser = post.likes.includes(currentUserId || '')
  const postUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${post.user.username}/post/${post._id}`

  return (
    <div className="px-6 py-3">
      {/* Botones de acción principales */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {/* Like button */}
          <LikeButton
            postId={post._id}
            initialLiked={likedByUser}
            initialCount={post.likes.length}
          />

          {/* Comment button */}
          <button
            onClick={() => onComment?.(post._id, post.user.username, post.content?.images?.[0]?.url)}
            className={`${TOUCH_TARGET_CLASSES.min} p-2 rounded-full hover:bg-gray-100 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
            {...getButtonA11yProps(ARIA_LABELS.post.comment)}
          >
            <CommentIcon
              aria-hidden="true"
              className="group-hover:scale-110 transition-transform"
            />
          </button>

          {/* Share button */}
          <button
            onClick={() => onShare?.(post._id, postUrl, post.caption)}
            className={`${TOUCH_TARGET_CLASSES.min} p-2 rounded-full hover:bg-gray-100 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
            {...getButtonA11yProps(ARIA_LABELS.post.share)}
          >
            <ShareIcon
              aria-hidden="true"
              className="group-hover:scale-110 transition-transform"
            />
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={onSave}
          className={`${TOUCH_TARGET_CLASSES.min} p-2 rounded-full hover:bg-gray-100 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
          {...getButtonA11yProps(ARIA_LABELS.post.save(isSaved), { pressed: isSaved })}
        >
          <BookmarkIcon
            filled={isSaved}
            aria-hidden="true"
            className={`transition-transform ${isSaved ? 'scale-110' : 'group-hover:scale-110'}`}
          />
        </button>
      </div>

      {/* Likes count y Caption */}
      {(post.likes.length > 0 || post.caption) && (
        <div className="mb-2">
          {/* Likes count */}
          {post.likes.length > 0 && (
            <button
              className="font-semibold text-gray-900 text-sm hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:underline"
              aria-label={ARIA_LABELS.post.likeCount(post.likes.length)}
            >
              {formatCount(post.likes.length)} me gusta
            </button>
          )}

          {/* Caption */}
          {post.caption && !isEditing && (
            <div className="mt-1">
              <span className="font-semibold text-gray-900 text-sm mr-2">
                {post.user.username}
              </span>
              <span className="text-gray-900 text-sm">
                {post.caption.length > 80 && !showFullCaption ? (
                  <>
                    {post.caption.substring(0, 80)}...
                    <button
                      onClick={onToggleCaption}
                      className="text-gray-500 hover:text-gray-700 ml-1 font-medium focus-visible:outline-none focus-visible:underline"
                      aria-label="Ver caption completo"
                    >
                      más
                    </button>
                  </>
                ) : (
                  <>
                    {post.caption}
                    {post.caption.length > 80 && showFullCaption && (
                      <button
                        onClick={onToggleCaption}
                        className="text-gray-500 hover:text-gray-700 ml-1 font-medium focus-visible:outline-none focus-visible:underline"
                        aria-label="Ver menos"
                      >
                        menos
                      </button>
                    )}
                  </>
                )}
              </span>
            </div>
          )}

          {/* Formulario de edición */}
          {isEditing && (
            <div className="mt-2" role="form" aria-label="Editar caption">
              <textarea
                value={editCaption}
                onChange={(e) => onEditCaption(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Escribe tu caption..."
                aria-label="Caption del post"
                maxLength={2200}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {editCaption.length}/2200
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={onSaveEdit}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
                    aria-label="Guardar cambios"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors"
                    aria-label="Cancelar edición"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex items-center space-x-1 mt-2" role="list" aria-label="Tags del post">
          <TagIcon aria-hidden="true" className="text-gray-400" />
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag, index) => (
              <button
                key={index}
                className="text-blue-600 text-xs font-medium hover:text-blue-700 focus-visible:outline-none focus-visible:underline transition-colors"
                aria-label={`Tag: ${tag}`}
                role="listitem"
              >
                #{tag}
              </button>
            ))}
            {post.tags.length > 3 && (
              <span className="text-gray-500 text-xs" aria-label={`${post.tags.length - 3} tags más`}>
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

