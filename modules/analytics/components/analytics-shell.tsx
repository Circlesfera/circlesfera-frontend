'use client';

import { type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { getProfileAnalytics, type ProfileAnalytics } from '../../../services/api/analytics';
import { AnalyticsOverview } from './analytics-overview';
import { AnalyticsPosts } from './analytics-posts';
import { AnalyticsEngagement } from './analytics-engagement';
import { fadeUpVariants } from '@/lib/motion-config';
import { useSessionStore } from '@/store/session';

export function AnalyticsShell(): ReactElement {
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);

  const { data, isLoading, error } = useQuery<ProfileAnalytics>({
    queryKey: ['analytics', 'profile'],
    queryFn: async () => {
      const response = await getProfileAnalytics(10);
      return response.analytics;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    // Solo ejecutar cuando la sesión esté hidratada y haya un token
    enabled: isHydrated && !!accessToken
  });

  if (isLoading) {
    return (
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl glass-card" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl glass-card" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl glass-card p-8 text-center"
      >
        <div className="size-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="size-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-red-400 mb-2">
          Error al cargar analytics
        </p>
        <p className="text-xs text-slate-500">
          Intenta nuevamente más tarde
        </p>
      </motion.div>
    );
  }

  if (!data) {
    return (
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="flex min-h-[500px] flex-col items-center justify-center"
      >
        <div className="rounded-2xl glass-card p-12 text-center max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mb-6 mx-auto"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 via-primary-400/20 to-accent-500/20 blur-2xl" />
            <div className="relative size-24 rounded-2xl border border-primary-500/30 bg-gradient-to-br from-slate-900/50 to-black/50 backdrop-blur-sm flex items-center justify-center shadow-elegant">
              <svg className="size-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-white mb-2">No hay datos de analytics disponibles</h2>
            <p className="text-sm text-slate-400">
              Los datos aparecerán cuando tengas contenido publicado
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <AnalyticsOverview overview={data.overview} growth={data.growth} />
      <AnalyticsEngagement engagementByType={data.engagementByType} />
      <AnalyticsPosts recentPosts={data.recentPosts} topPosts={data.topPosts} />
    </motion.div>
  );
}

