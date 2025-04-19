"use client"

import { useEffect, useState, useCallback } from 'react'
import { getApiUrl } from '@/config/config'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { Block, Document } from '@/types/block-editor'
import dynamic from 'next/dynamic'

// 动态导入BlockEditor组件，避免SSR
const BlockEditor = dynamic(
  () => import('@/components/Blog/block'),
  { ssr: false }
)

interface BlogArticleViewProps {
  articleId: number
}

export function BlogArticleView({ articleId }: BlogArticleViewProps) {
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formattedDate, setFormattedDate] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  // 确保组件在客户端加载后再渲染编辑器，避免hydration错误
  useEffect(() => {
    setMounted(true)
  }, [])

  // 将fetchArticle提取为useCallback函数
  const fetchArticle = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${getApiUrl()}/api/articles/${articleId}`, {
        headers: { 'Accept': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('获取文章详情失败')
      }

      const data = await response.json()
      
      // 将API返回的博客转换为Document格式
      let blocks: Block[] = []
      
      try {
        // 尝试将content解析为JSON格式的Block数组
        //blocks = JSON.parse(data.content)
      } catch (e) {
        // 如果解析失败，则创建一个包含内容的段落块
        blocks = [{ 
          id: uuidv4(), 
          type: 'paragraph', 
          content: { 
            type: 'doc', 
            content: [{ 
              type: 'paragraph',
              //content: [{ type: 'text', text: data.content.replace(/<[^>]+>/g, '') }] 
            }] 
          } 
        }]
      }
      
      // const doc: Document = {
      //   id: data.id.toString(),
      //   title: data.title,
      //   blocks: blocks,
      //   createdAt: data.created_at || new Date().toISOString(),
      //   updatedAt: data.updated_at || new Date().toISOString()
      // }
      
      //setDocument(doc)
      
      // // 在客户端格式化日期
      // if (data.created_at) {
      //   setFormattedDate(new Date(data.created_at).toLocaleDateString('zh-CN', {
      //     year: 'numeric',
      //     month: 'long',
      //     day: 'numeric'
      //   }))
      // }
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取文章详情失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }, [articleId])

  useEffect(() => {
    fetchArticle()
  }, [fetchArticle])

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这篇文章吗？')) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`${getApiUrl()}/api/articles/${articleId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('删除文章失败')
      }

      toast.success('文章已成功删除')
      router.back()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除文章失败，请稍后重试')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    router.push(`/blog/edit?id=${articleId}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted/20 rounded w-3/4"></div>
        <div className="h-4 bg-muted/20 rounded w-1/4"></div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-muted/20 rounded w-full"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">
          {error}
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          返回列表
        </Button>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">文章不存在</h3>
          <p className="text-muted-foreground">该文章可能已被删除或移动</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          返回列表
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="hover:bg-muted/50 text-muted-foreground"
        >
          ← 返回列表
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleEdit}
            className="hover:bg-primary/10"
          >
            编辑文章
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="hover:bg-destructive/10 text-destructive hover:text-destructive"
          >
            {isDeleting ? '删除中...' : '删除文章'}
          </Button>
        </div>
      </div>
      
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{document.title}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          {formattedDate && <time>{formattedDate}</time>}
          {document.updatedAt && document.updatedAt !== document.createdAt && (
            <span>（更新于 {new Date(document.updatedAt).toLocaleDateString('zh-CN')}）</span>
          )}
        </div>
      </div>
      
      <div className="prose prose-lg max-w-none bg-white rounded-lg p-6 shadow-sm">
        {mounted && <BlockEditor initialBlocks={document.blocks} readOnly={true} />}
      </div>
    </div>
  )
}