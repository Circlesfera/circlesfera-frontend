/**
 * Representa a un usuario que aparece en el feed.
 */
export interface FeedUser {
  readonly id: string;
  readonly handle: string;
  readonly displayName: string;
  readonly avatarUrl: string;
  readonly isVerified: boolean;
}

export type MediaKind = 'image' | 'video';

/**
 * Metadatos del recurso multimedia asociado a una publicación.
 */
export interface FeedMedia {
  readonly id: string;
  readonly kind: MediaKind;
  readonly url: string;
  readonly thumbnailUrl: string;
  readonly durationMs?: number;
  readonly width?: number;
  readonly height?: number;
}

/**
 * Métricas agregadas de la publicación.
 */
export interface FeedStats {
  readonly likes: number;
  readonly comments: number;
  readonly saves: number;
  readonly shares: number;
  readonly views: number;
}

/**
 * Elemento individual del feed.
 */
export interface FeedItem {
  readonly id: string;
  readonly author: FeedUser;
  readonly caption: string;
  readonly media: FeedMedia[];
  readonly stats: FeedStats;
  readonly createdAt: string;
  readonly isLikedByViewer: boolean;
  readonly isSavedByViewer: boolean;
  readonly soundTrackUrl?: string;
}

export interface FeedCursorResponse {
  readonly data: FeedItem[];
  readonly nextCursor?: string | null;
}

