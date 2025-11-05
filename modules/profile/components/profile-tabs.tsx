'use client';

import { useState, type ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessionStore } from '@/store/session';

import { ProfilePostsGrid } from './profile-posts-grid';
import { TaggedPostsShell } from '@/modules/tags/components/tagged-posts-shell';
import { SavedPostsShell } from '@/modules/saved/components/saved-posts-shell';

type TabType = 'posts' | 'tagged' | 'saved';

interface ProfileTabsProps {
  readonly handle: string;
}

export function ProfileTabs({ handle }: ProfileTabsProps): ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const currentUser = useSessionStore((state) => state.user);
  const isOwnProfile = currentUser?.handle?.toLowerCase() === handle.toLowerCase();

  const tabs: Array<{ id: TabType; label: string; icon: ReactElement }> = [
    {
      id: 'posts',
      label: 'Publicaciones',
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )
    },
    {
      id: 'tagged',
      label: 'Etiquetados',
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      )
    }
  ];

  if (isOwnProfile) {
    tabs.push({
      id: 'saved',
      label: 'Guardados',
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      )
    });
  }

  return (
    <div className="w-full">
      {/* Pestañas */}
      <div className="border-b border-white/10 mb-8">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`relative flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white/80'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={activeTab === tab.id ? 'text-primary-400' : ''}>{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500 rounded-t-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'posts' && <ProfilePostsGrid handle={handle} />}
          {activeTab === 'tagged' && (
            <div className="min-h-[400px]">
              <TaggedPostsShell />
            </div>
          )}
          {activeTab === 'saved' && isOwnProfile && (
            <div className="min-h-[400px]">
              <SavedPostsShell />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

