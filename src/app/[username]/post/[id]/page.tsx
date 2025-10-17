'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getPostById } from '@/services/postService'
import { PostCard } from '@/features/posts/components'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Post } from '@/types'
import logger from '@/utils/logger'

export default function UserPostDetailPage() {
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const postId = params.id as string

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)

        logger.debug('Fetching post:', { postId })
        const response = await getPostById(postId)

        if (response.success && response.post) {
          setPost(response.post)
        } else {
          setError('Post no encontrado')
        }
      } catch (err) {
        logger.error('Error fetching post:', err)
        setError('Error al cargar el post')
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      fetchPost()
    }
  }, [postId])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-xl mx-auto mt-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                </div>
              </div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !post) {
    return (
      <ProtectedRoute>
        <div className="max-w-xl mx-auto mt-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Post no encontrado
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error || 'El post que buscas no existe o ha sido eliminado.'}
            </p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto mt-8">
        <PostCard post={post} />
      </div>
    </ProtectedRoute>
  )
}
