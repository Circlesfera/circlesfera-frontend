/**
 * Posts Feature Types - Frontend
 * Tipos específicos para la funcionalidad de posts
 */

export interface Post {
  id: string
  userId: string
  type: 'text' | 'image' | 'video' | 'reel' | 'story'
  caption: string
  content: PostContent
  location?: PostLocation
  tags: string[]
  mentions: string[]
  likes: string[]
  comments: PostComment[]
  shares: number
  views: number
  isPublic: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  user?: PostUser
  isLiked?: boolean
  isBookmarked?: boolean
}

export interface PostContent {
  text?: string
  media?: PostMedia[]
  images?: PostMedia[] // Alias para compatibilidad
  video?: PostMedia // Alias para compatibilidad
  location?: PostLocation
}

export interface PostMedia {
  id: string
  url: string
  type: 'image' | 'video'
  size: number
  duration?: number
  thumbnail?: string
  width?: number
  height?: number
}

export interface PostLocation {
  name: string
  latitude: number
  longitude: number
  address?: string
}

export interface PostUser {
  id: string
  username: string
  fullName: string
  avatar?: string
  isVerified: boolean
  followersCount: number
}

export interface PostComment {
  id: string
  userId: string
  text: string
  createdAt: string
  updatedAt: string
  user?: PostUser
  likes: string[]
  replies?: PostComment[]
  isLiked?: boolean
}

export interface CreatePostData {
  type: 'text' | 'image' | 'video' | 'reel' | 'story'
  caption: string
  media?: File[]
  location?: PostLocation
  tags?: string[]
  mentions?: string[]
  isPublic?: boolean
}

export interface UpdatePostData {
  caption?: string
  tags?: string[]
  mentions?: string[]
  isPublic?: boolean
}

export interface PostFilters {
  type?: 'text' | 'image' | 'video' | 'reel' | 'story'
  userId?: string
  tags?: string[]
  location?: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface PostSortOptions {
  field: 'createdAt' | 'likes' | 'comments' | 'views' | 'shares'
  order: 'asc' | 'desc'
}

export interface PostPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface PostsResponse {
  posts: Post[]
  pagination: PostPagination
}

export interface PostStats {
  likesCount: number
  commentsCount: number
  sharesCount: number
  viewsCount: number
  engagementRate: number
}

export interface PostFormState {
  isSubmitting: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
}

export interface PostFormData {
  caption: string
  media: File[]
  tags: string[]
  location: PostLocation | null
  isPublic: boolean
}

export interface PostLikeData {
  postId: string
  userId: string
  isLiked: boolean
}

export interface PostCommentData {
  postId: string
  text: string
  parentCommentId?: string
}

export interface PostShareData {
  postId: string
  platform: 'internal' | 'twitter' | 'facebook' | 'whatsapp'
  message?: string
}

export interface PostReportData {
  postId: string
  reason: 'spam' | 'inappropriate' | 'harassment' | 'violence' | 'false_info' | 'other'
  description?: string
}

export interface PostBookmarkData {
  postId: string
  userId: string
  isBookmarked: boolean
}

export interface PostFeedOptions {
  type?: 'following' | 'discover' | 'trending' | 'recent'
  filters?: PostFilters
  sort?: PostSortOptions
  pagination?: {
    page: number
    limit: number
  }
}

export interface PostFeedState {
  posts: Post[]
  isLoading: boolean
  hasMore: boolean
  error: string | null
  pagination: PostPagination
}

export interface PostDetailState {
  post: Post | null
  isLoading: boolean
  error: string | null
  comments: PostComment[]
  commentsLoading: boolean
  commentsError: string | null
}

export interface PostModalState {
  isOpen: boolean
  postId: string | null
  post: Post | null
  isLoading: boolean
  error: string | null
}

export interface PostUploadState {
  isUploading: boolean
  progress: number
  error: string | null
  uploadedFiles: PostMedia[]
}

export interface PostValidationError {
  field: string
  message: string
}

export interface PostApiError {
  success: false
  message: string
  code: string
  errors?: PostValidationError[]
}

export interface PostApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: PostValidationError[]
}

export interface PostHookReturn {
  posts: Post[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  createPost: (data: CreatePostData) => Promise<Post>
  updatePost: (id: string, data: UpdatePostData) => Promise<Post>
  deletePost: (id: string) => Promise<void>
  likePost: (id: string) => Promise<void>
  unlikePost: (id: string) => Promise<void>
  bookmarkPost: (id: string) => Promise<void>
  unbookmarkPost: (id: string) => Promise<void>
  sharePost: (id: string, platform: string) => Promise<void>
  reportPost: (id: string, data: PostReportData) => Promise<void>
}

export interface PostDetailHookReturn {
  post: Post | null
  isLoading: boolean
  error: string | null
  comments: PostComment[]
  commentsLoading: boolean
  commentsError: string | null
  updatePost: (data: UpdatePostData) => Promise<Post>
  deletePost: () => Promise<void>
  likePost: () => Promise<void>
  unlikePost: () => Promise<void>
  addComment: (text: string) => Promise<PostComment>
  deleteComment: (commentId: string) => Promise<void>
  likeComment: (commentId: string) => Promise<void>
  unlikeComment: (commentId: string) => Promise<void>
  refresh: () => Promise<void>
}

export interface PostFormHookReturn {
  formData: PostFormData
  isSubmitting: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
  setFieldValue: (field: string, value: unknown) => void
  setFieldTouched: (field: string, touched: boolean) => void
  handleSubmit: (data: PostFormData) => Promise<void>
  resetForm: () => void
  validateForm: () => boolean
}

export interface PostUploadHookReturn {
  isUploading: boolean
  progress: number
  error: string | null
  uploadedFiles: PostMedia[]
  uploadFiles: (files: File[]) => Promise<PostMedia[]>
  removeFile: (fileId: string) => void
  clearUploads: () => void
}

export interface PostSearchOptions {
  query: string
  filters?: PostFilters
  sort?: PostSortOptions
  pagination?: {
    page: number
    limit: number
  }
}

export interface PostSearchResult {
  posts: Post[]
  pagination: PostPagination
  suggestions: string[]
}

export interface PostAnalytics {
  views: number
  likes: number
  comments: number
  shares: number
  engagementRate: number
  reach: number
  impressions: number
  clicks: number
  saves: number
}

export interface PostTrendingData {
  post: Post
  trendScore: number
  growthRate: number
  category: string
}
