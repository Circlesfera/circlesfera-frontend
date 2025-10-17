import React from 'react'
import { PostCard as BasePostCard } from '@/features/posts/components'

interface ExplorePostCardProps {
  post: any // TODO: Tipar correctamente
  onPlay?: (postId: string) => void
  size?: 'small' | 'medium' | 'large'
}

export const PostCard: React.FC<ExplorePostCardProps> = ({
  post,
  onPlay,
  size = 'medium'
}) => {
  return (
    <BasePostCard
      post={post}
      size={size}
      onPostDeleted={() => {
        // TODO: Manejar eliminación de post
      }}
    />
  )
}

export default PostCard
