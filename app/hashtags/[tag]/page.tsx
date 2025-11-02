import { cookies, headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { Suspense, type ReactElement } from 'react';

import { HashtagPostsShell } from '@/modules/hashtags/components/hashtag-posts-shell';
import { getHashtagPosts } from '@/services/api/hashtags';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getHashtagInfo(tag: string): Promise<{ tag: string; postCount: number } | null> {
  try {
    // Verificar que el hashtag existe buscándolo
    const response = await fetch(`${API_URL}/hashtags/search?q=${encodeURIComponent(tag)}&limit=1`, {
      headers: {
        Cookie: (await cookies()).toString()
      },
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { hashtags: Array<{ tag: string; postCount: number }> };
    const hashtag = data.hashtags.find((h) => h.tag.toLowerCase() === tag.toLowerCase());

    return hashtag ? { tag: hashtag.tag, postCount: hashtag.postCount } : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const resolvedParams = await params;
  const tag = resolvedParams.tag.replace(/^#/, '');
  return {
    title: `#${tag} — CircleSfera`
  };
}

export default async function HashtagPage({ params }: { params: Promise<{ tag: string }> }): Promise<ReactElement> {
  const { tag } = await params;
  const normalizedTag = tag.replace(/^#/, '').toLowerCase();

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('circlesfera_session');

  if (!sessionCookie) {
    const headersList = await headers();
    const protocol = headersList.get('x-forwarded-proto') ?? 'http';
    const host = headersList.get('x-forwarded-host') ?? headersList.get('host');
    if (host) {
      redirect(`${protocol}://${host}/`);
    }
    redirect('/');
  }

  const hashtagInfo = await getHashtagInfo(normalizedTag);

  if (!hashtagInfo) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-slate-950 px-6 py-8 text-white">
      <div className="w-full max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold text-white">#{hashtagInfo.tag}</h1>
        <p className="text-sm text-slate-400">{hashtagInfo.postCount.toLocaleString('es')} publicaciones</p>
      </div>

      <Suspense fallback={<div className="py-16 text-center text-sm text-slate-400">Cargando publicaciones...</div>}>
        <HashtagPostsShell tag={normalizedTag} />
      </Suspense>
    </main>
  );
}

