"use client"

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Button } from '@/components/ui/button'
import { getApiUrl } from '@/config/config'
import { useRouter } from 'next/navigation'
import { Document } from '@/types/block-editor'

interface PaginatedResponse {
  data: Document[];
  total: number;
  current_page: number;
  per_page: number;
}

export const BlogList = forwardRef((props, ref) => {
  const router = useRouter()
  const [posts, setPosts] = useState<Document[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 10

  const fetchPosts = async (page: number) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${getApiUrl()}/api/articles?page=${page}&page_size=${pageSize}`, {
        headers: { 'Accept': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('获取文章列表失败')
      }

      const apiData = await response.json()
      
      // 将API返回的数据转换为Document类型
      const documents: Document[] = (apiData.data || []).map((post: any) => ({
        id: post.id.toString(),
        title: post.title,
        blocks: [], // 列表页暂不加载blocks内容
        createdAt: post.created_at || new Date().toISOString(),
        updatedAt: post.updated_at || post.created_at || new Date().toISOString()
      }))
      
      setPosts(documents)
      setTotalPosts(apiData.total || 0)
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取文章列表失败，请稍后重试')
      setPosts([])
      setTotalPosts(0)
    } finally {
      setIsLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    fetchPosts
  }))

  useEffect(() => {
    fetchPosts(currentPage)
  }, [currentPage])

  const handleArticleClick = (id: string) => {
    router.push(`/blog/${id}`)
  }

  const handleCreateBlog = () => {
    router.push('/blog/edit')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">博客文章</h1>
        <Button onClick={handleCreateBlog}>写新文章</Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 border rounded-lg space-y-3 animate-pulse">
              <div className="h-6 bg-muted/20 rounded w-3/4"></div>
              <div className="h-4 bg-muted/20 rounded w-1/2"></div>
              <div className="h-20 bg-muted/20 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="p-6 border rounded-lg space-y-3 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleArticleClick(post.id)}
              >
                <h2 className="text-2xl font-semibold hover:text-primary">
                  {post.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <time className="flex-shrink-0">{new Date(post.createdAt).toLocaleDateString()}</time>
                  {post.updatedAt && post.updatedAt !== post.createdAt && (
                    <>
                      <span className="hidden sm:inline-block">·</span>
                      <span>更新于 {new Date(post.updatedAt).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {posts.length === 0 && !isLoading && (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-xl text-muted-foreground mb-6">还没有博客文章</p>
              <Button onClick={handleCreateBlog}>写第一篇博客</Button>
            </div>
          )}

          {totalPosts > pageSize && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * pageSize >= totalPosts}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}) 