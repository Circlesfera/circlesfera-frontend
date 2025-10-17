export interface Post {
  id: string
  userId: string
  caption: string
  media: MediaItem[]
  likes: string[]
  comments: Comment[]
  shares: number
  views: number
  mentions: string[]
  hashtags: string[]
  location?: Location
  isActive: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  duration?: number
  width?: number
  height?: number
}

export interface Comment {
  id: string
  userId: string
  content: string
  likes: string[]
  replies: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Location {
  name: string
  coordinates: [number, number]
  address?: string
}

export interface CreatePostData {
  caption: string
  media: File[]
  location?: Location
  mentions?: string[]
  hashtags?: string[]
  isPublic?: boolean
}

export interface UpdatePostData {
  caption?: string
  location?: Location
  mentions?: string[]
  hashtags?: string[]
  isPublic?: boolean
}

export interface PostFilters {
  userId?: string
  hashtag?: string
  location?: string
  type?: 'image' | 'video'
  isPublic?: boolean
}

export interface PostStats {
  likes: number
  comments: number
  shares: number
  views: number
}

export interface PostWithStats extends Post {
  stats: PostStats
  isLiked: boolean
  isBookmarked: boolean
}
