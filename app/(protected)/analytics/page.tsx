import { Suspense, type ReactElement } from 'react';

import { AnalyticsShell } from '@/modules/analytics/components/analytics-shell';

export const metadata = {
  title: 'Analytics — CircleSfera'
};

export default function AnalyticsPage(): ReactElement {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold">Analytics</h1>
        <Suspense fallback={<div className="p-6 text-sm text-slate-400">Cargando analytics...</div>}>
          <AnalyticsShell />
        </Suspense>
      </div>
    </main>
  );
}

