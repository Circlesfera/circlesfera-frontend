/**
 * 📌 POST CARD HEADER
 * ===================
 * Header del post con avatar, usuario, tiempo y menú de opciones
 * ✅ WCAG 2.1 AA Compliant
 * ✅ Touch targets 44x44px
 * ✅ ARIA labels completos
 */

'use client'

import React from 'react'
import { Avatar } from '@/shared/components/Image/Image'
import { MoreIcon, EditIcon, PinIcon, DeleteIcon, ReportIcon } from '@/components/icons/PostIcons'
import { formatTimeAgo } from '@/utils/formatters'
import { ARIA_LABELS, getButtonA11yProps, getMenuButtonA11yProps, getMenuA11yProps } from '@/utils/accessibilityHelpers'
import type { Post } from '@/features/posts/types'

export interface PostCardHeaderProps {
  post: Post
  currentUserId: string | undefined
  isPinned: boolean
  showMore: boolean
  moreMenuRef: React.RefObject<HTMLDivElement | null>
  onUserClick: ((userId: string) => void) | undefined
  onToggleMore: () => void
  onEdit: () => void
  onTogglePin: () => void
  onDelete: () => void
  onReport: () => void
}

export function PostCardHeader({
  post,
  currentUserId,
  isPinned,
  showMore,
  moreMenuRef,
  onUserClick,
  onToggleMore,
  onEdit,
  onTogglePin,
  onDelete,
  onReport,
}: PostCardHeaderProps) {
  const isOwner = currentUserId === post.user?.id
  const menuId = `post-menu-${post.id}`

  return (
    <div className="flex items-center justify-between px-6 py-3">
      {/* Avatar y usuario */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onUserClick?.(post.user?.id || '')}
          className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-full"
          {...getButtonA11yProps(ARIA_LABELS.user.profile(post.user?.username || 'Usuario'))}
        >
          {post.user?.avatar ? (
            <Avatar
              src={post.user?.avatar}
              alt={ARIA_LABELS.user.avatar(post.user?.username || 'Usuario')}
              width={40}
              height={40}
              className="rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-200"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm shadow-lg"
              aria-hidden="true"
            >
              {post.user?.username || 'Usuario'?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </button>

        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUserClick?.(post.user?.id || '')}
              className="font-semibold text-gray-900 dark:text-gray-100 text-sm hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:underline truncate max-w-[150px]"
              {...getButtonA11yProps(ARIA_LABELS.user.profile(post.user?.username || 'Usuario'))}
            >
              {post.user?.username || 'Usuario'}
            </button>

            {isPinned && (
              <span
                className="text-blue-500"
                aria-label="Publicación fijada"
                role="img"
              >
                📌
              </span>
            )}
          </div>

          <time
            dateTime={new Date(post.createdAt).toISOString()}
            className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-xs"
          >
            {formatTimeAgo(post.createdAt)}
          </time>
        </div>
      </div>

      {/* Menú de opciones */}
      <div className="relative" ref={moreMenuRef}>
        <button
          onClick={onToggleMore}
          className="min-w-[44px] min-h-[44px] p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          {...getMenuButtonA11yProps(ARIA_LABELS.post.more, menuId, showMore)}
        >
          <MoreIcon aria-hidden="true" />
        </button>

        {/* Dropdown menu */}
        {showMore && (
          <div
            {...getMenuA11yProps(menuId, showMore)}
            className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1 animate-fade-in"
          >
            {isOwner ? (
              <>
                {/* Opciones del propietario */}
                <button
                  onClick={() => {
                    onEdit()
                    onToggleMore()
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 flex items-center space-x-3 transition-colors focus-visible:outline-none focus-visible:bg-gray-100 dark:bg-gray-700"
                  role="menuitem"
                  {...getButtonA11yProps(ARIA_LABELS.post.edit)}
                >
                  <EditIcon aria-hidden="true" />
                  <span>Editar publicación</span>
                </button>

                <button
                  onClick={() => {
                    onTogglePin()
                    onToggleMore()
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 flex items-center space-x-3 transition-colors focus-visible:outline-none focus-visible:bg-gray-100 dark:bg-gray-700"
                  role="menuitem"
                  {...getButtonA11yProps(isPinned ? 'Desfijar publicación' : 'Fijar publicación')}
                >
                  <PinIcon aria-hidden="true" />
                  <span>{isPinned ? 'Desfijar' : 'Fijar'} en perfil</span>
                </button>

                {/* Separador */}
                <div className="border-t border-gray-100 dark:border-gray-700 my-1" role="separator" />

                <button
                  onClick={() => {
                    onDelete()
                    onToggleMore()
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors focus-visible:outline-none focus-visible:bg-red-100"
                  role="menuitem"
                  {...getButtonA11yProps(ARIA_LABELS.post.delete)}
                >
                  <DeleteIcon aria-hidden="true" />
                  <span>Eliminar publicación</span>
                </button>
              </>
            ) : null}

            {/* Opción de reportar (para todos) */}
            {!isOwner && (
              <button
                onClick={() => {
                  onReport()
                  onToggleMore()
                }}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 flex items-center space-x-3 transition-colors focus-visible:outline-none focus-visible:bg-gray-100 dark:bg-gray-700"
                role="menuitem"
                {...getButtonA11yProps(ARIA_LABELS.post.report)}
              >
                <ReportIcon aria-hidden="true" />
                <span>Reportar publicación</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

