import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/design-system/Button'

interface LiveCaptureProps {
  streamKey: string
  rtmpUrl: string
  isLive: boolean
  onStart: () => void
  onStop: () => void
}

export const LiveCapture: React.FC<LiveCaptureProps> = ({
  streamKey,
  rtmpUrl,
  isLive,
  onStart,
  onStop
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        })

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          setStream(mediaStream)
        }
      } catch (err) {
        setError('Error al acceder a la cámara')
        console.error('Camera error:', err)
      }
    }

    initCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleStart = () => {
    onStart()
    // TODO: Implementar streaming real con WebRTC o similar
  }

  const handleStop = () => {
    onStop()
    // TODO: Detener streaming
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-64 object-cover"
        />
        {isLive && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">EN VIVO</span>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          <strong>Stream Key:</strong> {streamKey}
        </div>
        <div className="text-sm text-gray-600">
          <strong>RTMP URL:</strong> {rtmpUrl}
        </div>
      </div>

      <div className="flex space-x-3">
        {!isLive ? (
          <Button
            onClick={handleStart}
            variant="primary"
            className="flex-1"
            disabled={!stream}
          >
            Iniciar Transmisión
          </Button>
        ) : (
          <Button
            onClick={handleStop}
            variant="destructive"
            className="flex-1"
          >
            Detener Transmisión
          </Button>
        )}
      </div>
    </div>
  )
}

export default LiveCapture
