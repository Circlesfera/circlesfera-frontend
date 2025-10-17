export interface User {
  id: string
  username: string
  email: string
  fullName: string
  avatar?: string
  bio?: string
  isVerified: boolean
  isActive: boolean
  followerCount: number
  followingCount: number
  postCount: number
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
  fullName: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface EmailVerificationRequest {
  token: string
}

export interface UpdateProfileData {
  fullName?: string
  bio?: string
  avatar?: string
  username?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Tipos para el contexto de autenticación
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  tokens: AuthTokens | null
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
}

// Tipos para errores de autenticación
export interface AuthError {
  message: string
  code?: string
  field?: string
}

// Tipos para validación de formularios
export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterFormData {
  username: string
  email: string
  password: string
  fullName: string
  confirmPassword: string
  acceptTerms: boolean
}

// Tipos para permisos y roles
export interface UserPermissions {
  canCreatePosts: boolean
  canCreateReels: boolean
  canCreateStories: boolean
  canCreateLiveStreams: boolean
  canModerate: boolean
  canAdmin: boolean
}

export interface UserRole {
  name: string
  permissions: UserPermissions
}

// Tipos para sesión
export interface UserSession {
  user: User
  tokens: AuthTokens
  lastActivity: Date
  deviceInfo?: {
    userAgent: string
    platform: string
    ip?: string
  }
}
