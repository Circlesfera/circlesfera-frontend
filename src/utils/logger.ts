/**
 * Logger Service - Solo loggea en desarrollo
 * NO hardcodear console.log directamente en el código
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Tipos de log levels
type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

/**
 * Logger condicional que solo funciona en desarrollo
 */
class Logger {
  private shouldLog(level: LogLevel): boolean {
    // En test, solo errores
    if (isTest) {
      return level === 'error';
    }

    // En desarrollo, todo
    if (isDevelopment) {
      return true;
    }

    // En producción, solo errores críticos
    return level === 'error';
  }

  /**
   * Log general (solo desarrollo)
   */
  log(...args: unknown[]): void {
    if (this.shouldLog('log')) {
      console.log(...args);
    }
  }

  /**
   * Información (solo desarrollo)
   */
  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(...args);
    }
  }

  /**
   * Advertencia (desarrollo y producción)
   */
  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...args);
    }
  }

  /**
   * Error (siempre, incluso en producción)
   */
  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      // Serializar objetos complejos para mejor debugging
      const serializedArgs = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return arg;
      });
      console.error(...serializedArgs);
    }

    // En producción, también enviar a servicio de monitoreo
    if (!isDevelopment && !isTest) {
      this.sendToMonitoring(args);
    }
  }

  /**
   * Debug detallado (solo desarrollo)
   */
  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(...args);
    }
  }

  /**
   * Tabla (solo desarrollo)
   */
  table(data: unknown): void {
    if (this.shouldLog('log')) {
      console.table(data);
    }
  }

  /**
   * Group (solo desarrollo)
   */
  group(label: string): void {
    if (this.shouldLog('log')) {
      console.group(label);
    }
  }

  /**
   * Group End (solo desarrollo)
   */
  groupEnd(): void {
    if (this.shouldLog('log')) {
      console.groupEnd();
    }
  }

  /**
   * Time (solo desarrollo)
   */
  time(label: string): void {
    if (this.shouldLog('debug')) {
      console.time(label);
    }
  }

  /**
   * Time End (solo desarrollo)
   */
  timeEnd(label: string): void {
    if (this.shouldLog('debug')) {
      console.timeEnd(label);
    }
  }

  /**
   * Enviar error a servicio de monitoreo (producción)
   */
  private sendToMonitoring(args: unknown[]): void {
    // ✅ CORREGIDO: Tipar window con interfaz extendida
    interface WindowWithSentry extends Window {
      Sentry?: {
        captureException: (error: Error) => void;
      };
    }

    const globalWindow = window as WindowWithSentry;

    // Aquí iría la integración con Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && globalWindow.Sentry) {
      globalWindow.Sentry.captureException(new Error(JSON.stringify(args)));
    }
  }

  /**
   * Log de API request (útil para debugging)
   */
  apiRequest(method: string, url: string, data?: unknown): void {
    if (this.shouldLog('debug')) {
      console.group(`🌐 API ${method} ${url}`);
      if (data) {
        console.log('Data:', data);
      }
      console.groupEnd();
    }
  }

  /**
   * Log de API response (útil para debugging)
   */
  apiResponse(method: string, url: string, status: number, data?: unknown): void {
    if (this.shouldLog('debug')) {
      const emoji = status >= 200 && status < 300 ? '✅' : '❌';
      console.group(`${emoji} API ${method} ${url} - ${status}`);
      if (data) {
        console.log('Response:', data);
      }
      console.groupEnd();
    }
  }

  /**
   * Log de estado de componente (útil para debugging)
   */
  componentState(componentName: string, state: unknown): void {
    if (this.shouldLog('debug')) {
      console.log(`🔄 [${componentName}] State:`, state);
    }
  }

  /**
   * Log de evento de usuario (útil para analytics)
   */
  userEvent(eventName: string, properties?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      console.log(`👤 Event: ${eventName}`, properties);
    }

    // ✅ CORREGIDO: Tipar window con interfaz extendida
    interface WindowWithGTag extends Window {
      gtag?: (command: string, eventName: string, properties?: Record<string, unknown>) => void;
    }

    const globalWindow = window as WindowWithGTag;

    // En producción, enviar a analytics
    if (!isDevelopment && typeof window !== 'undefined') {
      if (globalWindow.gtag) {
        globalWindow.gtag('event', eventName, properties);
      }
    }
  }

  /**
   * Log de performance (útil para optimización)
   */
  performance(label: string, duration: number): void {
    if (this.shouldLog('debug')) {
      console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
    }
  }
}

// Singleton
const logger = new Logger();

export default logger;

// Export también las funciones individuales para importación directa
export const {
  log,
  info,
  warn,
  error,
  debug,
  table,
  group,
  groupEnd,
  time,
  timeEnd,
  apiRequest,
  apiResponse,
  componentState,
  userEvent,
  performance: logPerformance
} = logger;

