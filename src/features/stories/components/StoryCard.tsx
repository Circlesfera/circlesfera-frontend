'use client'

import React from 'react'
import Image from 'next/image'
import { Clock, Eye } from 'lucide-react'
import { Story } from '../types'

interface StoryCardProps {
  story: Story
  onClick: () => void
  isViewed?: boolean
}

export default function StoryCard({ story, onClick, isViewed = false }: StoryCardProps) {
  // const timeAgo = new Date(story.createdAt).toLocaleTimeString('es-ES', {
  //   hour: '2-digit',
  //   minute: '2-digit'
  // })

  return (
    <div
      className={`
        relative w-16 h-16 rounded-full cursor-pointer transition-all duration-200
        ${isViewed
          ? 'ring-2 ring-gray-300 opacity-70'
          : 'ring-2 ring-gradient-to-r from-purple-500 to-pink-500 hover:scale-105'
        }
      `}
      onClick={onClick}
    >
      <div className="w-full h-full rounded-full overflow-hidden">
        <Image
          src={story.mediaUrl}
          alt={`Story de ${story.user.username}`}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Indicador de tiempo */}
      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
        <Clock className="w-3 h-3 text-gray-600" />
      </div>

      {/* Indicador de vistas */}
      {story.views && story.views.length > 0 && (
        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          <Eye className="w-3 h-3" />
        </div>
      )}

      {/* Nombre del usuario */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-center">
        <span className="text-gray-800 font-medium truncate max-w-16 block">
          {story.user.username}
        </span>
      </div>
    </div>
  )
}
