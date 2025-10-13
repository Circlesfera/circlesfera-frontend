/**
 * 🎯 ACCESSIBILITY HELPERS
 * ========================
 * Funciones y constantes para mejorar la accesibilidad (WCAG 2.1 AA)
 */

/**
 * Genera un ID único para asociar labels con inputs
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * ARIA Labels estándar para componentes comunes
 */
export const ARIA_LABELS = {
  // Navegación
  navigation: {
    home: 'Ir a la página de inicio',
    explore: 'Explorar contenido',
    search: 'Buscar usuarios, posts y reels',
    messages: 'Ver mensajes directos',
    notifications: 'Ver notificaciones',
    profile: 'Ver tu perfil',
    settings: 'Configuración de la cuenta',
    reels: 'Ver videos cortos (Reels)',
    stories: 'Ver historias',
    feed: 'Ver tu feed personalizado',
    cstv: 'Ver contenido de CSTV',
    live: 'Ver transmisiones en vivo',
  },

  // Acciones de post
  post: {
    like: (isLiked: boolean) => isLiked ? 'Ya no me gusta' : 'Me gusta esta publicación',
    likeCount: (count: number) => `${count} me gusta`,
    comment: 'Comentar esta publicación',
    commentCount: (count: number) => `${count} comentarios`,
    share: 'Compartir esta publicación',
    save: (isSaved: boolean) => isSaved ? 'Quitar de guardados' : 'Guardar publicación',
    more: 'Más opciones de esta publicación',
    delete: 'Eliminar publicación',
    edit: 'Editar publicación',
    report: 'Reportar esta publicación',
  },

  // Usuario
  user: {
    follow: (isFollowing: boolean) => isFollowing ? 'Dejar de seguir' : 'Seguir',
    avatar: (username: string) => `Avatar de ${username}`,
    profile: (username: string) => `Ver perfil de ${username}`,
  },

  // Formularios
  form: {
    submit: 'Enviar formulario',
    cancel: 'Cancelar',
    close: 'Cerrar',
    upload: 'Subir archivo',
    search: 'Buscar',
  },

  // Media
  media: {
    image: (index: number, total: number) => `Imagen ${index} de ${total}`,
    video: 'Reproducir video',
    videoPause: 'Pausar video',
    nextImage: 'Siguiente imagen',
    prevImage: 'Imagen anterior',
    zoom: 'Ampliar imagen',
  },

  // Menús
  menu: {
    open: 'Abrir menú',
    close: 'Cerrar menú',
    toggle: (isOpen: boolean) => isOpen ? 'Cerrar menú' : 'Abrir menú',
    user: 'Menú de usuario',
    create: 'Menú de creación de contenido',
  },

  // Estados
  loading: 'Cargando...',
  error: 'Error',
  success: 'Éxito',
} as const

/**
 * Roles ARIA estándar
 */
export const ARIA_ROLES = {
  navigation: 'navigation',
  menu: 'menu',
  menuitem: 'menuitem',
  button: 'button',
  link: 'link',
  dialog: 'dialog',
  alert: 'alert',
  status: 'status',
  search: 'search',
  form: 'form',
  main: 'main',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
} as const

/**
 * Props comunes de accesibilidad para botones
 */
export function getButtonA11yProps(label: string, options?: {
  pressed?: boolean
  expanded?: boolean
  controls?: string
  disabled?: boolean
}) {
  return {
    'aria-label': label,
    ...(options?.pressed !== undefined && { 'aria-pressed': options.pressed }),
    ...(options?.expanded !== undefined && { 'aria-expanded': options.expanded }),
    ...(options?.controls && { 'aria-controls': options.controls }),
    ...(options?.disabled && { 'aria-disabled': true }),
  }
}

/**
 * Props comunes de accesibilidad para links
 */
export function getLinkA11yProps(label: string, options?: {
  current?: boolean
  external?: boolean
}) {
  return {
    'aria-label': label,
    ...(options?.current && { 'aria-current': 'page' }),
    ...(options?.external && {
      rel: 'noopener noreferrer',
      target: '_blank',
    }),
  }
}

/**
 * Props para menús desplegables accesibles
 */
export function getMenuA11yProps(id: string, isOpen: boolean) {
  return {
    role: ARIA_ROLES.menu,
    id,
    'aria-hidden': !isOpen,
    ...(isOpen && { tabIndex: -1 }),
  }
}

/**
 * Props para botones que abren menús
 */
export function getMenuButtonA11yProps(label: string, menuId: string, isOpen: boolean) {
  return {
    ...getButtonA11yProps(label, { expanded: isOpen, controls: menuId }),
    'aria-haspopup': 'menu' as const,
  }
}

/**
 * Verifica si un contraste es suficiente para WCAG 2.1 AA
 * @param contrast - Ratio de contraste (ej: 4.5)
 * @param level - 'normal' (4.5:1) o 'large' (3:1)
 */
export function isContrastSufficient(contrast: number, level: 'normal' | 'large' = 'normal'): boolean {
  const minContrast = level === 'large' ? 3 : 4.5
  return contrast >= minContrast
}

/**
 * Constantes de tamaño mínimo táctil WCAG 2.1
 */
export const TOUCH_TARGET = {
  MIN_WIDTH: 44, // px
  MIN_HEIGHT: 44, // px
  RECOMMENDED_WIDTH: 48, // px
  RECOMMENDED_HEIGHT: 48, // px
} as const

/**
 * Clases Tailwind para tamaño mínimo táctil
 */
export const TOUCH_TARGET_CLASSES = {
  min: 'min-w-[44px] min-h-[44px]',
  recommended: 'min-w-[48px] min-h-[48px]',
  small: 'min-w-[40px] min-h-[40px]', // Solo para elementos no críticos
} as const

/**
 * Helper para anunciar cambios a screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Skip link para navegación por teclado
 */
export const SKIP_LINK_ID = 'main-content'

/**
 * Props para el skip link
 */
export function getSkipLinkProps() {
  return {
    href: `#${SKIP_LINK_ID}`,
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[9999] focus:p-4 focus:bg-blue-600 focus:text-white',
    children: 'Saltar al contenido principal',
  }
}

