import { lazy, type ReactElement,Suspense } from 'react';

const FramesShell = lazy(() =>
  import('@/modules/frames/components/frames-shell').then((module) => ({
    default: module.FramesShell
  }))
);

export const metadata = {
  title: 'Frames — CircleSfera'
};

export default function FramesPage(): ReactElement {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-pulse text-slate-600 dark:text-slate-400">Cargando frames...</div>
        </div>
      }
    >
      <FramesShell />
    </Suspense>
  );
}

