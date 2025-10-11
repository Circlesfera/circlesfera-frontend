/**
 * Mensajes de UI Centralizados
 * NO hardcodear strings en componentes, usar este archivo
 */

export const UI_MESSAGES = {
  // Autenticación
  AUTH: {
    LOGIN_REQUIRED: 'Debes iniciar sesión para continuar',
    LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
    SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente',
    UNAUTHORIZED: 'No tienes autorización para realizar esta acción',
  },

  // Posts
  POSTS: {
    CREATE_TITLE: 'Crear publicación',
    CREATE_SUBTITLE: 'Comparte fotos y videos con tus amigos',
    SELECT_IMAGE: 'Selecciona una imagen',
    SELECT_VIDEO: 'Selecciona un video',
    DRAG_DROP: 'Arrastra y suelta aquí',
    OR: 'o',
    CLICK_SELECT: 'Haz clic para seleccionar',
    CAPTION_PLACEHOLDER: '¿Qué estás pensando?',
    LOCATION_PLACEHOLDER: 'Agregar ubicación',
    TAGS_PLACEHOLDER: '#hashtags (separados por coma)',
    CREATING: 'Creando publicación...',
    CREATED_SUCCESS: 'Publicación creada exitosamente',
    CREATE_ERROR: 'Error al crear la publicación',
    DELETE_CONFIRM: '¿Estás seguro de eliminar esta publicación?',
    DELETED_SUCCESS: 'Publicación eliminada',
  },

  // Comments
  COMMENTS: {
    WRITE_PLACEHOLDER: 'Escribe un comentario...',
    SEND: 'Enviar',
    SENDING: 'Enviando...',
    LOAD_MORE: 'Cargar más comentarios',
    NO_COMMENTS: 'No hay comentarios aún',
    BE_FIRST: 'Sé el primero en comentar',
    LOAD_ERROR: 'Error al cargar comentarios',
    POST_ERROR: 'Error al publicar comentario',
    DELETE_CONFIRM: '¿Eliminar este comentario?',
    DELETED_SUCCESS: 'Comentario eliminado',
    EMPTY_ERROR: 'El comentario no puede estar vacío',
    LOGIN_REQUIRED: 'Debes iniciar sesión para comentar',
  },

  // Stories
  STORIES: {
    CREATE_TITLE: 'Crear historia',
    CREATE_SUBTITLE: 'Comparte un momento que desaparecerá en 24 horas',
    YOUR_STORY: 'Tu historia',
    VIEW_STORY: 'Ver historia',
    NO_STORIES: 'No hay historias disponibles',
    CREATING: 'Creando historia...',
    CREATED_SUCCESS: 'Historia creada exitosamente',
    CREATE_ERROR: 'Error al crear historia',
    EXPIRED: 'Esta historia ha expirado',
    TYPE_IMAGE: 'Imagen',
    TYPE_VIDEO: 'Video',
    TYPE_TEXT: 'Texto',
  },

  // Reels
  REELS: {
    CREATE_TITLE: 'Crear reel',
    CREATE_SUBTITLE: 'Comparte un video corto',
    NO_REELS: 'No hay reels disponibles',
    CREATING: 'Creando reel...',
    CREATED_SUCCESS: 'Reel creado exitosamente',
    CREATE_ERROR: 'Error al crear reel',
    DURATION_ERROR: 'El video debe durar entre 3 y 60 segundos',
  },

  // Profile
  PROFILE: {
    EDIT: 'Editar perfil',
    EDIT_TITLE: 'Editar tu perfil',
    SAVE: 'Guardar cambios',
    SAVING: 'Guardando...',
    SAVED_SUCCESS: 'Perfil actualizado exitosamente',
    SAVE_ERROR: 'Error al actualizar perfil',
    CANCEL: 'Cancelar',
    FOLLOW: 'Seguir',
    FOLLOWING: 'Siguiendo',
    UNFOLLOW: 'Dejar de seguir',
    FOLLOWERS: 'Seguidores',
    FOLLOWING_LIST: 'Siguiendo',
    POSTS: 'Publicaciones',
    NO_POSTS: 'No hay publicaciones aún',
    NO_POSTS_YET: 'Aún no has publicado nada',
    PRIVATE_ACCOUNT: 'Esta cuenta es privada',
    FOLLOW_TO_SEE: 'Síguelo para ver sus publicaciones',
  },

  // Messages
  MESSAGES: {
    NO_CONVERSATIONS: 'No hay conversaciones',
    START_CONVERSATION: 'Inicia una conversación',
    TYPE_MESSAGE: 'Escribe un mensaje...',
    SENDING: 'Enviando...',
    SENT_SUCCESS: 'Mensaje enviado',
    SEND_ERROR: 'Error al enviar mensaje',
    DELETE_CONFIRM: '¿Eliminar este mensaje?',
    DELETED_SUCCESS: 'Mensaje eliminado',
    LOAD_MORE: 'Cargar mensajes anteriores',
    ONLINE: 'En línea',
    OFFLINE: 'Desconectado',
    TYPING: 'Escribiendo...',
  },

  // Notifications
  NOTIFICATIONS: {
    TITLE: 'Notificaciones',
    NO_NOTIFICATIONS: 'No tienes notificaciones',
    MARK_ALL_READ: 'Marcar todas como leídas',
    NEW: 'Nueva',
    LIKE_POST: 'le gustó tu publicación',
    COMMENT_POST: 'comentó tu publicación',
    FOLLOW_YOU: 'comenzó a seguirte',
    MENTION_POST: 'te mencionó en una publicación',
    MENTION_COMMENT: 'te mencionó en un comentario',
  },

  // Search
  SEARCH: {
    PLACEHOLDER: 'Buscar usuarios, hashtags...',
    NO_RESULTS: 'No se encontraron resultados',
    SEARCHING: 'Buscando...',
    RECENT_SEARCHES: 'Búsquedas recientes',
    CLEAR_ALL: 'Borrar todo',
    MIN_CHARS: 'Escribe al menos 2 caracteres',
  },

  // Explore
  EXPLORE: {
    TITLE: 'Explorar',
    TRENDING: 'Tendencias',
    RECENT: 'Recientes',
    POPULAR: 'Populares',
    FOR_YOU: 'Para ti',
    NO_CONTENT: 'No hay contenido disponible',
  },

  // Settings
  SETTINGS: {
    TITLE: 'Configuración',
    ACCOUNT: 'Cuenta',
    PRIVACY: 'Privacidad',
    NOTIFICATIONS: 'Notificaciones',
    SECURITY: 'Seguridad',
    HELP: 'Ayuda',
    ABOUT: 'Acerca de',
    LOGOUT: 'Cerrar sesión',
    LOGOUT_CONFIRM: '¿Estás seguro de cerrar sesión?',
    PRIVATE_ACCOUNT: 'Cuenta privada',
    PRIVATE_DESCRIPTION: 'Solo tus seguidores pueden ver tus publicaciones',
  },

  // Upload
  UPLOAD: {
    UPLOADING: 'Subiendo...',
    UPLOAD_SUCCESS: 'Archivo subido exitosamente',
    UPLOAD_ERROR: 'Error al subir archivo',
    FILE_TOO_LARGE: 'El archivo es demasiado grande',
    INVALID_TYPE: 'Tipo de archivo no permitido',
    MAX_FILES: 'Máximo de archivos alcanzado',
    DRAG_HERE: 'Arrastra el archivo aquí',
    SELECT_FILE: 'Seleccionar archivo',
  },

  // Forms
  FORMS: {
    REQUIRED_FIELD: 'Este campo es requerido',
    INVALID_EMAIL: 'Email inválido',
    INVALID_USERNAME: 'Nombre de usuario inválido',
    PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
    PASSWORDS_NO_MATCH: 'Las contraseñas no coinciden',
    INVALID_URL: 'URL inválida',
    CHANGES_SAVED: 'Cambios guardados',
    UNSAVED_CHANGES: 'Tienes cambios sin guardar',
  },

  // General
  GENERAL: {
    LOADING: 'Cargando...',
    ERROR: 'Ocurrió un error',
    RETRY: 'Reintentar',
    CANCEL: 'Cancelar',
    CONFIRM: 'Confirmar',
    DELETE: 'Eliminar',
    EDIT: 'Editar',
    SAVE: 'Guardar',
    CLOSE: 'Cerrar',
    BACK: 'Volver',
    NEXT: 'Siguiente',
    PREVIOUS: 'Anterior',
    YES: 'Sí',
    NO: 'No',
    OK: 'OK',
    CONTINUE: 'Continuar',
    SKIP: 'Omitir',
    DONE: 'Listo',
    SUCCESS: '¡Éxito!',
    WARNING: 'Advertencia',
    INFO: 'Información',
    NO_RESULTS: 'No hay resultados',
    TRY_AGAIN: 'Intentar nuevamente',
    SOMETHING_WRONG: 'Algo salió mal',
    PLEASE_WAIT: 'Por favor espera...',
  },

  // Errors
  ERRORS: {
    NETWORK: 'Error de conexión. Verifica tu internet',
    SERVER: 'Error del servidor. Intenta más tarde',
    NOT_FOUND: 'No se encontró lo que buscas',
    UNAUTHORIZED: 'No tienes autorización',
    FORBIDDEN: 'Acción no permitida',
    TIMEOUT: 'La petición tardó demasiado',
    UNKNOWN: 'Error desconocido',
    INVALID_DATA: 'Datos inválidos',
    INVALID_ID: 'ID inválido',
  },

  // Share
  SHARE: {
    TITLE: 'Compartir',
    COPY_LINK: 'Copiar enlace',
    LINK_COPIED: 'Enlace copiado',
    SHARE_VIA: 'Compartir vía',
    FACEBOOK: 'Facebook',
    TWITTER: 'Twitter',
    WHATSAPP: 'WhatsApp',
    EMAIL: 'Email',
  },

  // Time
  TIME: {
    JUST_NOW: 'Justo ahora',
    MINUTES_AGO: 'hace {0} minutos',
    HOURS_AGO: 'hace {0} horas',
    DAYS_AGO: 'hace {0} días',
    WEEKS_AGO: 'hace {0} semanas',
    MONTHS_AGO: 'hace {0} meses',
    YEARS_AGO: 'hace {0} años',
  },

  // Counts
  COUNTS: {
    LIKES: '{0} me gusta',
    COMMENTS: '{0} comentarios',
    VIEWS: '{0} visualizaciones',
    FOLLOWERS: '{0} seguidores',
    FOLLOWING: '{0} siguiendo',
    POSTS: '{0} publicaciones',
  },
} as const;

export default UI_MESSAGES;

/**
 * Helper para formatear mensajes con placeholders
 * Ejemplo: formatMessage(UI_MESSAGES.TIME.MINUTES_AGO, 5) => "hace 5 minutos"
 */
export function formatMessage(template: string, ...values: (string | number)[]): string {
  return template.replace(/\{(\d+)\}/g, (match, index) => {
    const value = values[parseInt(index)];
    return value !== undefined ? String(value) : match;
  });
}

