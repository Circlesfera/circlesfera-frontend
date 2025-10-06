/**
 * Sistema de Analytics para CircleSfera
 * Tracking de eventos y métricas de usuario
 */

export type AnalyticsEvent =
  | 'page_view'
  | 'post_created'
  | 'post_liked'
  | 'post_shared'
  | 'post_commented'
  | 'reel_viewed'
  | 'reel_created'
  | 'reel_liked'
  | 'story_viewed'
  | 'story_created'
  | 'user_followed'
  | 'message_sent'
  | 'search_performed'
  | 'profile_viewed'
  | 'settings_changed';

interface AnalyticsEventData {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

/**
 * Enviar evento de analytics
 */
export const trackEvent = (
  event: AnalyticsEvent,
  data?: Partial<AnalyticsEventData>
): void => {
  try {
    const eventData: AnalyticsEventData = {
      category: data?.category || 'General',
      action: event,
      ...(data?.label && { label: data.label }),
      ...(data?.value !== undefined && { value: data.value }),
      metadata: {
        ...data?.metadata,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      }
    };

    // Enviar a Google Analytics si está configurado
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        event_category: eventData.category,
        event_label: eventData.label,
        value: eventData.value,
        ...eventData.metadata
      });
    }

    // Enviar a backend para analytics propias
    sendToBackend(event, eventData);

    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event, eventData);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

/**
 * Enviar evento al backend
 */
const sendToBackend = async (
  event: AnalyticsEvent,
  data: AnalyticsEventData
): Promise<void> => {
  try {
    // Solo enviar en producción
    if (process.env.NODE_ENV !== 'production') return;

    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event,
        ...data
      }),
      keepalive: true // Enviar incluso si el usuario cierra la página
    });
  } catch (error) {
    // Silenciar errores de analytics para no afectar UX
    console.debug('Analytics backend error:', error);
  }
};

/**
 * Track pageview
 */
export const trackPageView = (url: string, title?: string): void => {
  trackEvent('page_view', {
    category: 'Navigation',
    label: url,
    metadata: {
      title: title || document.title,
      referrer: document.referrer
    }
  });
};

/**
 * Track interacción con post
 */
export const trackPostInteraction = (
  action: 'created' | 'liked' | 'shared' | 'commented',
  postId: string
): void => {
  const eventMap = {
    created: 'post_created',
    liked: 'post_liked',
    shared: 'post_shared',
    commented: 'post_commented'
  } as const;

  trackEvent(eventMap[action] as AnalyticsEvent, {
    category: 'Posts',
    label: postId
  });
};

/**
 * Track interacción con reel
 */
export const trackReelInteraction = (
  action: 'viewed' | 'created' | 'liked',
  reelId: string,
  duration?: number
): void => {
  const eventMap = {
    viewed: 'reel_viewed',
    created: 'reel_created',
    liked: 'reel_liked'
  } as const;

  trackEvent(eventMap[action] as AnalyticsEvent, {
    category: 'Reels',
    label: reelId,
    ...(duration !== undefined && {
      value: duration,
      metadata: {
        watchTime: duration
      }
    })
  });
};

/**
 * Track interacción con story
 */
export const trackStoryInteraction = (
  action: 'viewed' | 'created',
  storyId: string
): void => {
  const eventMap = {
    viewed: 'story_viewed',
    created: 'story_created'
  } as const;

  trackEvent(eventMap[action] as AnalyticsEvent, {
    category: 'Stories',
    label: storyId
  });
};

/**
 * Track seguimiento de usuario
 */
export const trackUserFollow = (userId: string): void => {
  trackEvent('user_followed', {
    category: 'Social',
    label: userId
  });
};

/**
 * Track envío de mensaje
 */
export const trackMessageSent = (conversationId: string): void => {
  trackEvent('message_sent', {
    category: 'Messages',
    label: conversationId
  });
};

/**
 * Track búsqueda
 */
export const trackSearch = (query: string, resultsCount: number): void => {
  trackEvent('search_performed', {
    category: 'Search',
    label: query,
    value: resultsCount
  });
};

/**
 * Track visita a perfil
 */
export const trackProfileView = (username: string): void => {
  trackEvent('profile_viewed', {
    category: 'Profile',
    label: username
  });
};

/**
 * Track cambio de configuración
 */
export const trackSettingsChange = (setting: string): void => {
  trackEvent('settings_changed', {
    category: 'Settings',
    label: setting
  });
};

/**
 * Inicializar analytics
 */
export const initAnalytics = (): void => {
  // Track primera pageview
  if (typeof window !== 'undefined') {
    trackPageView(window.location.pathname);

    // Track cambios de ruta
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      trackPageView(window.location.pathname);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      trackPageView(window.location.pathname);
    };
  }
};

