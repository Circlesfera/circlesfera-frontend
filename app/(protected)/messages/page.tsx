import { lazy, Suspense } from 'react';

import { MessagesShellSkeleton } from '@/components/skeletons';

const MessagesShell = lazy(() =>
  import('@/modules/messaging/components/messages-shell').then((module) => ({
    default: module.MessagesShell
  }))
);

export const metadata = {
  title: 'Mensajes — CircleSfera'
};

export default function MessagesPage() {
  return (
    <main className="flex min-h-screen flex-col text-white">
      <Suspense fallback={<MessagesShellSkeleton />}>
        <MessagesShell />
      </Suspense>
    </main>
  );
}

