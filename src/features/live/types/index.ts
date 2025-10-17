export interface LiveStream {
  id: string
  title: string
  description?: string
  thumbnail?: string
  streamer: {
    id: string
    username: string
    avatar?: string
  }
  viewerCount: number
  isLive: boolean
  category?: string
  tags?: string[]
  startedAt: string
  endedAt?: string
  duration?: number
  isPublic: boolean
  streamKey: string
  rtmpUrl?: string
  hlsUrl?: string
  dashUrl?: string
}

export interface CreateLiveStreamData {
  title: string
  description?: string
  category?: string
  tags?: string[]
  isPublic?: boolean
  scheduledFor?: string
}

export interface LiveStreamStats {
  viewerCount: number
  likeCount: number
  commentCount: number
  shareCount: number
  peakViewers: number
  totalViewTime: number
  averageViewTime: number
}

export interface LiveChatMessage {
  id: string
  userId: string
  username: string
  avatar?: string
  message: string
  timestamp: Date
  isOwner?: boolean
  isModerator?: boolean
}

export interface LiveStreamFilters {
  category?: string
  tags?: string[]
  isLive?: boolean
  sortBy?: 'viewers' | 'recent' | 'popular'
}

export interface LiveStreamSearchOptions {
  query?: string
  filters?: LiveStreamFilters
  page?: number
  limit?: number
}
