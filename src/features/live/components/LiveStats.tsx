import React from 'react'
import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react'

interface LiveStatsProps {
  viewerCount: number
  likeCount: number
  commentCount: number
  shareCount: number
  duration: string
  peakViewers: number
  className?: string
}

export const LiveStats: React.FC<LiveStatsProps> = ({
  viewerCount,
  likeCount,
  commentCount,
  shareCount,
  duration,
  peakViewers,
  className = ''
}) => {
  const formatNumber = (num: number): string => {
    if (num < 1000) {
      return num.toString()
    } else if (num < 1000000) {
      return `${(num / 1000).toFixed(1)}K`
    } else {
      return `${(num / 1000000).toFixed(1)}M`
    }
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
      {/* Viewers */}
      <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <Eye className="w-5 h-5 text-red-600 dark:text-red-400" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatNumber(viewerCount)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Espectadores
          </p>
        </div>
      </div>

      {/* Likes */}
      <div className="flex items-center space-x-2 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
        <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatNumber(likeCount)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Me gusta
          </p>
        </div>
      </div>

      {/* Comments */}
      <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatNumber(commentCount)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Comentarios
          </p>
        </div>
      </div>

      {/* Shares */}
      <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <Share2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatNumber(shareCount)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Compartidos
          </p>
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {duration}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Duración
          </p>
        </div>
      </div>

      {/* Peak Viewers */}
      <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatNumber(peakViewers)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Pico máximo
          </p>
        </div>
      </div>
    </div>
  )
}

export default LiveStats
