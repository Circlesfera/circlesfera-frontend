export interface Reel {
  id: string
  userId: string
  caption: string
  videoUrl: string
  thumbnailUrl: string
  hashtags: string[]
  location?: {
    name: string
    coordinates: [number, number]
  }
  audioTitle?: string
  duration: number
  likes: string[]
  comments: any[]
  views: number
  shares: number
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    username: string
    avatar?: string
  }
  isLiked?: boolean
}

export interface CreateReelData {
  caption: string
  hashtags: string[]
  location?: {
    name: string
    coordinates: [number, number]
  }
  audioTitle?: string
  video: File
}

export interface ReelFilters {
  hashtags?: string[]
  location?: string
  duration?: {
    min?: number
    max?: number
  }
  sortBy?: 'recent' | 'popular' | 'trending'
}

export interface ReelSearchOptions {
  query?: string
  filters?: ReelFilters
  page?: number
  limit?: number
}
