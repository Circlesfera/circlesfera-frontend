import { type ReactElement } from 'react';

import { MentionsFeedShell } from '@/modules/mentions/components/mentions-feed-shell';

export const metadata = {
  title: 'Menciones — CircleSfera'
};

export default function MentionsPage(): ReactElement {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="mb-8 rounded-2xl glass-card p-6 md:p-8 animate-fade-in">
        <h1 className="text-gradient-primary text-3xl font-bold md:text-4xl">
          Menciones
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
          Publicaciones donde fuiste mencionado
        </p>
      </div>
      <MentionsFeedShell />
    </main>
  );
}

