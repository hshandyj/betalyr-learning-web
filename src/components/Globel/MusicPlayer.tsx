"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { 
  Disc,
  Upload,
  Loader2,
  List,
  MoreVertical,
  Trash2,
  Play,
  Repeat,
  Repeat1,
  Shuffle
} from "lucide-react"
import UploadAudioDialog from "@/components/Media/UploadAudioDialog"
import AudioPlayer from "@/components/Media/AudioPlayer"
import { getPublicAudioList } from "@/service/getPublickService"
import { deleteMedia } from "@/service/mediaService"
import { PublicAudioList } from "@/types/media"
import { VisuallyHidden } from "@/components/Edit/Sidebar/visually-hidden"
import { useAudio } from "@/contexts/AudioContext"
import { PlayMode } from "@/contexts/AudioContext"

export function MusicPlayer() {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [showPlaylist, setShowPlaylist] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [audioToDelete, setAudioToDelete] = React.useState<PublicAudioList | null>(null)

  // 使用全局音频上下文
  const { 
    audioList, 
    setAudioList, 
    currentAudio, 
    playAudio, 
    clearCurrentAudio,
    isPlaying,
    playMode,
    togglePlayMode
  } = useAudio()

  // 获取播放模式图标
  const getPlayModeIcon = (mode: PlayMode) => {
    switch (mode) {
      case PlayMode.SEQUENCE:
        return <Repeat className="h-5 w-5" />
      case PlayMode.LOOP_ONE:
        return <Repeat1 className="h-5 w-5" />
      case PlayMode.RANDOM:
        return <Shuffle className="h-5 w-5" />
      default:
        return <Repeat className="h-5 w-5" />
    }
  }

  // 获取播放模式提示文字
  const getPlayModeTooltip = (mode: PlayMode) => {
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

  // 加载音频列表
  const loadAudioList = React.useCallback(async () => {
    try {
      setLoading(true)
      const audios = await getPublicAudioList(1, 20)
      setAudioList(audios)
      // 如果没有当前播放的音频且有音频列表，设置第一个为当前音频
      if (!currentAudio && audios.length > 0) {
        playAudio(audios[0])
      }
    } catch (error) {
      console.error("Error loading audio list:", error)
    } finally {
      setLoading(false)
    }
  }, [currentAudio, playAudio, setAudioList])

  // 初始加载音频列表
  React.useEffect(() => {
    loadAudioList()
  }, [loadAudioList])

  const handleUploadSuccess = () => {
    // 上传成功后重新加载音频列表
    loadAudioList()
    console.log("音频上传成功，刷新列表！")
  }

  const handlePlayAudio = (audio: PublicAudioList) => {
    playAudio(audio)
  }

  const handleDeleteAudio = (audio: PublicAudioList) => {
    setAudioToDelete(audio)
    setShowDeleteDialog(true)
  }

  const confirmDeleteAudio = async () => {
    if (!audioToDelete) return

    try {
      setDeletingId(audioToDelete.id)
      const success = await deleteMedia(audioToDelete.id)
      
      if (success) {
        // 如果删除的是当前播放的音频，重置当前音频
        if (currentAudio?.id === audioToDelete.id) {
          // 找到下一首可播放的音频
          const remainingAudios = audioList.filter(audio => audio.id !== audioToDelete.id)
          if (remainingAudios.length > 0) {
            playAudio(remainingAudios[0])
          } else {
            // 没有其他音频了，清空当前音频
            clearCurrentAudio()
          }
        }
        
        // 更新音频列表
        setAudioList(audioList.filter(audio => audio.id !== audioToDelete.id))
        
        toast({
          title: "删除成功",
          description: "音频已成功删除",
        })
      } else {
        throw new Error("删除失败")
      }
    } catch (error) {
      console.error("Error deleting audio:", error)
      toast({
        title: "删除失败",
        description: "删除音频时发生错误，请重试",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
      setShowDeleteDialog(false)
      setAudioToDelete(null)
    }
  }
  
  return (
    <Sheet open={isExpanded} onOpenChange={setIsExpanded}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
        >
          <Disc className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className={`${showPlaylist ? 'h-96' : 'h-24'} rounded-t-xl px-6 transition-all duration-300`}>
        <SheetHeader className="sr-only">
          <SheetTitle asChild>
            <VisuallyHidden>音乐播放器</VisuallyHidden>
          </SheetTitle>
        </SheetHeader>
        <div className="h-full flex flex-col">
          {/* 播放控制栏 - 固定高度和位置 */}
          <div className="flex h-24 items-center justify-between pt-2 flex-shrink-0">
            <AudioPlayer className="flex-1" />
            
            {/* 右侧控制按钮 */}
            <div className="flex items-center gap-2 ml-4">
              {/* 播放模式切换按钮 */}
              <Button 
                variant="ghost" 
                size="icon" 
                title={getPlayModeTooltip(playMode)}
                onClick={togglePlayMode}
              >
                {getPlayModeIcon(playMode)}
              </Button>
              
              {/* 播放列表按钮 */}
              <Button 
                variant="ghost" 
                size="icon" 
                title="播放列表"
                onClick={() => setShowPlaylist(!showPlaylist)}
              >
                <List className="h-5 w-5" />
              </Button>
              
              {/* 上传音频按钮 */}
              <UploadAudioDialog onUploadSuccess={handleUploadSuccess}>
                <Button variant="ghost" size="icon" title="上传音频">
                  <Upload className="h-5 w-5" />
                </Button>
              </UploadAudioDialog>
            </div>
          </div>

          {/* 播放列表 */}
          {showPlaylist && (
            <div className="flex-1 mt-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>播放列表</span>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-64">
                    {audioList.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        暂无音频文件
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {audioList.map((audio, index) => (
                          <div
                            key={audio.id}
                            className={`flex items-center gap-3 p-3 hover:bg-muted transition-colors ${
                              currentAudio?.id === audio.id ? 'bg-muted' : ''
                            }`}
                          >
                            <div
                              className="flex-1 flex items-center gap-3 cursor-pointer"
                              onClick={() => handlePlayAudio(audio)}
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                {currentAudio?.id === audio.id ? (
                                  <Play className="h-3 w-3" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {audio.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {audio.duration || "未知时长"}
                                </p>
                              </div>
                            </div>
                            
                            {/* 操作按钮 */}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePlayAudio(audio)
                                }}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              
                              {/* 删除菜单 */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={deletingId === audio.id}
                                  >
                                    {deletingId === audio.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <MoreVertical className="h-4 w-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteAudio(audio)
                                    }}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    删除音频
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* 删除确认对话框 */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除音频</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要删除音频 "{audioToDelete?.title}" 吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAudioToDelete(null)}>
                取消
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteAudio}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  )
} 