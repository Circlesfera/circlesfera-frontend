export interface ExplorePost {
  id: string
  userId: string
  type: 'image' | 'video' | 'reel'
  mediaUrl: string
  thumbnailUrl?: string
  caption: string
  likes: number
  comments: number
  user: {
    id: string
    username: string
    avatar?: string
  }
  createdAt: string
}

export interface ExploreUser {
  id: string
  username: string
  fullName?: string
  avatar?: string
  bio?: string
  followerCount: number
  isFollowing?: boolean
  isVerified?: boolean
}

export interface ExploreFilters {
  type?: 'image' | 'video' | 'reel' | 'all'
  sortBy?: 'recent' | 'popular' | 'trending'
  hashtags?: string[]
}

export interface ExploreSearchOptions {
  query?: string
  filters?: ExploreFilters
  page?: number
  limit?: number
}
