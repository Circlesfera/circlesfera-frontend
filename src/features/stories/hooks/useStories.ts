'use client'

import { useState, useEffect, useCallback } from 'react'
import { Story } from '../types'
import { storyService } from '../services/storyService'

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await storyService.getStories()
      setStories(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando stories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  const createStory = useCallback(async (storyData: { type: 'image' | 'video'; media: File; caption?: string }) => {
    try {
      const response = await storyService.createStory(storyData)
      setStories(prev => [response.data, ...prev])
      return response
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error creando story')
    }
  }, [])

  const deleteStory = useCallback(async (storyId: string) => {
    try {
      await storyService.deleteStory(storyId)
      setStories(prev => prev.filter(story => story.id !== storyId))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error eliminando story')
    }
  }, [])

  const viewStory = useCallback(async (storyId: string) => {
    try {
      await storyService.viewStory(storyId)
      // Actualizar localmente si es necesario
    } catch (err) {
      console.error('Error marcando story como vista:', err)
    }
  }, [])

  return {
    stories,
    loading,
    error,
    createStory,
    deleteStory,
    viewStory,
    refetch: fetchStories
  }
}
