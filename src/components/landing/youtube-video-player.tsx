"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface YouTubeVideoPlayerProps {
  videoId: string
}

export function YouTubeVideoPlayer({ videoId }: YouTubeVideoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [player, setPlayer] = useState<any>(null)

  useEffect(() => {
    let ytPlayer: any = null

    // Cargar la API de YouTube IFrame Player
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer()
        return
      }

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        const firstScriptTag = document.getElementsByTagName("script")[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
      }

      const originalCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (originalCallback) originalCallback()
        initializePlayer()
      }
    }

    const initializePlayer = () => {
      if (playerRef.current && !ytPlayer && window.YT && window.YT.Player) {
        ytPlayer = new window.YT.Player(playerRef.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
          },
          events: {
            onReady: (event: any) => {
              setPlayer(event.target)
              event.target.setVolume(volume)
            },
            onStateChange: (event: any) => {
              setIsPlaying(event.data === window.YT.PlayerState.PLAYING)
            },
          },
        })
      }
    }

    loadYouTubeAPI()

    return () => {
      if (ytPlayer && typeof ytPlayer.destroy === "function") {
        ytPlayer.destroy()
      }
    }
  }, [videoId, volume])

  const handlePlayPause = () => {
    if (!player) return
    if (isPlaying) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }

  const handleMute = () => {
    if (!player) return
    if (isMuted) {
      player.unMute()
      setIsMuted(false)
    } else {
      player.mute()
      setIsMuted(true)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    if (!player) return
    setVolume(newVolume)
    player.setVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  const handleRestart = () => {
    if (!player) return
    player.seekTo(0)
    player.playVideo()
  }

  const handleFullscreen = () => {
    if (!playerRef.current) return
    const iframe = playerRef.current.querySelector("iframe")
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen()
      } else if ((iframe as any).webkitRequestFullscreen) {
        ;(iframe as any).webkitRequestFullscreen()
      } else if ((iframe as any).mozRequestFullScreen) {
        ;(iframe as any).mozRequestFullScreen()
      }
    }
  }

  return (
    <div className="relative w-full">
      <div ref={playerRef} className="aspect-video w-full" />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handlePlayPause}
            className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRestart}
            className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Reiniciar"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMute}
              className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label={isMuted ? "Activar sonido" : "Silenciar"}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="h-2 w-24 cursor-pointer appearance-none rounded-lg bg-white/20 accent-white"
              aria-label="Volumen"
            />
            <span className="text-xs text-white">{volume}%</span>
          </div>

          <div className="ml-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFullscreen}
              className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Pantalla completa"
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Extender el tipo Window para incluir YT
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

