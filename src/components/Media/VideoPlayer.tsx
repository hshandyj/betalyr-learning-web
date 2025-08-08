"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  SkipBack,
  SkipForward
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import styles from './VideoPlayer.module.css'

interface VideoPlayerProps {
  videoUrl: string
  previewImage?: string
  title?: string
  className?: string
}

export default function VideoPlayer({ 
  videoUrl, 
  previewImage, 
  title,
  className = "" 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [playbackError, setPlaybackError] = useState<string | null>(null)

  // 格式化時間
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // 播放/暫停
  const togglePlay = async () => {
    if (!videoRef.current || hasError) return
    
    try {
      setPlaybackError(null)
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        // 确保视频已加载
        if (videoRef.current.readyState < 2) {
          setIsLoading(true)
          return
        }
        await videoRef.current.play()
      }
    } catch (error) {
      console.error('播放控制失败:', error)
      setPlaybackError('播放失败，请检查网络连接或视频文件')
    }
  }

  // 静音/取消静音
  const toggleMute = () => {
    if (!videoRef.current) return
    
    const newMuted = !isMuted
    videoRef.current.muted = newMuted
    setIsMuted(newMuted)
  }

  // 设置音量
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    
    const newVolume = parseFloat(e.target.value)
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  // 跳转到指定时间
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    
    const seekTime = parseFloat(e.target.value)
    videoRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  // 快进/快退
  const skipTime = (seconds: number) => {
    if (!videoRef.current) return
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  // 全屏切换
  const toggleFullscreen = () => {
    if (!videoRef.current) return
    
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // 监听视频事件
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    // 检查视频URL是否有效
    if (!videoUrl || videoUrl.includes('undefined')) {
      setIsLoading(false)
      setHasError(true)
      setPlaybackError('无效的视频URL')
      return
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setHasError(false)
      setPlaybackError(null)
    }

    const handleLoadedData = () => {
      setDuration(video.duration || 0)
      setIsLoading(false)
      setHasError(false)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      setHasError(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setPlaybackError(null)
    }
    
    const handlePause = () => setIsPlaying(false)
    
    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    const handleError = (e: Event) => {
      console.error('视频加载错误:', e)
      setIsLoading(false)
      setHasError(true)
      setIsPlaying(false)
      const errorTarget = e.target as HTMLVideoElement
      const error = errorTarget.error
      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            setPlaybackError('视频播放被中止')
            break
          case error.MEDIA_ERR_NETWORK:
            setPlaybackError('网络错误，无法加载视频')
            break
          case error.MEDIA_ERR_DECODE:
            setPlaybackError('视频解码错误')
            break
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            setPlaybackError('不支持的视频格式')
            break
          default:
            setPlaybackError('视频加载失败')
        }
      }
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    // 添加事件监听器
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('volumechange', handleVolumeChange)
    video.addEventListener('error', handleError)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    // 清理函数
    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('volumechange', handleVolumeChange)
      video.removeEventListener('error', handleError)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [videoUrl])

  return (
    <Card className={`overflow-hidden bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700 p-0 ${className}`}>
      <div 
        className="relative aspect-video bg-black group"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* 视频元素 */}
        <video
          ref={videoRef}
          className="w-full h-full"
          poster={previewImage}
          preload="metadata"
          playsInline
          onClick={togglePlay}
        >
          {videoUrl && !videoUrl.includes('undefined') && (
            <source src={videoUrl} type="video/mp4" />
          )}
          您的浏览器不支持视频播放。
        </video>

        {/* 加载状态 */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-lg">加载中...</div>
          </div>
        )}

        {/* 错误状态 */}
        {(hasError || playbackError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <div className="text-white text-lg mb-2">⚠️ 加载失败</div>
            <div className="text-white text-sm text-center px-4">
              {playbackError || '无法加载视频，请检查网络连接'}
            </div>
            <Button 
              className="mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setHasError(false)
                setPlaybackError(null)
                setIsLoading(true)
                if (videoRef.current) {
                  videoRef.current.load()
                }
              }}
            >
              重试
            </Button>
          </div>
        )}

        {/* 播放按钮覆层 */}
        {!isLoading && !hasError && !playbackError && (
          <div 
            className={`absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors cursor-pointer ${showControls ? 'bg-black/10' : ''}`}
            onClick={togglePlay}
          >
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${showControls && !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-black/50 hover:bg-black/70 text-white border-none pointer-events-none"
              >
                <Play className="h-8 w-8" />
              </Button>
            </div>
          </div>
        )}

        {/* 底部控制栏 */}
        {!isLoading && !hasError && !playbackError && (
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* 进度条 */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className={`w-full ${styles.slider}`}
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
              }}
            />
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center gap-3">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={() => skipTime(-10)}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={() => skipTime(10)}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            {/* 音量控制 */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className={`w-20 ${styles.slider}`}
              />
            </div>
            
            <div className="flex-1"></div>
            
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
        )}
      </div>


    </Card>
  )
} 