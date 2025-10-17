/**
 * Auth Feature Types - Frontend
 * Tipos específicos para la funcionalidad de autenticación
 */

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  bio?: string
  avatar?: string
  isVerified: boolean
  isActive: boolean
  role: 'user' | 'admin' | 'moderator'
  createdAt: string
  updatedAt: string
  followersCount: number
  followingCount: number
  postsCount: number
  privacySettings?: UserPrivacySettings
  notificationSettings?: UserNotificationSettings
  preferences?: UserPreferences
}

export interface UserPrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  showEmail: boolean
  showFollowers: boolean
  showFollowing: boolean
  allowMessages: 'everyone' | 'friends' | 'none'
}

export interface UserNotificationSettings {
  likes: boolean
  comments: boolean
  follows: boolean
  mentions: boolean
  messages: boolean
  pushNotifications: boolean
  emailNotifications: boolean
}

export interface UserPreferences {
  language: string
  theme: 'light' | 'dark' | 'system'
  emailNotifications: boolean
  autoPlayVideos: boolean
  showSensitiveContent: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  username: string
  email: string
  password: string
  fullName: string
  bio?: string
  avatar?: File
  acceptTerms: boolean
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
  message: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetData {
  token: string
  password: string
  confirmPassword: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  tokens: AuthTokens | null
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  register: (data: RegisterData) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshToken: () => Promise<AuthTokens>
  updateProfile: (data: Partial<User>) => Promise<User>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (data: PasswordResetData) => Promise<void>
  clearError: () => void
}

export interface AuthError {
  message: string
  code: string
  field?: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface ApiError {
  success: false
  message: string
  code: string
  errors?: ValidationError[]
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: ValidationError[]
}

export interface AuthFormState {
  isSubmitting: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
}

export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  fullName: string
  bio: string
  acceptTerms: boolean
  avatar: File | null
}

export interface ProfileUpdateData {
  username?: string
  email?: string
  fullName?: string
  bio?: string
  avatar?: File
  privacySettings?: Partial<UserPrivacySettings>
  notificationSettings?: Partial<UserNotificationSettings>
  preferences?: Partial<UserPreferences>
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AuthRouteConfig {
  path: string
  requiresAuth: boolean
  roles?: string[]
  redirectTo?: string
}

export interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
  fallback?: React.ReactNode
}

export interface AuthHookReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}
