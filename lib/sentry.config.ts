import { clientEnv } from './env';

/**
 * Inicializa Sentry para error tracking en el frontend.
 * Solo se inicializa si NEXT_PUBLIC_SENTRY_DSN está configurado y Sentry está instalado.
 */
export const initSentry = (): void => {
  if (!clientEnv.NEXT_PUBLIC_SENTRY_DSN) {
    return; // Sentry no configurado, continuar sin él
  }

  // Dynamic import para evitar errores si Sentry no está instalado
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - Sentry es opcional y puede no estar instalado
  import('@sentry/nextjs').then((Sentry) => {
  Sentry.init({
    dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Session replay (opcional, solo en producción para debugging)
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,
    // Ignorar errores esperados
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'NetworkError',
      'Failed to fetch'
    ],
    // Filtros de URLs
      beforeSend(event: unknown, hint: unknown): unknown {
      // No enviar errores de desarrollo local
      if (process.env.NODE_ENV === 'development') {
        // Solo loguear en consola
        console.error('Sentry error (dev mode):', event, hint);
        return null; // No enviar a Sentry en desarrollo
      }
      return event;
    }
    });
  }).catch(() => {
    // Sentry no disponible, ignorar silenciosamente
  });
};

