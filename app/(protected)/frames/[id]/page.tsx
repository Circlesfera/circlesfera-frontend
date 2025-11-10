import { type ReactElement,Suspense } from 'react';

import { FrameDetailShell } from '@/modules/frames/components/frame-detail-shell';

interface FramePageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Frame — CircleSfera'
};

export default async function FrameDetailPage({ params }: FramePageProps): Promise<ReactElement> {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="text-white/80">Cargando frame...</div>
        </div>
      }
    >
      <FrameDetailShell frameId={id} />
    </Suspense>
  );
}
