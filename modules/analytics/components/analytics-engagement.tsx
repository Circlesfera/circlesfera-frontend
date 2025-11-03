'use client';

import { type ReactElement } from 'react';
import { motion } from 'framer-motion';
import type { EngagementByType } from '../../../services/api/analytics';
import { fadeUpVariants } from '@/lib/motion-config';

interface AnalyticsEngagementProps {
  readonly engagementByType: EngagementByType;
}

export function AnalyticsEngagement({ engagementByType }: AnalyticsEngagementProps): ReactElement {
  const total = engagementByType.likes + engagementByType.comments + engagementByType.saves + engagementByType.shares;

  const data = [
    {
      label: 'Likes',
      value: engagementByType.likes,
      percentage: total > 0 ? (engagementByType.likes / total) * 100 : 0,
      color: 'bg-red-500'
    },
    {
      label: 'Comentarios',
      value: engagementByType.comments,
      percentage: total > 0 ? (engagementByType.comments / total) * 100 : 0,
      color: 'bg-blue-500'
    },
    {
      label: 'Guardados',
      value: engagementByType.saves,
      percentage: total > 0 ? (engagementByType.saves / total) * 100 : 0,
      color: 'bg-yellow-500'
    },
    {
      label: 'Compartidos',
      value: engagementByType.shares,
      percentage: total > 0 ? (engagementByType.shares / total) * 100 : 0,
      color: 'bg-green-500'
    }
  ];

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl glass-card p-6 md:p-8 border border-white/5 hover:border-white/10 transition-all duration-300"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gradient-primary">Engagement por Tipo</h2>
      </div>
      <div className="space-y-6">
        {data.map((item, index) => {
          const colors = {
            'Likes': 'from-red-500 via-pink-500 to-red-600',
            'Comentarios': 'from-blue-500 via-cyan-500 to-blue-600',
            'Guardados': 'from-yellow-500 via-orange-500 to-yellow-600',
            'Compartidos': 'from-green-500 via-emerald-500 to-green-600'
          };
          const colorGradient = colors[item.label as keyof typeof colors] || 'from-primary-500 to-accent-500';

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-4 group"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    {item.value.toLocaleString('es')} <span className="text-xs">({item.percentage.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-3.5 overflow-hidden rounded-full bg-slate-900/60 border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${colorGradient} shadow-lg`}
                    style={{
                      boxShadow: `0 4px 20px -2px rgba(${item.color === 'bg-red-500' ? '239, 68, 68' : item.color === 'bg-blue-500' ? '59, 130, 246' : item.color === 'bg-yellow-500' ? '234, 179, 8' : '34, 197, 94'}, 0.3)`
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      {total === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8 text-center"
        >
          <p className="text-sm text-slate-500">Aún no hay datos de engagement</p>
        </motion.div>
      )}
    </motion.div>
  );
}

