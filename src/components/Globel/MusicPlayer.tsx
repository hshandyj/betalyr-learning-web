"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  Expand,
  Disc
} from "lucide-react"

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isExpanded, setIsExpanded] = React.useState(false)
  
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
      <SheetContent side="bottom" className="h-24 rounded-t-xl px-6">
        <div className="flex h-full items-center justify-between">
          {/* 歌曲信息 */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-muted" />
            <div>
              <h3 className="font-medium">正在播放的歌曲</h3>
              <p className="text-sm text-muted-foreground">歌手名称</p>
            </div>
          </div>

          {/* 播放控制 */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-full"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* 进度条和音量 */}
          <div className="flex w-96 items-center gap-4">
            <Slider defaultValue={[33]} max={100} step={1} className="w-full" />
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              <Slider defaultValue={[80]} max={100} step={1} className="w-20" />
            </div>
          </div>

          {/* 展开按钮 */}
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
            <Expand className="h-5 w-5" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
} 