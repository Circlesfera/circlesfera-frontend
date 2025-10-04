// Tipos base para el proyecto CircleSfera

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  fullName?: string;
  website?: string;
  location?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  birthDate?: string;
  isPrivate?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  lastSeen?: string;
  followers: string[];
  following: string[];
  posts: string[];
  savedPosts: string[];
  blockedUsers: string[];
  preferences?: UserPreferences;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  notifications: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    mentions: boolean;
    messages: boolean;
    stories: boolean;
    posts: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showBirthDate: boolean;
  };
}

export interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
    isVerified?: boolean;
  };
  content: {
    images?: MediaFile[];
    video?: MediaFile;
    text?: string;
  };
  caption?: string;
  location?: {
    name: string;
    coordinates?: {
      type: string;
      coordinates: number[];
    };
  };
  likes: string[];
  comments: Comment[];
  shares: Array<{
    user: string;
    createdAt: string;
  }>;
  saves: Array<{
    user: string;
    createdAt: string;
  }>;
  isPublic: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  content: string;
  likes: Array<{
    user: string;
    createdAt: string;
  }>;
  replies: Comment[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFile {
  url: string;
  alt?: string;
  width: number;
  height: number;
  size?: number;
  type: 'image' | 'video';
  duration?: number;
  thumbnail?: string;
}

export interface Story {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  type: 'image' | 'video' | 'text';
  content: {
    image?: MediaFile;
    video?: MediaFile;
    text?: {
      content: string;
      backgroundColor: string;
      textColor: string;
      fontSize: number;
      fontFamily: string;
    };
  };
  caption?: string;
  location?: {
    name: string;
    coordinates?: {
      type: string;
      coordinates: number[];
    };
  };
  views: Array<{
    user: string;
    viewedAt: string;
  }>;
  reactions: Array<{
    user: string;
    type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
    createdAt: string;
  }>;
  replies: Array<{
    user: string;
    content: string;
    createdAt: string;
  }>;
  isPublic: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reel {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  video: MediaFile;
  caption?: string;
  music?: {
    title: string;
    artist: string;
    url: string;
  };
  location?: {
    name: string;
    coordinates?: {
      type: string;
      coordinates: number[];
    };
  };
  likes: Array<{
    user: string;
    createdAt: string;
  }>;
  comments: Comment[];
  shares: Array<{
    user: string;
    createdAt: string;
  }>;
  views: Array<{
    user: string;
    viewedAt: string;
  }>;
  isPublic: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface Notification {
  _id: string;
  user: string;
  from: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message' | 'story' | 'post' | 'reel';
  content: {
    post?: string;
    comment?: string;
    story?: string;
    reel?: string;
    message?: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
    lastSeen?: string;
  }>;
  lastMessage?: {
    _id: string;
    content: string;
    sender: string;
    createdAt: string;
  };
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  media?: MediaFile;
  isRead: boolean;
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
  isEdited: boolean;
  replyTo?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para respuestas de API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos para formularios
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface UpdateProfileForm {
  username?: string;
  fullName?: string;
  bio?: string;
  website?: string;
  location?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  birthDate?: string;
  isPrivate?: boolean;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Tipos para contextos
export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Tipos para hooks
export type UseAuthReturn = AuthContextType;

// Tipos para componentes
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends ComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

// Tipos para servicios
export interface ServiceConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

// Tipos para utilidades
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FileUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Tipos para estados de carga
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Tipos para filtros y búsquedas
export interface SearchFilters {
  query?: string;
  type?: 'users' | 'posts' | 'stories' | 'reels';
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

// Tipos para paginación
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: SortOptions;
}

// Tipos para estadísticas
export interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
  commentsReceived: number;
  sharesReceived: number;
}

export interface PostStats {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  savesCount: number;
}

// Tipos para configuraciones
export interface AppConfig {
  apiUrl: string;
  uploadUrl: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  features: {
    stories: boolean;
    reels: boolean;
    messages: boolean;
    notifications: boolean;
  };
}

// Tipos para errores
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Tipos para eventos
export interface AppEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
  userId?: string;
}

// Re-exportar tipos específicos
export * from './story';
