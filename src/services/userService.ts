import api from './api'
import logger from '@/utils/logger'

export interface User {
  id: string
  username: string
  email: string
  fullName?: string
  avatar?: string
  bio?: string
  website?: string
  location?: string
  phone?: string
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  birthDate?: string
  isPrivate?: boolean
  isVerified: boolean
  followerCount: number
  followingCount: number
  postCount: number
  isFollowing?: boolean
  isBlocked?: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateUserData {
  fullName?: string
  bio?: string
  avatar?: string
}

export interface FollowUserResponse {
  success: boolean
  isFollowing: boolean
  followerCount: number
}

export interface SearchUsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
  filter?: string
}

export interface UserSuggestion {
  id: string
  username: string
  fullName?: string
  avatar?: string
  isFollowing?: boolean
  mutualFollowers?: number
}

export interface UserProfile extends User {
  followers: User[]
  following: User[]
  posts: any[]
  savedPosts: any[]
  blockedUsers: User[]
  postsCount: number
  reelsCount: number
  storiesCount: number
  followersCount: number
  totalLikes: number
  totalComments: number
}

export interface AdminUser extends User {
  role: string
  isSuspended: boolean
  isBanned: boolean
  lastLogin?: string
  lastLoginAt?: string
  loginCount: number
  isActive: boolean
  postsCount: number
  followersCount: number
  reportsCount: number
  banReason?: string
  banExpiresAt?: string
}

export interface AdminUsersResponse {
  users: AdminUser[]
  total: number
  page: number
  limit: number
  pages: number
}

// Get user profile
export const getUserProfile = async (username: string): Promise<User> => {
  try {
    const response = await api.get(`/users/${username}`)
    return response.data.user
  } catch (error) {
    logger.error('Error fetching user profile', error)
    throw new Error('Error fetching user profile')
  }
}

// Update user profile
export const updateUserProfile = async (data: UpdateUserData): Promise<User> => {
  try {
    const response = await api.put('/users/profile', data)
    return response.data.user
  } catch (error) {
    logger.error('Error updating user profile', error)
    throw new Error('Error updating user profile')
  }
}

// Follow user
export const followUser = async (userId: string): Promise<FollowUserResponse> => {
  try {
    const response = await api.post(`/users/${userId}/follow`)
    return response.data
  } catch (error) {
    logger.error('Error following user', error)
    throw new Error('Error following user')
  }
}

// Unfollow user
export const unfollowUser = async (userId: string): Promise<FollowUserResponse> => {
  try {
    const response = await api.delete(`/users/${userId}/follow`)
    return response.data
  } catch (error) {
    logger.error('Error unfollowing user', error)
    throw new Error('Error unfollowing user')
  }
}

// Get user followers
export const getUserFollowers = async (userId: string, page = 1, limit = 20): Promise<{
  followers: User[]
  total: number
  page: number
  limit: number
}> => {
  try {
    const response = await api.get(`/users/${userId}/followers?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    logger.error('Error fetching user followers', error)
    throw new Error('Error fetching user followers')
  }
}

// Get user following
export const getUserFollowing = async (userId: string, page = 1, limit = 20): Promise<{
  following: User[]
  total: number
  page: number
  limit: number
}> => {
  try {
    const response = await api.get(`/users/${userId}/following?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    logger.error('Error fetching user following', error)
    throw new Error('Error fetching user following')
  }
}

// Search users
export const searchUsers = async (query: string, page = 1, limit = 20): Promise<SearchUsersResponse> => {
  try {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    logger.error('Error searching users', error)
    throw new Error('Error searching users')
  }
}

// Block user
export const blockUser = async (userId: string): Promise<void> => {
  try {
    await api.post(`/users/${userId}/block`)
  } catch (error) {
    logger.error('Error blocking user', error)
    throw new Error('Error blocking user')
  }
}

// Unblock user
export const unblockUser = async (userId: string): Promise<void> => {
  try {
    await api.delete(`/users/${userId}/block`)
  } catch (error) {
    logger.error('Error unblocking user', error)
    throw new Error('Error unblocking user')
  }
}

// Get blocked users
export const getBlockedUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users/blocked')
    return response.data.users
  } catch (error) {
    logger.error('Error fetching blocked users', error)
    throw new Error('Error fetching blocked users')
  }
}

// Report user
export const reportUser = async (userId: string, reason: string, description?: string): Promise<void> => {
  try {
    await api.post(`/users/${userId}/report`, { reason, description })
  } catch (error) {
    logger.error('Error reporting user', error)
    throw new Error('Error reporting user')
  }
}

// Get user profile by username (alias)
export const getUserProfileByUsername = getUserProfile

// Get user suggestions
export const getSuggestions = async (): Promise<UserSuggestion[]> => {
  try {
    const response = await api.get('/users/suggestions')
    return response.data.suggestions
  } catch (error) {
    logger.error('Error fetching user suggestions', error)
    throw new Error('Error fetching user suggestions')
  }
}

// Check username availability
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const response = await api.get(`/users/check-username/${username}`)
    return response.data.available
  } catch (error) {
    logger.error('Error checking username availability', error)
    throw new Error('Error checking username availability')
  }
}

// Edit profile
export const editProfile = async (data: any): Promise<User> => {
  try {
    const response = await api.put('/users/profile', data)
    return response.data.user
  } catch (error) {
    logger.error('Error editing profile', error)
    throw new Error('Error editing profile')
  }
}

// Admin functions
export const getAdminUsers = async (options?: {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: string
  sortBy?: string
  sortOrder?: 'desc' | 'asc'
}): Promise<AdminUsersResponse> => {
  try {
    const params = new URLSearchParams()
    if (options?.page) params.append('page', options.page.toString())
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.search) params.append('search', options.search)
    if (options?.role) params.append('role', options.role)
    if (options?.status) params.append('status', options.status)
    if (options?.sortBy) params.append('sortBy', options.sortBy)
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder)

    const response = await api.get(`/admin/users?${params.toString()}`)
    return response.data
  } catch (error) {
    logger.error('Error fetching admin users', error)
    throw new Error('Error fetching admin users')
  }
}

export const updateUserRole = async (userId: string, role: string): Promise<void> => {
  try {
    await api.put(`/admin/users/${userId}/role`, { role })
  } catch (error) {
    logger.error('Error updating user role', error)
    throw new Error('Error updating user role')
  }
}

export const banUser = async (userId: string, reason?: string, duration?: number): Promise<void> => {
  try {
    await api.post(`/admin/users/${userId}/ban`, { reason, duration })
  } catch (error) {
    logger.error('Error banning user', error)
    throw new Error('Error banning user')
  }
}

export const unbanUser = async (userId: string): Promise<void> => {
  try {
    await api.delete(`/admin/users/${userId}/ban`)
  } catch (error) {
    logger.error('Error unbanning user', error)
    throw new Error('Error unbanning user')
  }
}

export const verifyUser = async (userId: string): Promise<void> => {
  try {
    await api.post(`/admin/users/${userId}/verify`)
  } catch (error) {
    logger.error('Error verifying user', error)
    throw new Error('Error verifying user')
  }
}

export const unverifyUser = async (userId: string): Promise<void> => {
  try {
    await api.delete(`/admin/users/${userId}/verify`)
  } catch (error) {
    logger.error('Error unverifying user', error)
    throw new Error('Error unverifying user')
  }
}

export const suspendUser = async (userId: string, reason?: string, duration?: number): Promise<void> => {
  try {
    await api.post(`/admin/users/${userId}/suspend`, { reason, duration })
  } catch (error) {
    logger.error('Error suspending user', error)
    throw new Error('Error suspending user')
  }
}

export const unsuspendUser = async (userId: string): Promise<void> => {
  try {
    await api.delete(`/admin/users/${userId}/suspend`)
  } catch (error) {
    logger.error('Error unsuspending user', error)
    throw new Error('Error unsuspending user')
  }
}

// Mute user
export const muteUser = async (userId: string): Promise<void> => {
  try {
    await api.post(`/users/${userId}/mute`)
  } catch (error) {
    logger.error('Error muting user', error)
    throw new Error('Error muting user')
  }
}

// Restrict user
export const restrictUser = async (userId: string): Promise<void> => {
  try {
    await api.post(`/users/${userId}/restrict`)
  } catch (error) {
    logger.error('Error restricting user', error)
    throw new Error('Error restricting user')
  }
}

// Aliases for compatibility
export const getFollowers = getUserFollowers
export const getFollowing = getUserFollowing

export const userService = {
  getUserProfile,
  getUserProfileByUsername,
  updateUserProfile,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  getFollowers,
  getFollowing,
  searchUsers,
  blockUser,
  unblockUser,
  getBlockedUsers,
  reportUser,
  getSuggestions,
  checkUsernameAvailability,
  editProfile,
  getAdminUsers,
  updateUserRole,
  banUser,
  unbanUser,
  verifyUser,
  unverifyUser,
  suspendUser,
  unsuspendUser,
  muteUser,
  restrictUser
}
