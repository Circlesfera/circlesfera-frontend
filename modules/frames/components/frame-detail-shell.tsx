'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import React, { type ReactElement } from 'react';
import { toast } from 'sonner';

import { fadeUpVariants } from '@/lib/motion-config';
import { FeedItemComponent as FeedItemCard } from '@/modules/feed/components/feed-item';
import { getFrameById } from '@/services/api/frames';

import { enhanceFrameVideos } from '../utils/enhance-frame-videos';

interface FrameDetailShellProps {
  readonly frameId: string;
}

export function FrameDetailShell({ frameId }: FrameDetailShellProps): ReactElement {
  const frameQuery = useQuery({
    queryKey: ['frame', frameId],
    queryFn: () => getFrameById(frameId),
    staleTime: 1000 * 60 * 5
  });

  const frame = frameQuery.data?.frame ?? null;

  React.useEffect(() => {
    if (frameQuery.isError) {
      toast.error('No se pudo cargar el frame');
    }
  }, [frameQuery.isError]);

  React.useEffect(() => {
    enhanceFrameVideos('[data-frame-player="true"] video');
  }, [frame?.id]);

  if (frameQuery.isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_55%)]" />
        <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card flex flex-col items-center gap-6 rounded-3xl border border-white/10 px-10 py-12 text-center shadow-elegant-lg"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 blur-2xl" />
              <div className="relative size-16 animate-spin rounded-full border-[3px] border-primary-500/20 border-t-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Cargando frame</h3>
              <p className="text-sm text-white/70">Estamos preparando la experiencia completa.</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (frameQuery.isError || !frame) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center text-foreground-muted">
          <h2 className="text-lg font-semibold">Frame no encontrado</h2>
          <p className="mt-2 text-sm">Es posible que haya sido eliminado o no tengas acceso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_55%)]" />

      <div className="relative mx-auto flex w-full justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-sm">
          <motion.section
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex w-full flex-col"
            data-frame-player="true"
          >
            <FeedItemCard item={frame} />
          </motion.section>
        </div>
      </div>
    </div>
  );
}
