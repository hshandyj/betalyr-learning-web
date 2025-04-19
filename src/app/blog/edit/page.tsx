"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Block, Document } from '@/types/block-editor'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getApiUrl } from '@/config/config'
import { useSearchParams } from 'next/navigation'

// 动态导入BlockEditor组件，避免SSR
const BlockEditor = dynamic(
  () => import('@/components/Blog/block'),
  { ssr: false }
)

// 用于获取和处理查询参数的单独组件
function EditPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const blogId = searchParams.get('id')
  
  const [document, setDocument] = useState<Document>({
    id: blogId || uuidv4(),
    title: '',
    blocks: [
      // 默认创建一个标题块
      { 
        id: uuidv4(), 
        type: 'heading', 
        content: { 
          type: 'doc', 
          content: [{ 
            type: 'heading', 
            attrs: { level: 1 },
            content: [{ type: 'text', text: '无标题文档' }] 
          }] 
        },
        attrs: { level: 1 }
      },
      // 默认创建一个段落块
      { 
        id: uuidv4(), 
        type: 'paragraph', 
        content: { type: 'doc', content: [{ type: 'paragraph' }] } 
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  const [isLoading, setIsLoading] = useState(blogId ? true : false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // 确保组件在客户端加载后再渲染编辑器，避免hydration错误
  useEffect(() => {
    setMounted(true)
  }, [])

  // 如果有blogId，则获取博客内容
  useEffect(() => {
    if (blogId) {
      fetchBlog(blogId)
    }
  }, [blogId])

  const fetchBlog = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${getApiUrl()}/api/articles/${id}`, {
        headers: { 'Accept': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('获取文章详情失败')
      }

      const data = await response.json()
      
      // 尝试解析blocks
      let blocks: Block[] = []
      try {
        //blocks = JSON.parse(data.content)
      } catch (e) {
        // 解析失败，检查是否有标题块
        const hasHeadingBlock = blocks.some(block => block.type === 'heading' && block.attrs?.level === 1)
        
        if (!hasHeadingBlock) {
          // 如果没有标题块，创建一个标题块
          blocks.unshift({ 
            id: uuidv4(), 
            type: 'heading', 
            content: { 
              type: 'doc', 
              content: [{ 
                type: 'heading', 
                attrs: { level: 1 },
                //content: [{ type: 'text', text: data.title || '无标题文档' }] 
              }] 
            },
            attrs: { level: 1 }
          })
        }
        
        // 如果没有内容块，创建一个段落块
        if (blocks.length <= 1) {
          blocks.push({ 
            id: uuidv4(), 
            type: 'paragraph', 
            content: { 
              type: 'doc', 
              content: [{ 
                type: 'paragraph',
                //content: [{ type: 'text', text: data.content?.replace(/<[^>]+>/g, '') || '' }] 
              }] 
            } 
          })
        }
      }
      
      // 将API返回的博客转换为Document格式
      //const doc: Document = {
        //id: data.id.toString(),
        //title: data.title || '',
        //blocks: blocks,
        //createdAt: data.created_at || new Date().toISOString(),
        //updatedAt: data.updated_at || new Date().toISOString()
     // }
      
      //setDocument(doc)
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取文章详情失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理块变化
  const handleBlocksChange = (newBlocks: Block[]) => {
    // 从blocks中提取标题
    let title = '无标题文档'
    const titleBlock = newBlocks.find(b => b.type === 'heading' && b.attrs?.level === 1)
    
    if (titleBlock) {
      try {
        // 尝试从标题块中提取文本
        const content = titleBlock.content as any
        if (content?.content?.[0]?.content?.[0]?.text) {
          title = content.content[0].content[0].text
        }
      } catch (e) {
        console.error('提取标题失败', e)
      }
    }
    
    setDocument(prev => ({
      ...prev,
      title,
      blocks: newBlocks,
      updatedAt: new Date().toISOString()
    }))
  }

  // 保存博客
  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      // 准备请求数据
      const formData = new FormData()
      formData.append('title', document.title)
      formData.append('content', JSON.stringify(document.blocks))
      
      // 根据是否有ID决定是创建还是更新
      const method = blogId ? 'PUT' : 'POST'
      const url = blogId 
        ? `${getApiUrl()}/api/articles/${blogId}` 
        : `${getApiUrl()}/api/articles`
      
      const response = await fetch(url, {
        method,
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(blogId ? '更新文章失败' : '创建文章失败')
      }
      
      const data = await response.json()
      
      toast.success(blogId ? '文章已成功更新' : '文章已成功创建')
      
      // 如果是新创建的文章，更新URL
      //if (!blogId && data.id) {
        //router.push(`/blog/edit?id=${data.id}`)
      //}
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
  }

  // 取消编辑
  const handleCancel = () => {
    if (window.confirm('确定要取消编辑吗？未保存的内容将会丢失。')) {
      router.back()
    }
  }

  if (isLoading) {
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-muted/20 rounded w-3/4"></div>
          <div className="h-4 bg-muted/20 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-muted/20 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">
          {error}
        </div>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          返回
        </Button>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {blogId ? '编辑文章' : '新建文章'}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
      
      {mounted && (
        <div className="bg-white rounded-lg border shadow-sm">
          <BlockEditor 
            initialBlocks={document.blocks}
            onChange={handleBlocksChange}
          />
        </div>
      )}
    </div>
  )
}

export default function BlogEditPage() {
  return (
    <Suspense fallback={
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-muted/20 rounded w-3/4"></div>
          <div className="h-4 bg-muted/20 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-muted/20 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <EditPageContent />
    </Suspense>
  )
} 