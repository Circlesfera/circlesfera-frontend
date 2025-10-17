import React, { useState } from 'react'
import { Button } from '@/design-system/Button'
import { useToast } from '@/components/Toast'

interface FollowButtonProps {
  userId: string
  isFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  isFollowing = false,
  onFollowChange,
  size = 'md',
  variant = 'default'
}) => {
  const [loading, setLoading] = useState(false)
  const [following, setFollowing] = useState(isFollowing)
  const toast = useToast()

  const handleFollow = async () => {
    if (loading) return

    setLoading(true)

    try {
      // TODO: Implementar llamada a la API
      // const response = await api.post(`/users/${userId}/follow`)

      // Simular llamada por ahora
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newFollowingState = !following
      setFollowing(newFollowingState)
      onFollowChange?.(newFollowingState)

      toast.success(
        newFollowingState
          ? 'Ahora sigues a este usuario'
          : 'Has dejado de seguir a este usuario'
      )
    } catch (error) {
      toast.error('Error al actualizar el seguimiento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      size={size}
      variant={following ? 'secondary' : variant}
      className={following ? 'bg-gray-200 text-gray-700' : ''}
    >
      {loading ? '...' : following ? 'Siguiendo' : 'Seguir'}
    </Button>
  )
}

export default FollowButton
