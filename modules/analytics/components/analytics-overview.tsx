'use client';

import React, { type ReactElement } from 'react';
import type { ProfileOverview, ProfileGrowth } from '../../../services/api/analytics';

interface AnalyticsOverviewProps {
  readonly overview: ProfileOverview;
  readonly growth: ProfileGrowth;
}

export function AnalyticsOverview({ overview, growth }: AnalyticsOverviewProps): ReactElement {
  const engagementTrendIcon =
    growth.engagementTrend === 'up' ? (
      <svg className="size-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ) : growth.engagementTrend === 'down' ? (
      <svg className="size-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ) : (
      <svg className="size-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );

  const stats = [
    {
      label: 'Total Posts',
      value: overview.totalPosts.toLocaleString('es'),
      subtitle: `${growth.postsGrowth} en últimos 30 días`,
      icon: (
        <svg className="size-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      label: 'Seguidores',
      value: overview.totalFollowers.toLocaleString('es'),
      subtitle: `${growth.followersGrowth > 0 ? '+' : ''}${growth.followersGrowth}`,
      icon: (
        <svg className="size-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      label: 'Engagement Rate',
      value: `${overview.averageEngagementRate.toFixed(2)}%`,
      subtitle: `Tendencia ${growth.engagementTrend === 'up' ? '↑' : growth.engagementTrend === 'down' ? '↓' : '→'}`,
      icon: engagementTrendIcon,
      highlight: true
    },
    {
      label: 'Promedio Views',
      value: overview.averageViewsPerPost.toLocaleString('es'),
      subtitle: 'Por post',
      icon: (
        <svg className="size-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`rounded-xl border bg-slate-900/60 p-6 transition hover:bg-slate-900/80 ${
            stat.highlight ? 'border-primary-500/50 bg-primary-500/10' : 'border-slate-800'
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-slate-800 p-2">{stat.icon}</div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-500">{stat.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

