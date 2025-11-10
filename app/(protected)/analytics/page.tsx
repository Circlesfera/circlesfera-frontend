import { lazy, type ReactElement,Suspense } from 'react';

import { AnalyticsShellSkeleton } from '@/components/skeletons';

const AnalyticsShell = lazy(() =>
  import('@/modules/analytics/components/analytics-shell').then((module) => ({
    default: module.AnalyticsShell
  }))
);

export const metadata = {
  title: 'Analytics — CircleSfera'
};

export default function AnalyticsPage(): ReactElement {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="mb-8 rounded-2xl glass-card p-6 md:p-8 animate-fade-in">
        <h1 className="text-gradient-primary text-3xl font-bold md:text-4xl">
          Analytics
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-400">
          Analiza el rendimiento de tu contenido y audiencia
        </p>
      </div>
      <Suspense fallback={<AnalyticsShellSkeleton />}>
        <AnalyticsShell />
      </Suspense>
    </main>
  );
}

