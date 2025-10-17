import React, { useState, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import { Avatar } from '@/design-system/Avatar'
import { Plus } from 'lucide-react'
import { UserWithStories } from '../services/storyService'
import { StoryViewer } from './StoryViewer'
import logger from '@/utils/logger'

interface StoriesBarProps {
  usersWithStories: UserWithStories[]
  onCreateStory?: () => void
  onUserClick?: (user: UserWithStories) => void
  className?: string
}

const StoriesBar = memo(({
  usersWithStories,
  onCreateStory,
  onUserClick,
  className = ''
}: StoriesBarProps) => {
  const [selectedUser, setSelectedUser] = useState<UserWithStories | null>(null)
  const [isViewing, setIsViewing] = useState(false)

  const handleUserClick = useCallback((user: UserWithStories) => {
    if (user.stories.length === 0) return

    setSelectedUser(user)
    setIsViewing(true)
    onUserClick?.(user)
    
    logger.info('User stories opened', { 
      userId: user.id, 
      username: user.username,
      storiesCount: user.stories.length 
    })
  }, [onUserClick])

  const handleCloseViewer = useCallback(() => {
    setIsViewing(false)
    setSelectedUser(null)
  }, [])

  const handleStoryEnd = useCallback(() => {
    setIsViewing(false)
    setSelectedUser(null)
  }, [])

  return (
    <>
      <div className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center space-x-4 p-4 overflow-x-auto scrollbar-hide">
          {/* Create Story Button */}
          {onCreateStory && (
            <div className="flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCreateStory}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors">
                    <Plus className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500 transition-colors" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Tu Story
                </span>
              </motion.button>
            </div>
          )}

          {/* Users with Stories */}
          {usersWithStories.map((user) => (
            <div key={user.id} className="flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleUserClick(user)}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="relative">
                  <Avatar
                    src={user.avatar}
                    alt={user.username}
                    size="lg"
                    className={`${
                      user.hasViewed
                        ? 'ring-2 ring-gray-300 dark:ring-gray-600'
                        : 'ring-2 ring-blue-500'
                    }`}
                  />
                  {user.stories.length > 0 && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {user.stories.length}
                      </span>
                    </div>
                  )}
                </div>
                <span className={`text-xs font-medium max-w-16 truncate ${
                  user.hasViewed
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {user.username}
                </span>
              </motion.button>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {isViewing && selectedUser && (
        <StoryViewer
          stories={selectedUser.stories}
          onClose={handleCloseViewer}
          onStoryEnd={handleStoryEnd}
        />
      )}
    </>
  )
})

StoriesBar.displayName = 'StoriesBar'

export default StoriesBar