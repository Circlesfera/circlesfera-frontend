'use client';

import { type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getProfileAnalytics, type ProfileAnalytics } from '../../../services/api/analytics';
import { AnalyticsOverview } from './analytics-overview';
import { AnalyticsPosts } from './analytics-posts';
import { AnalyticsEngagement } from './analytics-engagement';

export function AnalyticsShell(): ReactElement {
  const { data, isLoading, error } = useQuery<ProfileAnalytics>({
    queryKey: ['analytics', 'profile'],
    queryFn: async () => {
      const response = await getProfileAnalytics(10);
      return response.analytics;
    },
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-800" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-slate-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-800 bg-red-900/20 p-6 text-center">
        <p className="text-red-400">Error al cargar analytics. Intenta nuevamente más tarde.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-slate-400">
        No hay datos de analytics disponibles.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AnalyticsOverview overview={data.overview} growth={data.growth} />
      <AnalyticsEngagement engagementByType={data.engagementByType} />
      <AnalyticsPosts recentPosts={data.recentPosts} topPosts={data.topPosts} />
    </div>
  );
}

