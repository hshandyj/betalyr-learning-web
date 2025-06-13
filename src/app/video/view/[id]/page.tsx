"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  ChevronDown,
  Tag,
  Loader2
} from "lucide-react"
import { useState, useEffect, use } from "react"
import { getVideoDetail } from "@/service/mediaService"
import { VedioDetail } from "@/types/media"
import VideoPlayer from "@/components/Media/VideoPlayer"

// 格式化日期函数
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return '未知时间'
    }
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '未知时间'
  }
}

export default function VideoViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [showDescription, setShowDescription] = useState(false)
  const [video, setVideo] = useState<VedioDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加载视频详情
  useEffect(() => {
    const loadVideoDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 调试日志：检查 ID 参数
        console.log('正在加载视频详情，ID:', id)
        
        if (!id || id === 'undefined') {
          setError("无效的视频ID")
          return
        }
        
        const videoDetail = await getVideoDetail(id)
        console.log('获取到的视频详情:', videoDetail)
        
        if (videoDetail) {
          setVideo(videoDetail)
        } else {
          setError("视频不存在或已被删除")
        }
      } catch (err) {
        setError("获取视频详情失败")
        console.error("Error loading video detail:", err)
      } finally {
        setLoading(false)
      }
    }

    loadVideoDetail()
  }, [id])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>加载视频详情中...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "视频不存在"}</p>
          <Button onClick={() => window.history.back()}>
            返回
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* 视频播放器 */}
          {video.mediaUrl && !video.mediaUrl.includes('undefined') ? (
            <VideoPlayer
              videoUrl={video.mediaUrl}
              previewImage={video.preview}
              title={video.title}
            />
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-red-500 text-lg mb-2">⚠️ 视频加载失败</div>
                  <div className="text-slate-600 dark:text-slate-400">
                    视频地址无效或未找到
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 视频信息 */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{video.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>上传时间: {formatDate(video.uploadTime)}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {video.category}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* 视频描述 */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">视频介绍</h3>
                <div className={`text-sm text-slate-700 dark:text-slate-300 leading-relaxed ${showDescription ? '' : 'line-clamp-3'}`}>
                  {video.description || "暂无描述"}
                </div>
                {video.description && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-3 p-0 h-auto text-blue-600 hover:text-blue-700"
                    onClick={() => setShowDescription(!showDescription)}
                  >
                    {showDescription ? '收起' : '展开更多'}
                    <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showDescription ? 'rotate-180' : ''}`} />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 视频详细信息卡片 */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">视频信息</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">视频ID:</span>
                <span className="text-sm font-mono">{video.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">分类:</span>
                <Badge variant="secondary">{video.category}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">上传时间:</span>
                <span className="text-sm">{formatDate(video.uploadTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">媒体地址:</span>
                <span className="text-sm font-mono text-blue-600 truncate max-w-48" title={video.mediaUrl}>
                  {video.mediaUrl}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 