'use client';

import { type ReactElement } from 'react';
import type { EngagementByType } from '../../../services/api/analytics';

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
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="mb-6 text-xl font-bold text-white">Engagement por Tipo</h2>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">{item.label}</span>
                <span className="text-sm text-slate-400">
                  {item.value.toLocaleString('es')} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

