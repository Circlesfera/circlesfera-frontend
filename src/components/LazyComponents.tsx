/**
 * 🚀 Lazy Components - Code Splitting Optimizado
 * ==============================================
 * Componentes lazy-loaded para optimizar el bundle inicial
 */

import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'

// Loading component optimizado
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <motion.div
      className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
)

// Error boundary para lazy components
const LazyErrorBoundary = ({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) => {
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      {children}
    </Suspense>
  )
}

// ===== AUTH COMPONENTS =====
export const LoginModal = lazy(() => import('@/features/auth/components/LoginModal'))
export const RegisterModal = lazy(() => import('@/features/auth/components/RegisterModal'))

// ===== POST COMPONENTS =====
export const PostCard = lazy(() => import('@/features/posts/components/PostCard'))
export const CreatePostForm = lazy(() => import('@/features/posts/components/CreatePostForm'))

// ===== REEL COMPONENTS =====
export const ReelCard = lazy(() => import('@/features/reels/components/ReelCard'))
export const CreateReelForm = lazy(() => import('@/features/posts/components/CreateReelForm'))


// ===== STORY COMPONENTS =====
export const StoryViewer = lazy(() => import('@/features/stories/components/StoryViewer'))
export const StoriesBar = lazy(() => import('@/features/stories/components/StoriesBar'))

// ===== PROFILE COMPONENTS =====
export const ProfileHeader = lazy(() => import('@/features/profile/components/profile/ProfileHeader'))
export const ModernProfileHeader = lazy(() => import('@/features/profile/components/profile/ModernProfileHeader'))

// ===== MESSAGE COMPONENTS =====
export const ChatWindow = lazy(() => import('@/features/messages/components/ChatWindow'))
export const ConversationsList = lazy(() => import('@/features/messages/components/ConversationsList'))

// ===== EXPLORE COMPONENTS =====
export const UserSuggestions = lazy(() => import('@/features/explore/components/UserSuggestions'))
export const ExploreGrid = lazy(() => import('@/features/explore/components/ExploreGrid'))

// ===== NOTIFICATION COMPONENTS =====
export const NotificationList = lazy(() => import('@/features/notifications/components/NotificationList'))

// ===== WRAPPED COMPONENTS (con error boundaries) =====

// Auth components wrapped
export const LoginModalWrapped = (props: any) => (
  <LazyErrorBoundary>
    <LoginModal {...props} />
  </LazyErrorBoundary>
)

export const RegisterModalWrapped = (props: any) => (
  <LazyErrorBoundary>
    <RegisterModal {...props} />
  </LazyErrorBoundary>
)

// Post components wrapped
export const PostCardWrapped = (props: any) => (
  <LazyErrorBoundary>
    <PostCard {...props} />
  </LazyErrorBoundary>
)

// ===== PRELOAD FUNCTIONS =====

// Preload auth components
export const preloadAuthComponents = () => {
  import('@/features/auth/components/LoginModal')
  import('@/features/auth/components/RegisterModal')
}

// Preload post components
export const preloadPostComponents = () => {
  import('@/features/posts/components/PostCard')
  import('@/features/posts/components/CreatePostForm')
}

// Preload reel components
export const preloadReelComponents = () => {
  import('@/features/reels/components/ReelCard')
  import('@/features/posts/components/CreateReelForm')
}

// Preload story components
export const preloadStoryComponents = () => {
  import('@/features/stories/components/StoryViewer')
  import('@/features/stories/components/StoriesBar')
}

// Preload profile components
export const preloadProfileComponents = () => {
  import('@/features/profile/components/profile/ProfileHeader')
  import('@/features/profile/components/profile/ModernProfileHeader')
}

// Preload message components
export const preloadMessageComponents = () => {
  import('@/features/messages/components/ChatWindow')
  import('@/features/messages/components/ConversationsList')
}

// Preload all critical components
export const preloadCriticalComponents = () => {
  preloadAuthComponents()
  preloadPostComponents()
  preloadReelComponents()
  preloadStoryComponents()
}

// ===== EXPORT ALL =====
export default {
  // Raw lazy components
  LoginModal,
  RegisterModal,
  PostCard,
  CreatePostForm,
  CreateReelForm,
  ReelCard,
  StoryViewer,
  StoriesBar,
  ProfileHeader,
  ModernProfileHeader,
  ChatWindow,
  ConversationsList,
  UserSuggestions,
  ExploreGrid,
  NotificationList,

  // Wrapped components
  LoginModalWrapped,
  RegisterModalWrapped,
  PostCardWrapped,

  // Preload functions
  preloadAuthComponents,
  preloadPostComponents,
  preloadReelComponents,
  preloadStoryComponents,
  preloadProfileComponents,
  preloadMessageComponents,
  preloadCriticalComponents
}
