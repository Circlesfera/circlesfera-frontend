import React from 'react'
import { Button } from '@/design-system/Button'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Maximize2,
  Minimize2,
  RotateCcw
} from 'lucide-react'

interface LiveControlsProps {
  isPlaying: boolean
  isMuted: boolean
  isFullscreen: boolean
  volume: number
  onPlayPause: () => void
  onMuteToggle: () => void
  onVolumeChange: (volume: number) => void
  onFullscreenToggle: () => void
  onSettings: () => void
  onRestart: () => void
  className?: string
}

export const LiveControls: React.FC<LiveControlsProps> = ({
  isPlaying,
  isMuted,
  isFullscreen,
  volume,
  onPlayPause,
  onMuteToggle,
  onVolumeChange,
  onFullscreenToggle,
  onSettings,
  onRestart,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between p-4 bg-black/80 text-white ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onPlayPause}
          className="text-white hover:bg-white/20"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </Button>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMuteToggle}
            className="text-white hover:bg-white/20"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
            className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Restart Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRestart}
          className="text-white hover:bg-white/20"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        {/* Settings Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          className="text-white hover:bg-white/20"
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* Fullscreen Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onFullscreenToggle}
          className="text-white hover:bg-white/20"
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  )
}

export default LiveControls
