// Tipos base para el proyecto CircleSfera

export interface User {
  id: string;
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
  role?: 'user' | 'moderator' | 'admin';
  lastSeen?: string;
  lastLogin?: string;
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
  id: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
    fullName?: string;
    isVerified?: boolean;
  };
  type: 'image' | 'video' | 'text';
  content: {
    images?: Array<{
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    }>;
    video?: {
      url: string;
      duration: number;
      thumbnail: string;
      width?: number;
      height?: number;
    };
    text?: string;
    aspectRatio?: '1:1' | '4:5';
    originalAspectRatio?: number;
  };
  caption: string;
  location?: {
    name: string;
    coordinates?: {
      type: string;
      coordinates: number[];
    };
  };
  tags?: string[];
  likes: string[];
  comments: string[];
  views: number;
  shares: number;
  isPublic: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  content: string;
  likes: Array<{
    user: string;
    createdAt: string;
  }>;
  likesCount?: number;
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
  id: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  type: 'image' | 'video' | 'text';
  content: {
    image?: {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    video?: {
      url: string;
      duration: number;
      thumbnail: string;
      width?: number;
      height?: number;
    };
    text?: {
      content: string;
      backgroundColor: string;
      textColor: string;
      fontSize: number;
      fontFamily: string;
    };
  };
  caption: string;
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

export interface UserWithStories {
  id: string;
  username: string;
  avatar?: string;
  fullName?: string;
  latestStory: Story;
  storiesCount: number;
  hasUnviewedStories?: boolean;
  updatedAt?: string;
}

export interface Reel {
  id: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  video: {
    url: string;
    thumbnail?: string;
    duration: number;
    width: number;
    height: number;
  };
  audio?: {
    title: string;
    artist: string;
  };
  caption: string;
  hashtags: string[];
  location?: string;
  isPublic: boolean;
  allowComments: boolean;
  allowDuets: boolean;
  allowStitches: boolean;
  views: Array<{
    user: string;
    viewedAt: string;
  }>;
  likes: Array<{
    user: string;
    createdAt: string;
  }>;
  comments: Array<{
    user: string;
    content: string;
    createdAt: string;
  }>;
  shares: Array<{
    user: string;
    sharedAt: string;
    platform?: string;
  }>;
  duets: Array<{
    user: string;
    createdAt: string;
  }>;
  stitches: Array<{
    user: string;
    createdAt: string;
  }>;
  isDuet?: boolean;
  isStitch?: boolean;
  originalReel?: string | {
    id: string;
    user: {
      id: string;
      username: string;
      avatar?: string;
    };
    caption?: string;
    video: {
      url: string;
      thumbnail?: string;
    };
  };
  stitchMetadata?: {
    startTime: number;
    duration: number;
  };
  isDeleted: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  user: string;
  from: {
    id: string;
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
  id: string;
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  avatar?: string;
  participants: Array<{
    id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  }>;
  admins?: Array<{
    id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  }>;
  lastMessage?: {
    id: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact';
    content: {
      text?: string;
      image?: {
        url: string;
        alt?: string;
      };
      video?: {
        url: string;
        thumbnail: string;
      };
      location?: {
        name: string;
        address?: string;
      };
    };
    sender: {
      id: string;
      username: string;
      avatar?: string;
      fullName?: string;
    };
    createdAt: string;
  };
  unreadCount: number;
  settings?: {
    isActive: boolean;
    isArchived: boolean;
    isDeleted: boolean;
    userSettings?: {
      mute: boolean;
      pin: boolean;
      lastRead: string;
      unreadCount: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact';
  content: {
    text?: string;
    image?: {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    video?: {
      url: string;
      duration: number;
      thumbnail: string;
      width?: number;
      height?: number;
    };
    audio?: {
      url: string;
      duration: number;
    };
    file?: {
      url: string;
      name: string;
      size: number;
      type: string;
    };
    location?: {
      coordinates: number[];
      name: string;
      address?: string;
    };
    contact?: {
      name: string;
      phone: string;
      email?: string;
    };
  };
  status: 'sent' | 'delivered' | 'read';
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  isForwarded: boolean;
  originalMessage?: string;
  replyTo?: Message;
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
  accessToken?: string; // Backend devuelve ambos
  refreshToken?: string;
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

// Tipos para sistema de reportes
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'violence'
  | 'false_information'
  | 'copyright'
  | 'suicide_or_self_harm'
  | 'scam'
  | 'terrorism'
  | 'other';

export type ReportContentType =
  | 'post'
  | 'reel'
  | 'story'
  | 'comment'
  | 'user'
  | 'message'
  | 'live_stream';

export type ReportStatus =
  | 'pending'
  | 'under_review'
  | 'resolved'
  | 'rejected';

export type ReportAction =
  | 'none'
  | 'content_removed'
  | 'user_warned'
  | 'user_suspended'
  | 'user_banned';

export interface Report {
  id: string;
  reportedContent: string;
  contentType: ReportContentType;
  reason: ReportReason;
  description?: string;
  reportedBy: {
    id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  status: ReportStatus;
  moderatorNotes?: string;
  actionTaken?: ReportAction;
  resolvedBy?: {
    id: string;
    username: string;
  };
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Re-exportar tipos específicos
export * from './cstv';
export * from './live';
