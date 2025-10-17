'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Share, MoreHorizontal, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Reel } from '../types'

interface ReelCardProps {
  reel: Reel
  isPlaying?: boolean
  onPlay?: () => void
  onPause?: () => void
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
}

export default function ReelCard({
  reel,
  isPlaying = false,
  onPlay,
  onPause,
  onLike,
  onComment,
  onShare
}: ReelCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.()
  }

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause?.()
    } else {
      onPlay?.()
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      {/* Video */}
      <div
        className="relative w-full h-full"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={reel.videoUrl}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
        />

        {/* Overlay de controles */}
        {showControls && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className="p-4 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Información del usuario */}
      <div className="absolute bottom-20 left-4 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={reel.user.avatar || '/default-avatar.png'}
              alt={reel.user.username}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-sm">{reel.user.username}</p>
            <p className="text-xs text-gray-300">
              {new Date(reel.createdAt).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>

        {/* Caption */}
        {reel.caption && (
          <div className="mb-4">
            <p className="text-sm leading-relaxed">{reel.caption}</p>
          </div>
        )}

        {/* Hashtags */}
        {reel.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {reel.hashtags.map((hashtag, index) => (
              <span key={index} className="text-blue-400 text-sm">
                #{hashtag}
              </span>
            ))}
          </div>
        )}

        {/* Audio info */}
        {reel.audioTitle && (
          <div className="flex items-center space-x-2 text-sm">
            <Volume2 className="w-4 h-4" />
            <span>{reel.audioTitle}</span>
            {reel.audioArtist && <span>• {reel.audioArtist}</span>}
          </div>
        )}
      </div>

      {/* Acciones laterales */}
      <div className="absolute bottom-20 right-4 flex flex-col items-center space-y-6">
        {/* Like */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleLike}
            className={`p-3 rounded-full transition-all ${isLiked ? 'bg-red-500' : 'bg-gray-800 bg-opacity-50'
              }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'text-white fill-white' : 'text-white'}`} />
          </button>
          <span className="text-white text-xs mt-1">{formatNumber(reel.likes.length)}</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center">
          <button
            onClick={onComment}
            className="p-3 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-xs mt-1">{formatNumber(reel.comments.length)}</span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center">
          <button
            onClick={onShare}
            className="p-3 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
          >
            <Share className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-xs mt-1">{formatNumber(reel.shares)}</span>
        </div>

        {/* More options */}
        <button className="p-3 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all">
          <MoreHorizontal className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Controles de audio */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleMute}
          className="p-2 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </div>
  )
}
