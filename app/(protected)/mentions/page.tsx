import { type ReactElement } from 'react';

import { MentionsFeedShell } from '@/modules/mentions/components/mentions-feed-shell';

export const metadata = {
  title: 'Menciones — CircleSfera'
};

export default function MentionsPage(): ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-950 text-white">
      <MentionsFeedShell />
    </main>
  );
}

