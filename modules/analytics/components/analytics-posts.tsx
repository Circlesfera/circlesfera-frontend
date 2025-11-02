'use client';

import Link from 'next/link';
import { type ReactElement } from 'react';
import type { PostAnalytics } from '../../../services/api/analytics';

interface AnalyticsPostsProps {
  readonly recentPosts: PostAnalytics[];
  readonly topPosts: PostAnalytics[];
}

export function AnalyticsPosts({ recentPosts, topPosts }: AnalyticsPostsProps): ReactElement {
  const renderPostRow = (post: PostAnalytics): ReactElement => {
    const engagement = post.metrics.likes + post.metrics.comments + post.metrics.saves;

    return (
      <Link
        href={`/posts/${post.postId}`}
        key={post.postId}
        className="block rounded-lg border border-slate-800 bg-slate-900/40 p-4 transition hover:border-slate-700 hover:bg-slate-900/60"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-white">{post.caption || '(Sin título)'}</p>
            <p className="mt-1 text-xs text-slate-400">
              {new Date(post.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <p className="font-semibold text-white">{post.metrics.views.toLocaleString('es')}</p>
              <p className="text-xs text-slate-500">Views</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">{engagement.toLocaleString('es')}</p>
              <p className="text-xs text-slate-500">Engagement</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-primary-400">{post.metrics.engagementRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">Rate</p>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Posts Recientes */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Posts Recientes</h2>
        {recentPosts.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No hay posts recientes</p>
        ) : (
          <div className="space-y-3">{recentPosts.map(renderPostRow)}</div>
        )}
      </div>

      {/* Top Posts */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Top Posts</h2>
        {topPosts.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No hay posts destacados</p>
        ) : (
          <div className="space-y-3">{topPosts.map(renderPostRow)}</div>
        )}
      </div>
    </div>
  );
}

