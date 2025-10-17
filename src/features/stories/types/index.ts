export interface Story {
  id: string
  userId: string
  user: {
    id: string
    username: string
    avatar?: string
  }
  type: 'image' | 'video'
  mediaUrl: string
  caption?: string
  views: string[]
  createdAt: string
  expiresAt: string
  isActive: boolean
}

export interface CreateStoryData {
  type: 'image' | 'video'
  media: File
  caption?: string
}

export interface StoryResponse {
  success: boolean
  data: Story
  message?: string
}

export interface StoriesResponse {
  success: boolean
  data: Story[]
  message?: string
}

export interface StoryStats {
  views: number
  interactions: number
  reach: number
}
