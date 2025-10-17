export interface CSTVVideo {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
    fullName: string;
    isVerified: boolean;
    followers?: number;
  };
  title: string;
  description: string;
  originalLiveStream?: string;
  isFromLiveStream: boolean;
  video: {
    url: string;
    thumbnail: string;
    duration: number;
    size: number;
    resolution: {
      width: number;
      height: number;
    };
    format: 'mp4' | 'webm' | 'mov';
  };
  visibility: 'public' | 'followers' | 'close_friends' | 'private';
  isPublished: boolean;
  publishedAt: string;
  allowComments: boolean;
  allowLikes: boolean;
  allowShares: boolean;
  ageRestriction: 'all' | '13+' | '16+' | '18+';
  category: CSTVCategory;
  tags: string[];
  views: {
    total: number;
    unique: number;
  };
  likes: string[];
  likesCount: number;
  comments: number;
  shares: number;
  saves: string[];
  savesCount: number;
  monetization: {
    enabled: boolean;
    type: 'ads' | 'subscription' | 'donations';
    revenue: number;
  };
  quality: '360p' | '480p' | '720p' | '1080p' | '4k';
  transcoding: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    variants: {
      quality: string;
      url: string;
      size: number;
      bitrate: number;
    }[];
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  moderation: {
    status: 'pending' | 'approved' | 'rejected' | 'flagged';
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
  };
  scheduling: {
    isScheduled: boolean;
    scheduledAt?: string;
    timezone: string;
  };
  formattedDuration: string;
  isLikedByUser: boolean;
  isSavedByUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CSTVCategory =
  | 'entertainment'
  | 'education'
  | 'gaming'
  | 'music'
  | 'sports'
  | 'lifestyle'
  | 'comedy'
  | 'news'
  | 'technology'
  | 'cooking'
  | 'travel'
  | 'fitness'
  | 'beauty'
  | 'art'
  | 'other';

export interface CreateCSTVData {
  title: string;
  description?: string;
  video: {
    url: string;
    thumbnail: string;
    duration: number;
    size: number;
    resolution?: {
      width: number;
      height: number;
    };
    format?: 'mp4' | 'webm' | 'mov';
  };
  category?: CSTVCategory;
  visibility?: 'public' | 'followers' | 'close_friends' | 'private';
  ageRestriction?: 'all' | '13+' | '16+' | '18+';
  allowComments?: boolean;
  allowLikes?: boolean;
  allowShares?: boolean;
  tags?: string[];
  monetization?: {
    enabled: boolean;
    type: 'ads' | 'subscription' | 'donations';
  };
  scheduling?: {
    isScheduled: boolean;
    scheduledAt?: string;
    timezone?: string;
  };
}

export interface UpdateCSTVData {
  title?: string;
  description?: string;
  category?: CSTVCategory;
  visibility?: 'public' | 'followers' | 'close_friends' | 'private';
  allowComments?: boolean;
  allowLikes?: boolean;
  allowShares?: boolean;
  tags?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface CSTVFilters {
  page?: number;
  limit?: number;
  category?: CSTVCategory;
  userId?: string;
  sortBy?: 'newest' | 'oldest' | 'views' | 'likes' | 'trending';
}

export interface CSTVSearchFilters {
  q: string;
  page?: number;
  limit?: number;
}

export interface CSTVResponse {
  success: boolean;
  data: CSTVVideo | CSTVVideo[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CSTVSearchResponse {
  success: boolean;
  data: {
    videos: CSTVVideo[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export const CSTV_CATEGORIES: { value: CSTVCategory; label: string }[] = [
  { value: 'entertainment', label: 'Entretenimiento' },
  { value: 'education', label: 'Educación' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'music', label: 'Música' },
  { value: 'sports', label: 'Deportes' },
  { value: 'lifestyle', label: 'Estilo de vida' },
  { value: 'comedy', label: 'Comedia' },
  { value: 'news', label: 'Noticias' },
  { value: 'technology', label: 'Tecnología' },
  { value: 'cooking', label: 'Cocina' },
  { value: 'travel', label: 'Viajes' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'beauty', label: 'Belleza' },
  { value: 'art', label: 'Arte' },
  { value: 'other', label: 'Otros' },
];

export const CSTV_AGE_RESTRICTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos los públicos' },
  { value: '13+', label: '13+' },
  { value: '16+', label: '16+' },
  { value: '18+', label: '18+' },
];

export const CSTV_VISIBILITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'public', label: 'Público' },
  { value: 'followers', label: 'Solo seguidores' },
  { value: 'close_friends', label: 'Amigos cercanos' },
  { value: 'private', label: 'Privado' },
];
