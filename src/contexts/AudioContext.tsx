"use client"

import * as React from "react"
import { toast } from "@/hooks/use-toast"
import { getAudioDetail } from "@/service/mediaService"
import { AudioDetail, PublicAudioList } from "@/types/media"

interface AudioContextType {
  // 音频状态
  currentAudio: PublicAudioList | null
  audioDetail: AudioDetail | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isLoading: boolean
  
  // 音频控制方法
  setCurrentAudio: (audio: PublicAudioList | null) => void
  clearCurrentAudio: () => void
  togglePlay: () => Promise<void>
  playAudio: (audio: PublicAudioList) => void
  playNext: () => void
  playPrevious: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  
  // 播放列表
  audioList: PublicAudioList[]
  setAudioList: (list: PublicAudioList[]) => void
  
  // 缓存管理
  clearCache: () => void
  getCacheSize: () => number
}

const AudioContext = React.createContext<AudioContextType | null>(null)

// 缓存项接口，包含时间戳用于过期检查
interface CacheItem {
  detail: AudioDetail
  timestamp: number
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  
  // 音频状态
  const [currentAudio, setCurrentAudio] = React.useState<PublicAudioList | null>(null)
  const [audioDetail, setAudioDetail] = React.useState<AudioDetail | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [volume, setVolumeState] = React.useState(80)
  const [isMuted, setIsMuted] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [audioList, setAudioList] = React.useState<PublicAudioList[]>([])
  
  // 缓存配置
  const CACHE_EXPIRE_TIME = 30 * 60 * 1000 // 30分钟过期
  const MAX_CACHE_SIZE = 50 // 最大缓存50个音频
  
  // 缓存已加载的音频详情，避免重复请求
  const audioDetailCache = React.useRef<Map<string, CacheItem>>(new Map())

  // 清理过期缓存
  const cleanExpiredCache = React.useCallback(() => {
    const now = Date.now()
    const cache = audioDetailCache.current
    
    for (const [key, item] of cache.entries()) {
      if (now - item.timestamp > CACHE_EXPIRE_TIME) {
        cache.delete(key)
      }
    }
  }, [])

  // 限制缓存大小
  const limitCacheSize = React.useCallback(() => {
    const cache = audioDetailCache.current
    if (cache.size > MAX_CACHE_SIZE) {
      // 删除最旧的缓存项
      const entries = Array.from(cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toDelete = entries.slice(0, cache.size - MAX_CACHE_SIZE)
      toDelete.forEach(([key]) => cache.delete(key))
    }
  }, [])

  // 清理所有缓存
  const clearCache = React.useCallback(() => {
    audioDetailCache.current.clear()
    console.log('音频缓存已清理')
  }, [])

  // 获取缓存大小
  const getCacheSize = React.useCallback(() => {
    return audioDetailCache.current.size
  }, [])

  // 创建全局音频元素
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio()
      audioRef.current.volume = volume / 100
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
      }
    }
  }, [])

  // 加载音频详情（添加缓存机制）
  const loadAudioDetail = React.useCallback(async (audioId: string, wasPlaying: boolean = false) => {
    try {
      setIsLoading(true)
      
      // 清理过期缓存
      cleanExpiredCache()
      
      // 检查缓存
      const cachedItem = audioDetailCache.current.get(audioId)
      if (cachedItem) {
        const cachedDetail = cachedItem.detail
        setAudioDetail(cachedDetail)
        if (audioRef.current && audioRef.current.src !== cachedDetail.mediaUrl) {
          audioRef.current.src = cachedDetail.mediaUrl
          audioRef.current.load()
          
          if (wasPlaying) {
            const handleCanPlay = async () => {
              try {
                await audioRef.current!.play()
              } catch (error) {
                console.error("自动播放失败:", error)
                setIsPlaying(false)
              }
              audioRef.current!.removeEventListener('canplay', handleCanPlay)
            }
            audioRef.current.addEventListener('canplay', handleCanPlay)
          }
        }
        return cachedDetail
      }
      
      // 如果没有缓存，则请求后端
      const detail = await getAudioDetail(audioId)
      if (detail) {
        // 缓存结果（包含时间戳）
        audioDetailCache.current.set(audioId, {
          detail,
          timestamp: Date.now()
        })
        
        // 限制缓存大小
        limitCacheSize()
        
        setAudioDetail(detail)
        
        if (audioRef.current) {
          audioRef.current.src = detail.mediaUrl
          audioRef.current.load()
          
          if (wasPlaying) {
            const handleCanPlay = async () => {
              try {
                await audioRef.current!.play()
              } catch (error) {
                console.error("自动播放失败:", error)
                setIsPlaying(false)
              }
              audioRef.current!.removeEventListener('canplay', handleCanPlay)
            }
            audioRef.current.addEventListener('canplay', handleCanPlay)
          }
        }
        return detail
      } else {
        throw new Error("无法获取音频详情")
      }
    } catch (error) {
      console.error("Error loading audio detail:", error)
      setIsPlaying(false)
      toast({
        title: "加载失败",
        description: "无法加载音频详情，请重试",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [cleanExpiredCache, limitCacheSize])

  // 播放指定音频
  const playAudio = React.useCallback((audio: PublicAudioList) => {
    setCurrentAudio(audio)
  }, [])

  // 播放/暂停控制
  const togglePlay = React.useCallback(async () => {
    if (!audioRef.current || !currentAudio) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        await audioRef.current.play()
      }
    } catch (error) {
      console.error("播放控制失败:", error)
      setIsPlaying(false)
      toast({
        title: "播放失败",
        description: "音频播放失败，请检查网络连接",
        variant: "destructive",
      })
    }
  }, [isPlaying, currentAudio])

  // 下一首
  const playNext = React.useCallback(() => {
    if (!currentAudio || audioList.length === 0) return
    const currentIndex = audioList.findIndex(audio => audio.id === currentAudio.id)
    const nextIndex = currentIndex < audioList.length - 1 ? currentIndex + 1 : 0
    setCurrentAudio(audioList[nextIndex])
  }, [currentAudio, audioList])

  // 上一首
  const playPrevious = React.useCallback(() => {
    if (!currentAudio || audioList.length === 0) return
    const currentIndex = audioList.findIndex(audio => audio.id === currentAudio.id)
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : audioList.length - 1
    setCurrentAudio(audioList[previousIndex])
  }, [currentAudio, audioList])

  // 跳转到指定时间
  const seek = React.useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  // 设置音量
  const setVolume = React.useCallback((newVolume: number) => {
    setVolumeState(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
      setIsMuted(newVolume === 0)
    }
  }, [])

  // 静音切换
  const toggleMute = React.useCallback(() => {
    if (!audioRef.current) return
    const newMuted = !isMuted
    audioRef.current.muted = newMuted
    setIsMuted(newMuted)
  }, [isMuted])

  // 清空当前音频
  const clearCurrentAudio = React.useCallback(() => {
    setCurrentAudio(null)
  }, [])

  // 当前音频变化时加载详情（只在音频真正切换时调用）
  React.useEffect(() => {
    if (currentAudio) {
      const wasPlaying = isPlaying
      // 检查是否真的是新音频
      if (!audioDetail || audioDetail.id !== currentAudio.id) {
        loadAudioDetail(currentAudio.id, wasPlaying)
      }
    } else {
      setAudioDetail(null)
      if (audioRef.current && audioRef.current.src) {
        audioRef.current.removeAttribute('src')
        audioRef.current.load()
      }
    }
  }, [currentAudio]) // 只依赖 currentAudio，移除其他依赖

  // 设置音频事件监听器
  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      // 自动播放下一首
      playNext()
    }

    const handleError = (e: Event) => {
      if (!audio.src || audio.src === '' || !currentAudio) {
        return
      }
      
      console.error("音频播放错误:", e)
      setIsPlaying(false)
      toast({
        title: "播放错误",
        description: "音频播放出现错误",
        variant: "destructive",
      })
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [playNext, currentAudio])

  const contextValue: AudioContextType = {
    // 状态
    currentAudio,
    audioDetail,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    audioList,
    
    // 方法
    setCurrentAudio,
    clearCurrentAudio,
    togglePlay,
    playAudio,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    setAudioList,
    
    // 缓存管理
    clearCache,
    getCacheSize,
  }

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = React.useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
} 