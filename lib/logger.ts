/**
 * Logger simple para el frontend. En producción, puede integrarse con servicios de logging
 * como Sentry o simplemente deshabilitarse.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  error: (message: string, ...args: unknown[]): void => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, ...args);
    }
    // En producción, enviar a servicio de logging (Sentry, etc.)
  },
  warn: (message: string, ...args: unknown[]): void => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: unknown[]): void => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: unknown[]): void => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};

