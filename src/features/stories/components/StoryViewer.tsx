import React, { useState, useEffect, useCallback, memo } from 'react'
import Image from 'next/image'
import { Button } from '@/design-system/Button'
import { Avatar } from '@/design-system/Avatar'
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { Story } from '../types'
import { useAuth } from '@/features/auth/AuthContext'
import { viewStory } from '../services/storyService'
import logger from '@/utils/logger'

interface StoryViewerProps {
  stories: Story[]
  initialIndex?: number
  onClose: () => void
  onStoryEnd?: () => void
  className?: string
}

const StoryViewer = memo(({
  stories,
  initialIndex = 0,
  onClose,
  onStoryEnd,
  className = ''
}: StoryViewerProps) => {
  const { user } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [hasViewed, setHasViewed] = useState(false)

  const currentStory = stories[currentIndex]

  const markAsViewed = useCallback(async (storyId: string) => {
    if (hasViewed || !user) return

    try {
      await viewStory(storyId)
      setHasViewed(true)
      logger.info('Story marked as viewed', { storyId, userId: user.id })
    } catch (error) {
      logger.error('Error marking story as viewed', error)
    }
  }, [hasViewed, user])

  const nextStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setProgress(0)
      setHasViewed(false)
    } else {
      onStoryEnd?.()
    }
  }, [currentIndex, stories.length, onStoryEnd])

  const previousStory = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setProgress(0)
      setHasViewed(false)
    }
  }, [currentIndex])

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  // Progress bar animation
  useEffect(() => {
    if (!isPlaying || !currentStory) return

    const duration = currentStory.duration || 5
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration * 10)) // 10 updates per second

        if (newProgress >= 100) {
          clearInterval(interval)
          nextStory()
          return 0
        }

        return newProgress
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, currentStory, nextStory])

  // Mark as viewed when story starts
  useEffect(() => {
    if (currentStory && !hasViewed) {
      markAsViewed(currentStory.id)
    }
  }, [currentStory, hasViewed, markAsViewed])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          previousStory()
          break
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          nextStory()
          break
        case 'p':
        case 'P':
          handlePlayPause()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onClose, previousStory, nextStory, handlePlayPause])

  if (!currentStory) {
    return null
  }

  return (
    <div className={`fixed inset-0 z-50 bg-black ${className}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar
              src={currentStory.user?.avatar}
              alt={currentStory.user?.username || 'Usuario'}
              size="sm"
            />
            <div>
              <p className="text-white font-semibold">
                {currentStory.user?.username}
              </p>
              <p className="text-white/70 text-sm">
                {new Date(currentStory.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="flex space-x-1">
          {stories.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all duration-100 ${index < currentIndex
                    ? 'w-full'
                    : index === currentIndex
                      ? 'w-full'
                      : 'w-0'
                  }`}
                style={{
                  width: index === currentIndex ? `${progress}%` : undefined,
                  transition: index === currentIndex ? 'width 100ms linear' : undefined
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Story Content */}
      <div className="relative w-full h-full">
        {currentStory.type === 'image' ? (
          <Image
            src={currentStory.mediaUrl}
            alt="Story"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <video
            src={currentStory.mediaUrl}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            onEnded={nextStory}
          />
        )}

        {/* Text Overlay */}
        {currentStory.text && (
          <div
            className="absolute bottom-20 left-0 right-0 p-4"
            style={{
              backgroundColor: currentStory.backgroundColor,
              color: currentStory.fontColor
            }}
          >
            <p className="text-center text-lg font-semibold">
              {currentStory.text}
            </p>
          </div>
        )}

        {/* Navigation Areas */}
        <div className="absolute inset-0 flex">
          <div
            className="flex-1 cursor-pointer"
            onClick={previousStory}
          />
          <div
            className="flex-1 cursor-pointer"
            onClick={nextStory}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
          <Button
            variant="ghost"
            size="sm"
            onClick={previousStory}
            disabled={currentIndex === 0}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>

        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
          <Button
            variant="ghost"
            size="sm"
            onClick={nextStory}
            disabled={currentIndex === stories.length - 1}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Heart className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
})

StoryViewer.displayName = 'StoryViewer'

export default StoryViewer
