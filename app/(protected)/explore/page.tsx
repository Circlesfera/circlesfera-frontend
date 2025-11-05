import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense, type ReactElement } from 'react';

import { ExploreGridShell } from '@/modules/explore/components/explore-grid-shell';
import { SuggestedUsersCarouselWrapper } from '@/modules/users/components/suggested-users-carousel-wrapper';

/**
 * Página de explorar. Requiere autenticación.
 */
export default async function ExplorePage(): Promise<ReactElement> {
  const cookieStore = await cookies();
  // El backend establece la cookie 'circlesfera_refresh' después del login
  const refreshCookie = cookieStore.get('circlesfera_refresh');

  if (!refreshCookie) {
    const headersList = await headers();
    const protocol = headersList.get('x-forwarded-proto') ?? 'http';
    const host = headersList.get('x-forwarded-host') ?? headersList.get('host');
    if (host) {
      redirect(`${protocol}://${host}/`);
    }
    redirect('/');
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* Header con card */}
        <div className="mb-8 rounded-2xl glass-card p-6 md:p-8 animate-fade-in border border-slate-200/50 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
              <svg className="size-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h1 className="text-gradient-primary text-3xl font-bold md:text-4xl">
              Explorar
            </h1>
          </div>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400/80 ml-[52px]">
            Descubre contenido nuevo y trending
          </p>
        </div>

        {/* Carousel de usuarios sugeridos - Integrado naturalmente */}
        <SuggestedUsersCarouselWrapper />

        {/* Grid de contenido - Enfoque completo */}
        <Suspense fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="size-8 animate-spin rounded-full border-[3px] border-primary-500 border-t-transparent mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Cargando contenido...</p>
            </div>
          </div>
        }>
          <ExploreGridShell />
        </Suspense>
      </div>
    </main>
  );
}

