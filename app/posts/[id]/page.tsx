import { cookies, headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { Suspense, type ReactElement } from 'react';

import { PostDetailShell } from '@/modules/posts/components/post-detail-shell';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getPost(postId: string): Promise<{ post: { id: string } } | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('circlesfera_session');

    if (!sessionCookie) {
      return null;
    }

    const response = await fetch(`${API_URL}/feed/${postId}`, {
      headers: {
        Cookie: sessionCookie.toString()
      },
      next: { revalidate: 60 }
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as { post: { id: string } };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return {
    title: `Publicación — CircleSfera`
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }): Promise<ReactElement> {
  const { id } = await params;

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

  const postData = await getPost(id);

  if (!postData) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-950 px-6 py-8 text-white">
      <Suspense fallback={<div className="py-16 text-center text-sm text-slate-400">Cargando publicación...</div>}>
        <PostDetailShell postId={id} />
      </Suspense>
    </main>
  );
}

