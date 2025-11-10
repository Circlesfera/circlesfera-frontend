import { refreshSession } from '@/services/api/auth';
import { sessionStore } from '@/store/session';

let refreshTimer: NodeJS.Timeout | null = null;

/**
 * Configura un timer para refrescar el token automáticamente antes de que expire.
 * Refresca cuando quedan 60 segundos antes de la expiración (o 10% del tiempo total, lo que sea menor).
 */
export const setupTokenRefresh = (): void => {
  // Limpiar timer anterior si existe
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  const state = sessionStore.getState();
  
  // Solo configurar si hay token y tiempo de expiración
  if (!state.accessToken || !state.expiresAt) {
    return;
  }

  const now = Date.now();
  const expiresAt = state.expiresAt;
  const timeUntilExpiry = expiresAt - now;
  
  // No configurar si ya expiró o queda muy poco tiempo
  if (timeUntilExpiry <= 0) {
    return;
  }

  // Calcular cuándo refrescar: 60 segundos antes o 10% del tiempo restante (lo que sea menor)
  const refreshBuffer = Math.min(60_000, timeUntilExpiry * 0.1);
  const refreshTime = timeUntilExpiry - refreshBuffer;

  // Si el tiempo de refresh ya pasó, refrescar inmediatamente
  if (refreshTime <= 0) {
    void refreshTokenNow();
    return;
  }

  refreshTimer = setTimeout(() => {
    void refreshTokenNow();
  }, refreshTime);
};

/**
 * Refresca el token de acceso inmediatamente.
 */
const refreshTokenNow = async (): Promise<void> => {
  try {
    const tokens = await refreshSession();
    
    // Actualizar el store con el nuevo token
    sessionStore.setState({
      accessToken: tokens.accessToken,
      expiresAt: Date.now() + tokens.expiresIn * 1000
    });

    // Configurar el próximo refresh
    setupTokenRefresh();
  } catch {
    // Si falla el refresh, verificar si el token todavía no ha expirado
    // Solo limpiar si realmente expiró o es un error de autenticación
    const state = sessionStore.getState();
    const now = Date.now();
    
    // Si el token ya expiró (más de 5 minutos de margen), limpiar sesión
    if (!state.expiresAt || state.expiresAt < now - 5 * 60 * 1000) {
      const { clearSession } = sessionStore.getState();
      console.error('Token expirado y refresh falló, limpiando sesión');
      clearSession();
    } else {
      // Si todavía no expiró, intentar configurar el refresh de nuevo en un momento posterior
      // Esto maneja errores temporales de red
      const timeUntilExpiry = (state.expiresAt ?? now) - now;
      if (timeUntilExpiry > 0) {
        // Reintentar en 30 segundos o cuando quede el 50% del tiempo, lo que sea menor
        const retryTime = Math.min(30_000, timeUntilExpiry * 0.5);
        refreshTimer = setTimeout(() => {
          void refreshTokenNow();
        }, retryTime);
      }
    }
  }
};

/**
 * Limpia el timer de refresh.
 */
export const clearTokenRefresh = (): void => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};

