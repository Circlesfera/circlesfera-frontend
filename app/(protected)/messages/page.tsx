import type { Metadata } from 'next';
import type { JSX } from 'react';
import { lazy, Suspense } from 'react';

import { MessagesShellSkeleton } from '@/components/skeletons';

const MessagesShell = lazy(() =>
  import('@/modules/messaging/components/messages-shell').then((module) => ({
    default: module.MessagesShell
  }))
);

export const metadata: Metadata = {
  title: 'Mensajes — CircleSfera'
};

export default function MessagesPage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col text-slate-900 dark:text-white">
      <Suspense fallback={<MessagesShellSkeleton />}>
        <MessagesShell />
      </Suspense>
    </main>
  );
}

