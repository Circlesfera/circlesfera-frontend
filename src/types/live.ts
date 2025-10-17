export interface LiveStream {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
    fullName: string;
    isVerified: boolean;
  };
  title: string;
  description: string;
  status: 'pending' | 'live' | 'ended' | 'archived' | 'scheduled';
  viewers: {
    current: number;
    total: number;
    peak: number;
  };
  likes: Array<{
    user: string;
    createdAt: string;
  }>;
  startTime: string;
  endTime?: string;
  duration: number;
  isPublic: boolean;
  allowComments: boolean;
  allowShares: boolean;
  notifyFollowers: boolean;
  notifyCloseFriends: boolean;
  saveToCSTV: boolean;
  coHosts: CoHost[];
  chatEnabled: boolean;
  thumbnailUrl?: string;
  streamKey?: string;
  rtmpUrl?: string;
  playbackUrl?: string;
  scheduledAt?: string;
  cstvVideo?: {
    id: string;
    url: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CoHost {
  user: {
    id: string;
    username: string;
    avatar: string;
    fullName: string;
    isVerified: boolean;
  };
  status: 'invited' | 'accepted' | 'declined' | 'joined' | 'left';
  joinedAt?: string;
}

export interface LiveStreamViewer {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
    fullName: string;
    isVerified: boolean;
  };
  joinedAt: string;
  isActive: boolean;
  lastSeen: string;
}

export interface LiveComment {
  id: string;
  liveStream: string;
  user: {
    id: string;
    username: string;
    avatar: string;
    fullName: string;
    isVerified: boolean;
  };
  content: string;
  type: 'comment' | 'question' | 'reaction' | 'system';
  timestamp: number;
  clientId?: string;
  replyTo?: {
    id: string;
    user: {
      id: string;
      username: string;
      avatar: string;
      fullName: string;
      isVerified: boolean;
    };
  };
  reactions: LiveReaction[];
  reactionCount: number;
  replies?: LiveComment[];
  repliesCount?: number;
  isPinned: boolean;
  isVisible: boolean;
  moderation: {
    status: 'approved' | 'hidden' | 'deleted';
    moderatedBy?: string;
    moderatedAt?: string;
    reason?: string;
  };
  createdAt: string;
}

export interface LiveReaction {
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  type: 'like' | 'love' | 'laugh' | 'wow' | 'angry';
  timestamp: string;
}

export interface LiveStreamStats {
  totalComments: number;
  visibleComments: number;
  moderatedComments: number;
  pinnedComments: number;
  totalReactions: number;
  avgReactionsPerComment: number;
}

export interface CreateLiveStreamData {
  title: string;
  description?: string;
  isPublic?: boolean;
  allowComments?: boolean;
  allowShares?: boolean;
  notifyFollowers?: boolean;
  notifyCloseFriends?: boolean;
  saveToCSTV?: boolean;
  scheduledAt?: string;
}

export interface StartLiveStreamData {
  streamKey: string;
  rtmpUrl?: string;
  playbackUrl?: string;
  thumbnailUrl?: string;
}

export interface EndLiveStreamData {
  saveToCSTV?: boolean;
  cstvTitle?: string;
  cstvDescription?: string;
  cstvCategory?: string;
}

export interface CreateLiveCommentData {
  content: string;
  type?: 'comment' | 'question' | 'reaction' | 'system';
  replyTo?: string;
  timestamp?: number;
  clientId?: string;
}

export interface LiveStreamFilters {
  status?: 'live' | 'scheduled' | 'ended' | 'cancelled';
  category?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface LiveCommentFilters {
  page?: number;
  limit?: number;
  since?: string;
  type?: 'comment' | 'question' | 'reaction' | 'system';
  sortByPinned?: boolean;
}
