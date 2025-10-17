export interface Story {
  id: string
  userId: string
  type: 'image' | 'video'
  mediaUrl: string
  thumbnailUrl?: string
  duration?: number
  text?: string
  backgroundColor?: string
  fontColor?: string
  views: string[]
  isActive: boolean
  expiresAt: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    username: string
    avatar?: string
  }
  hasViewed?: boolean
}

export interface CreateStoryData {
  type: 'image' | 'video'
  media: File
  text?: string
  backgroundColor?: string
  fontColor?: string
  duration?: number
}

export interface StoryStats {
  views: number
  uniqueViewers: number
  completionRate: number
  shares: number
}

export interface StoryFilters {
  type?: 'image' | 'video'
  isActive?: boolean
  sortBy?: 'recent' | 'popular' | 'trending'
}

export interface StorySearchOptions {
  query?: string
  filters?: StoryFilters
  page?: number
  limit?: number
}
