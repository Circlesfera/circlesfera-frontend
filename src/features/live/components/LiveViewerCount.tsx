import React, { useState, useEffect } from 'react'
import { Eye, Users } from 'lucide-react'

interface LiveViewerCountProps {
  viewerCount: number
  isLive: boolean
  className?: string
}

export const LiveViewerCount: React.FC<LiveViewerCountProps> = ({
  viewerCount,
  isLive,
  className = ''
}) => {
  const [displayCount, setDisplayCount] = useState(viewerCount)

  useEffect(() => {
    setDisplayCount(viewerCount)
  }, [viewerCount])

  if (!isLive) {
    return null
  }

  const formatViewerCount = (count: number): string => {
    if (count < 1000) {
      return count.toString()
    } else if (count < 1000000) {
      return `${(count / 1000).toFixed(1)}K`
    } else {
      return `${(count / 1000000).toFixed(1)}M`
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span>EN VIVO</span>
      </div>
      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
        <Eye className="w-4 h-4" />
        <span className="text-sm font-medium">
          {formatViewerCount(displayCount)}
        </span>
      </div>
    </div>
  )
}

export default LiveViewerCount
