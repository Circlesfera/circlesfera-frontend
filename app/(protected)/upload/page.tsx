import { lazy, Suspense } from 'react';

import { UploadShellSkeleton } from '@/components/skeletons';

const UploadShell = lazy(() =>
  import('@/modules/upload/components/upload-shell').then((module) => ({
    default: module.UploadShell
  }))
);

export const metadata = {
  title: 'Crear publicación — CircleSfera'
};

export default function UploadPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-black px-6 py-8 text-white">
      <Suspense fallback={<UploadShellSkeleton />}>
        <UploadShell />
      </Suspense>
    </main>
  );
}

