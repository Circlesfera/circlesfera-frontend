import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, Users, Play } from 'lucide-react'
import { LiveViewerCount } from './LiveViewerCount'

interface LiveStream {
  id: string
  title: string
  description?: string
  thumbnail?: string
  streamer: {
    id: string
    username: string
    avatar?: string
  }
  viewerCount: number
  isLive: boolean
  category?: string
  tags?: string[]
  startedAt: string
}

interface LiveStreamCardProps {
  stream: LiveStream
  onClick?: (stream: LiveStream) => void
  className?: string
}

export const LiveStreamCard: React.FC<LiveStreamCardProps> = ({
  stream,
  onClick,
  className = ''
}) => {
  const formatDuration = (startedAt: string): string => {
    const now = new Date()
    const start = new Date(startedAt)
    const diffInMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`
    } else {
      const hours = Math.floor(diffInMinutes / 60)
      const minutes = diffInMinutes % 60
      return `${hours}h ${minutes}m`
    }
  }

  const handleClick = () => {
    onClick?.(stream)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`relative group cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <Link href={`/live/${stream.id}`}>
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          {/* Thumbnail */}
          {stream.thumbnail ? (
            <Image
              src={stream.thumbnail}
              alt={stream.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Play className="w-12 h-12 text-white" />
            </div>
          )}

          {/* Live Badge */}
          {stream.isLive && (
            <div className="absolute top-3 left-3">
              <LiveViewerCount
                viewerCount={stream.viewerCount}
                isLive={stream.isLive}
                className="text-white"
              />
            </div>
          )}

          {/* Duration */}
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(stream.startedAt)}
          </div>

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Play className="w-8 h-8 text-white" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Stream Info */}
        <div className="mt-3 space-y-2">
          {/* Streamer Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
              {stream.streamer.avatar ? (
                <Image
                  src={stream.streamer.avatar}
                  alt={stream.streamer.username}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {stream.streamer.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {stream.streamer.username}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {stream.isLive ? 'En vivo' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {stream.title}
          </h3>

          {/* Category and Tags */}
          {(stream.category || stream.tags?.length) && (
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              {stream.category && (
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {stream.category}
                </span>
              )}
              {stream.tags?.slice(0, 2).map((tag, index) => (
                <span key={index} className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default LiveStreamCard
