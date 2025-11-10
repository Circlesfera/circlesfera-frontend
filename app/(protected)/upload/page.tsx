import type { Metadata } from 'next';
import type { JSX } from 'react';
import { lazy, Suspense } from 'react';

import { UploadShellSkeleton } from '@/components/skeletons';

const UploadShell = lazy(() =>
  import('@/modules/upload/components/upload-shell').then((module) => ({
    default: module.UploadShell
  }))
);

export const metadata: Metadata = {
  title: 'Crear contenido — CircleSfera'
};

export default function UploadPage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-8 text-white">
      <Suspense fallback={<UploadShellSkeleton />}>
        <UploadShell />
      </Suspense>
    </main>
  );
}

