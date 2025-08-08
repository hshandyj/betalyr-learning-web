"use client"
import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Upload, FileVideo, X, CheckCircle, AlertCircle } from "lucide-react"
import { uploadVideo, validateFileType, getFileInfo } from "@/service/mediaService"
import { UploadMediaParams } from "@/types/media"

interface UploadVedioDialogProps {
  onUploadSuccess?: () => void
  children?: React.ReactNode
}

interface FileWithInfo {
  file: File
  info: ReturnType<typeof getFileInfo>
  type: 'video'
}

export default function UploadVedioDialog({ onUploadSuccess, children }: UploadVedioDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileWithInfo | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    try {
      const fileType = validateFileType(file)
      
      // 只允许视频文件
      if (fileType !== 'video') {
        throw new Error("请上传视频文件")
      }
      
      const fileInfo = getFileInfo(file)
      
      setSelectedFile({
        file,
        info: fileInfo,
        type: fileType
      })
      
      // 自动设置标题（去掉文件扩展名）
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
      setTitle(nameWithoutExt)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "文件类型不支持")
      setSelectedFile(null)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      setError("请选择视频文件并填写标题")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError("")

    try {
      const params: UploadMediaParams = {
        file: selectedFile.file,
        title: title.trim(),
        category: category.trim() || "其他",
        description: description.trim()
      }

      const result = await uploadVideo(params)
      
      if (result?.success) {
        setUploadProgress(100)
        // 重置表单
        setSelectedFile(null)
        setTitle("")
        setCategory("")
        setDescription("")
        setIsOpen(false)
        
        // 通知父组件上传成功
        onUploadSuccess?.()
      } else {
        throw new Error("上传失败")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败，请重试")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setTitle("")
    setCategory("")
    setDescription("")
    setError("")
    setUploadProgress(0)
    setIsUploading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) {
        resetForm()
      }
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            上传视频
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>上传视频文件</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 文件选择区域 */}
          {!selectedFile ? (
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${dragActive 
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center space-y-2">
                <FileVideo className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  拖拽视频文件到这里或点击选择
                </p>
                <p className="text-sm text-gray-500">
                  支持 MP4、AVI、MOV、WMV、FLV、WebM、MKV 格式
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="video/*"
                onChange={handleFileInputChange}
              />
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileVideo className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="font-medium">{selectedFile.info.name}</div>
                    <div className="text-sm text-gray-500">
                      {selectedFile.info.size} • 视频文件
                    </div>
                  </div>
                </div>
                
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 标题输入 */}
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入视频标题"
              disabled={isUploading}
            />
          </div>

          {/* 描述输入 */}
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入视频描述"
              disabled={isUploading}
            />
          </div>

          {/* 分类输入 */}
          <div className="space-y-2">
            <Label htmlFor="category">分类</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="请输入分类，如：编程教程、技术分享等"
              disabled={isUploading}
            />
          </div>

          {/* 上传进度 */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>上传进度</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              取消
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !title.trim() || isUploading}
              className="min-w-[80px]"
            >
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>上传中...</span>
                </div>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  上传
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 