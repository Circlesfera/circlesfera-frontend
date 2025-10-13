/**
 * 🖥️ DESKTOP NAVIGATION
 * =====================
 * Navegación principal para desktop
 * ✅ WCAG 2.1 AA Compliant
 * ✅ Touch targets 44x44px
 */

'use client'

import React from 'react'
import Link from 'next/link'
import {
  HomeIcon,
  MessageIcon,
  ExploreIcon,
  ReelsIcon,
  StoriesIcon,
  SearchIcon,
  FeedIcon,
  SettingsIcon,
  NotificationIcon,
  PlusIcon,
} from '@/components/icons/NavigationIcons'
import { ARIA_LABELS, getMenuButtonA11yProps, TOUCH_TARGET_CLASSES } from '@/utils/accessibilityHelpers'

export interface DesktopNavigationProps {
  unreadCount: number
  showCreateMenu: boolean
  onToggleCreateMenu: () => void
}

export function DesktopNavigation({
  unreadCount,
  showCreateMenu,
  onToggleCreateMenu,
}: DesktopNavigationProps) {
  const menuId = 'create-content-menu'

  return (
    <nav className="hidden md:flex items-center gap-1 lg:gap-2" role="navigation" aria-label="Navegación principal">
      {/* Home */}
      <Link
        href="/"
        className={`${TOUCH_TARGET_CLASSES.min} p-2 lg:p-3 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 group`}
        aria-label={ARIA_LABELS.navigation.home}
      >
        <HomeIcon aria-hidden="true" />
      </Link>

      {/* Messages */}
      <Link
        href="/messages"
        className={`${TOUCH_TARGET_CLASSES.min} p-2 lg:p-3 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 group`}
        aria-label={ARIA_LABELS.navigation.messages}
      >
        <MessageIcon aria-hidden="true" />
      </Link>

      {/* Explore */}
      <Link
        href="/explore"
        className={`${TOUCH_TARGET_CLASSES.min} p-2 lg:p-3 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 group`}
        aria-label={ARIA_LABELS.navigation.explore}
      >
        <ExploreIcon aria-hidden="true" />
      </Link>

      {/* Reels */}
      <Link
        href="/reels"
        className={`${TOUCH_TARGET_CLASSES.min} p-2 lg:p-3 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 group`}
        aria-label={ARIA_LABELS.navigation.reels}
      >
        <ReelsIcon aria-hidden="true" />
      </Link>

      {/* Stories */}
      <Link
        href="/stories"
        className={`${TOUCH_TARGET_CLASSES.min} p-2 lg:p-3 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 group`}
        aria-label={ARIA_LABELS.navigation.stories}
      >
        <StoriesIcon aria-hidden="true" />
      </Link>

      {/* Search */}
      <Link
        href="/search"
        className={`${TOUCH_TARGET_CLASSES.min} p-2 lg:p-3 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 group`}
        aria-label={ARIA_LABELS.navigation.search}
      >
        <SearchIcon aria-hidden="true" />
      </Link>

      {/* Feed */}
      <Link
        href="/feed"
        className={`${TOUCH_TARGET_CLASSES.min} p-2 lg:p-3 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 group`}
        aria-label={ARIA_LABELS.navigation.feed}
      >
        <FeedIcon aria-hidden="true" />
      </Link>

      {/* Settings */}
      <Link
        href="/settings"
        className={`${TOUCH_TARGET_CLASSES.min} p-2 lg:p-3 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 group`}
        aria-label={ARIA_LABELS.navigation.settings}
      >
        <SettingsIcon aria-hidden="true" />
      </Link>

      {/* Notifications */}
      <Link
        href="/notifications"
        className={`${TOUCH_TARGET_CLASSES.min} relative p-2 lg:p-3 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 group`}
        aria-label={ARIA_LABELS.navigation.notifications}
      >
        <NotificationIcon aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse"
            aria-label={`${unreadCount} notificaciones sin leer`}
            role="status"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>

      {/* Create content button */}
      <div className="relative">
        <button
          onClick={onToggleCreateMenu}
          className={`${TOUCH_TARGET_CLASSES.min} p-2 lg:p-3 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 group`}
          {...getMenuButtonA11yProps(ARIA_LABELS.menu.create, menuId, showCreateMenu)}
        >
          <PlusIcon aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}

