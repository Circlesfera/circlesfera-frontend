'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react'
import { Button } from '@/design-system/Button'
import { LiveStream } from '../types'
import { LiveChat } from './LiveChat'
import { LiveControls } from './LiveControls'

interface LivePlayerProps {
  liveStream: LiveStream
  stream?: LiveStream
  className?: string
}

export function LivePlayer({ liveStream, stream, className = "" }: LivePlayerProps) {
  const currentStream = stream || liveStream
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Simular stream en vivo (en producción sería WebRTC o HLS)
    if (currentStream.streamUrl) {
      video.src = currentStream.streamUrl
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVolumeChange = () => setVolume(video.volume)
    const handleMute = () => setIsMuted(video.muted)

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('volumechange', handleVolumeChange)
    video.addEventListener('mute', handleMute)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('volumechange', handleVolumeChange)
      video.removeEventListener('mute', handleMute)
    }
  }, [currentStream.streamUrl])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
  }

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current
    if (!video) return

    video.volume = newVolume
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!document.fullscreenElement) {
      video.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    setTimeout(() => setShowControls(false), 3000)
  }

  return (
    <div
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Player */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        controls={false}
        autoPlay
        muted={isMuted}
      />

      {/* Live Badge */}
      <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-sm font-medium flex items-center">
        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
        EN VIVO
      </div>

      {/* Viewer Count */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        {currentStream.viewers} espectadores
      </div>

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>

              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat */}
      <div className="absolute top-4 right-4 mt-12">
        <LiveChat
          streamId={currentStream.id}
          allowComments={true}
          currentUser={{ id: 'current-user', username: 'usuario' }}
          canModerate={false}
        />
      </div>

      {/* Live Controls for Streamer */}
      {currentStream.isOwner && (
        <div className="absolute bottom-4 left-4">
          <LiveControls
            streamId={currentStream.id}
            isStreaming={currentStream.status === 'live'}
            onStreamStart={() => { }}
            onStreamStop={() => { }}
            onRecordingReady={async () => { }}
            className=""
          />
        </div>
      )}
    </div>
  )
}

export default LivePlayer
