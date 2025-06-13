"use client"
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Clock, Tag, Upload, Loader2, Trash2, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import UploadVedioDialog from "@/components/Media/UploadVedioDialog"
import { getPublicVedioList } from "@/service/getPublickService"
import { deleteMedia } from "@/service/mediaService"
import { PublicVideoList } from "@/types/media"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function VideoPage() {
  const [videos, setVideos] = React.useState<PublicVideoList[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [deletingVideoId, setDeletingVideoId] = React.useState<string | null>(null)

  // 加载视频列表
  const loadVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getPublicVedioList(1, 20)
      // getPublicVedioList 返回 PaginatedResponse<PublicVideoList>
      if ('data' in result) {
        setVideos(result.data)
      } else {
        setVideos(result as PublicVideoList[])
      }
    } catch (err) {
      setError("获取视频列表失败")
      console.error("Error loading videos:", err)
    } finally {
      setLoading(false)
    }
  }

  // 页面加载时获取视频列表
  React.useEffect(() => {
    loadVideos()
  }, [])

  const handleUploadSuccess = () => {
    // 上传成功后重新获取视频列表
    loadVideos()
    console.log("视频上传成功，刷新列表")
  }

  // 删除视频
  const handleDeleteVideo = async (videoId: string, videoTitle: string) => {
    try {
      setDeletingVideoId(videoId)
      const success = await deleteMedia(videoId)
      
      if (success) {
        toast.success(`视频 "${videoTitle}" 删除成功`)
        // 重新加载视频列表
        loadVideos()
      } else {
        toast.error("删除失败，请重试")
      }
    } catch (error) {
      console.error("Error deleting video:", error)
      toast.error("删除失败，请重试")
    } finally {
      setDeletingVideoId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold">
                Video Learning Center
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Explore high-quality programming tutorials to enhance your technical skills
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Upload Button */}
              <UploadVedioDialog onUploadSuccess={handleUploadSuccess}>
                <Button className="default">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
              </UploadVedioDialog>
              
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">加载中...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <Button onClick={loadVideos} className="mt-4">
              重试
            </Button>
          </div>
        )}

        {/* Video Grid */}
        {!loading && !error && (
          <VideoGrid 
            videos={videos} 
            onDeleteVideo={handleDeleteVideo}
            deletingVideoId={deletingVideoId}
          />
        )}
      </div>
    </div>
  )
}

interface VideoGridProps {
  videos: PublicVideoList[]
  onDeleteVideo: (videoId: string, videoTitle: string) => Promise<void>
  deletingVideoId: string | null
}

function VideoGrid({ videos, onDeleteVideo, deletingVideoId }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <Card key={video.id} className="group transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700 p-0 relative">
          {/* 删除按钮 */}
          <div className="absolute top-2 right-2 z-10">
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white"
                    disabled={deletingVideoId === video.id}
                  >
                    {deletingVideoId === video.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除视频
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    您确定要删除视频 "{video.title}" 吗？此操作无法撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDeleteVideo(video.id, video.title)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <Link href={`/video/view/${video.id}`}>
            <div className="cursor-pointer">
              <div className="relative overflow-hidden rounded-t-lg">
                {/* 视频缩略图 */}
                <div className="aspect-video bg-cover bg-center rounded-t-lg relative">
                  {video.thumbnail ? (
                    <div 
                      className="absolute inset-0 bg-cover bg-center rounded-t-lg"
                      style={{ backgroundImage: `url(${video.thumbnail})` }}
                    />
                  ) : (
                    /* 如果没有缩略图，显示渐变背景 */
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center rounded-t-lg">
                      <div className="text-white/80 text-sm font-medium text-center px-4">
                        {video.title}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center rounded-t-lg">
                    <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                {/* Duration Badge */}
                {video.duration && (
                  <Badge 
                    variant="secondary" 
                    className="absolute bottom-2 right-2 bg-black/80 text-white backdrop-blur-sm"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {video.duration}
                  </Badge>
                )}
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {video.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm">
                  {video.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* 视频信息 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(video.uploadTime).toLocaleDateString()}</span>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {video.category}
                  </Badge>
                </div>
              </CardContent>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  )
}