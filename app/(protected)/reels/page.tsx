import { lazy, Suspense, type ReactElement } from 'react';

const ReelsShell = lazy(() =>
  import('@/modules/reels/components/reels-shell').then((module) => ({
    default: module.ReelsShell
  }))
);

export const metadata = {
  title: 'Reels — CircleSfera'
};

export default function ReelsPage(): ReactElement {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-pulse text-slate-400">Cargando reels...</div>
        </div>
      }
    >
      <ReelsShell />
    </Suspense>
  );
}

