import { Suspense, type ReactElement } from 'react';

import { ArchivedPostsShell } from '@/modules/saved/components/archived-posts-shell';

export default function ArchivedPage(): ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-slate-950 px-6 py-16 text-white">
      <div className="w-full max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-white">Posts archivados</h1>
        <Suspense fallback={<div className="py-16 text-center text-sm text-slate-400">Cargando...</div>}>
          <ArchivedPostsShell />
        </Suspense>
      </div>
    </main>
  );
}

