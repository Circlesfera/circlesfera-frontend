import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense, type ReactElement } from 'react';

import { NotificationsShell } from '@/modules/notifications/components/notifications-shell';

/**
 * Página de notificaciones. Requiere autenticación.
 */
export default async function NotificationsPage(): Promise<ReactElement> {
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

  return (
    <main className="flex h-full flex-col">
      <div className="border-b border-white/10 bg-slate-950/80 px-6 py-4">
        <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
      </div>
      <Suspense fallback={<div className="p-6 text-sm text-slate-400">Cargando notificaciones...</div>}>
        <NotificationsShell />
      </Suspense>
    </main>
  );
}

