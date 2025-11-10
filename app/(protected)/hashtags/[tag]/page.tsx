import { type ReactElement,Suspense } from 'react';

import { HashtagHeader } from '@/modules/hashtags/components/hashtag-header';
import { HashtagPostsShell } from '@/modules/hashtags/components/hashtag-posts-shell';

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<{ title: string }> {
  const { tag } = await params;
  const normalizedTag = tag.replace(/^#/, '').toLowerCase().trim();
  return {
    title: `#${normalizedTag} — CircleSfera`
  };
}

export default async function HashtagPage({ params }: { params: Promise<{ tag: string }> }): Promise<ReactElement> {
  const { tag } = await params;
  const normalizedTag = tag.replace(/^#/, '').toLowerCase().trim();

  return (
    <main className="flex min-h-screen flex-col items-center gap-10 px-6 py-16 text-slate-900 dark:text-white">
      <Suspense fallback={<div className="py-16 text-center text-sm text-slate-600 dark:text-slate-400">Cargando...</div>}>
        <HashtagHeader tag={normalizedTag} />
      </Suspense>
      <Suspense fallback={<div className="py-16 text-center text-sm text-slate-600 dark:text-slate-400">Cargando publicaciones...</div>}>
        <HashtagPostsShell tag={normalizedTag} />
      </Suspense>
    </main>
  );
}

