'use client';

import Link from 'next/link';
import { type ReactElement } from 'react';
import { motion } from 'framer-motion';
import type { PostAnalytics } from '../../../services/api/analytics';
import { fadeUpVariants, staggerContainer, staggerItem } from '@/lib/motion-config';

interface AnalyticsPostsProps {
  readonly recentPosts: PostAnalytics[];
  readonly topPosts: PostAnalytics[];
}

export function AnalyticsPosts({ recentPosts, topPosts }: AnalyticsPostsProps): ReactElement {
  const renderPostRow = (post: PostAnalytics): ReactElement => {
    const engagement = post.metrics.likes + post.metrics.comments + post.metrics.saves;

    return (
      <motion.div
        key={post.postId}
        variants={staggerItem}
        whileHover={{ scale: 1.02, x: 4 }}
      >
        <Link
          href={`/posts/${post.postId}`}
          className="block rounded-xl glass-card p-5 transition-all hover:shadow-elegant-lg hover:scale-[1.01] border border-white/5 hover:border-white/10 group"
        >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-white group-hover:text-primary-400 transition-colors">
              {post.caption || '(Sin título)'}
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              {new Date(post.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="flex gap-5 text-sm shrink-0">
            <div className="text-center min-w-[60px]">
              <p className="font-bold text-lg text-white">{post.metrics.views.toLocaleString('es')}</p>
              <p className="text-xs text-slate-500 mt-0.5">Views</p>
            </div>
            <div className="text-center min-w-[70px]">
              <p className="font-bold text-lg text-white">{engagement.toLocaleString('es')}</p>
              <p className="text-xs text-slate-500 mt-0.5">Engagement</p>
            </div>
            <div className="text-center min-w-[60px]">
              <p className="font-bold text-lg text-gradient-primary">{post.metrics.engagementRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Rate</p>
            </div>
          </div>
        </div>
        </Link>
      </motion.div>
      );
    };

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-8 lg:grid-cols-2"
    >
      {/* Posts Recientes */}
      <motion.div
        variants={fadeUpVariants}
        className="rounded-2xl glass-card p-6 md:p-8"
      >
        <h2 className="mb-6 text-xl font-bold text-gradient-primary">Posts Recientes</h2>
        {recentPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center"
          >
            <div className="size-16 rounded-full glass-dark mx-auto mb-3 flex items-center justify-center">
              <svg className="size-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">No hay posts recientes</p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {recentPosts.map(renderPostRow)}
          </motion.div>
        )}
      </motion.div>

      {/* Top Posts */}
      <motion.div
        variants={fadeUpVariants}
        className="rounded-2xl glass-card p-6 md:p-8 border border-white/5 hover:border-white/10 transition-all duration-300"
      >
        <h2 className="mb-6 text-xl font-bold text-gradient-primary">Top Posts</h2>
        {topPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center"
          >
            <div className="size-16 rounded-full glass-dark mx-auto mb-3 flex items-center justify-center">
              <svg className="size-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">No hay posts destacados</p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {topPosts.map(renderPostRow)}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

