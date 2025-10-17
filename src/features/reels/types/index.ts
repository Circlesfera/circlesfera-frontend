export interface Reel {
  id: string
  userId: string
  user: {
    id: string
    username: string
    avatar?: string
  }
  videoUrl: string
  caption?: string
  hashtags: string[]
  location?: {
    name: string
    coordinates: [number, number]
  }
  audioTitle?: string
  audioArtist?: string
  allowComments: boolean
  allowDuets: boolean
  allowStitches: boolean
  duration: number
  views: number
  likes: string[]
  comments: string[]
  shares: number
  createdAt: string
}

export interface CreateReelData {
  video: File
  caption?: string
  hashtags?: string[]
  location?: {
    name: string
    coordinates: [number, number]
  }
  audioTitle?: string
  audioArtist?: string
  allowComments?: boolean
  allowDuets?: boolean
  allowStitches?: boolean
}

export interface ReelResponse {
  success: boolean
  data: Reel
  message?: string
}

export interface ReelsResponse {
  success: boolean
  data: Reel[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
  message?: string
}

export interface ReelStats {
  views: number
  likes: number
  comments: number
  shares: number
  engagement: number
}
