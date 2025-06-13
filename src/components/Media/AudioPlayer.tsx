"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  VolumeX,
  Music,
  Loader2
} from "lucide-react"
import { useAudio } from "@/contexts/AudioContext"
import { PlayMode } from "@/contexts/AudioContext"

interface AudioPlayerProps {
  className?: string
}

export default function AudioPlayer({ 
  className = "" 
}: AudioPlayerProps) {
  const {
    currentAudio,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    playMode,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
  } = useAudio()

  // 格式化时间
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // 获取播放模式文字
  const getPlayModeText = (mode: PlayMode) => {
    switch (mode) {
      case PlayMode.SEQUENCE:
        return "顺序播放"
      case PlayMode.LOOP_ONE:
        return "单曲循环"
      case PlayMode.RANDOM:
        return "随机播放"
      default:
        return "顺序播放"
    }
  }

  // 跳转到指定时间
  const handleSeek = (values: number[]) => {
    seek(values[0])
  }

  // 音量控制
  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0])
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* 歌曲信息 */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <Music className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <h3 className="font-medium">
            {currentAudio?.title || "暂无音乐"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)} • {getPlayModeText(playMode)}
          </p>
        </div>
      </div>

      {/* 播放控制 */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={playPrevious}
          disabled={!currentAudio}
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full"
          onClick={togglePlay}
          disabled={!currentAudio || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={playNext}
          disabled={!currentAudio}
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* 进度条 */}
      <div className="flex-1 max-w-md">
        <Slider 
          value={[currentTime]} 
          max={duration || 100} 
          step={1} 
          onValueChange={handleSeek}
          disabled={!currentAudio || duration === 0}
        />
      </div>

      {/* 音量控制 */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleMute}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
        <Slider 
          value={[isMuted ? 0 : volume]} 
          max={100} 
          step={1} 
          onValueChange={handleVolumeChange}
          className="w-20"
        />
      </div>
    </div>
  )
} 