"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Eye, ChevronRight, Search, ChevronLeft } from "lucide-react";
import { LOCAL_LAST_DOCUMENT_KEY } from "@/config/textConfig";
import { createEmptyDoc } from "@/service/notionEditorService";
import { getPublishedDocs, PaginatedResponse } from "@/service/getPublickService";
import { PublicDocumentList } from "@/types/document";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

// 动态导出，使页面强制服务端渲染
export const dynamic = "force-dynamic";

export default function BlogListPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
      <BlogListContent />
    </Suspense>
  );
}

function BlogListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPageParam = Number(searchParams.get('page') || '1');
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastDocumentId, setLastDocumentId] = useState<string | null>(null);
  const [featuredPost, setFeaturedPost] = useState<PublicDocumentList | null>(null);
  const [posts, setPosts] = useState<PublicDocumentList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: currentPageParam,
    totalPages: 1,
    limit: 20,
    total: 0
  });

  // 在客户端加载时检查localStorage和获取博客列表
  useEffect(() => {
    const storedId = localStorage.getItem(LOCAL_LAST_DOCUMENT_KEY);
    if (storedId) {
      setLastDocumentId(storedId);
    }
    
    fetchPosts(currentPageParam);
  }, [currentPageParam]);

  // 获取博客列表
  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getPublishedDocs(page);
      
      // 判断响应是否符合分页格式
      if ('data' in response && 'meta' in response) {
        const paginatedResponse = response as PaginatedResponse;
        if (paginatedResponse.data.length > 0) {
          // 第一页时，设置第一篇文章为特色文章
          if (page === 1) {
            setFeaturedPost(paginatedResponse.data[0]);
            // 其余文章为列表
            setPosts(paginatedResponse.data.slice(1));
          } else {
            setPosts(paginatedResponse.data);
            // 非第一页不显示特色文章
            setFeaturedPost(null);
          }
          
          // 设置分页信息
          setPagination({
            currentPage: paginatedResponse.meta.page,
            totalPages: Math.ceil(paginatedResponse.meta.total / paginatedResponse.meta.limit),
            limit: paginatedResponse.meta.limit,
            total: paginatedResponse.meta.total
          });
        }
      } else {
        // 旧版本API兼容
        const docs = response as PublicDocumentList[];
        if (docs.length > 0) {
          setFeaturedPost(docs[0]);
          setPosts(docs.slice(1));
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // 切换页码
  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    
    // 使用router进行页面导航，但保留其他查询参数
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/blog?${params.toString()}`);
  };

  // 生成分页器的页码列表
  const getPageNumbers = () => {
    const maxPages = 5; // 显示的最大页码数
    const { currentPage, totalPages } = pagination;
    
    if (totalPages <= maxPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // 复杂分页逻辑，显示当前页附近的几个页码
    let startPage = Math.max(currentPage - Math.floor(maxPages / 2), 1);
    const endPage = Math.min(startPage + maxPages - 1, totalPages);
    
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(endPage - maxPages + 1, 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  // 创建新文档或进入上次编辑的文档
  const enterEditor = async () => {
    setIsLoading(true);
    
    try {
      if (lastDocumentId) {
        router.push(`/blog/edit?id=${lastDocumentId}`);
        return;
      }
      
      // 如果没有上次编辑的文档ID或文档不存在，创建新文档
      const newDoc = await createEmptyDoc();
      
      if (!newDoc || !newDoc.id) {
        throw new Error("创建文档失败");
      }
      
      // 保存新文档ID到localStorage
      localStorage.setItem(LOCAL_LAST_DOCUMENT_KEY, newDoc.id);
      
      // 导航到编辑器页面
      router.push(`/blog/edit?id=${newDoc.id}`);
    } catch (error) {
      console.error("Error entering editor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 过滤博客
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 格式化日期
  const formatDate = (dateString: string | Date) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return typeof dateString === 'string' ? dateString : dateString.toISOString();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* 顶部横幅 */}
      <div className="bg-primary/10 py-2 px-4 text-center">
        <p className="text-sm">Welcome to our technical blog 🎉 </p>
      </div>
      
      {/* 页面头部 */}
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Technical Blog</h1>
            <p className="text-muted-foreground max-w-2xl">Explore the latest technical articles, share programming insights and experience.</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={enterEditor} 
              disabled={isLoading}
              className="flex gap-2 items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  {lastDocumentId ? "Continue editing" : "Start writing"}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* 搜索栏 */}
        <div className="relative max-w-xl mx-auto mb-12">
          <Input
            type="text"
            placeholder="Search articles..."
            className="pl-10 py-6"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        
        {/* 特色文章 */}
        {loading ? (
          <div className="w-full h-[400px] rounded-xl mb-16 overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>
        ) : featuredPost ? (
          <Link href={`/blog/view?id=${featuredPost.id}`} className="block group">
            <div className="relative w-full h-[400px] rounded-xl mb-16 overflow-hidden">
              {featuredPost.iconImage ? (
                <Image 
                  src={featuredPost.iconImage.url} 
                  alt={featuredPost.title || "Featured post"} 
                  fill 
                  className="object-cover transition-transform group-hover:scale-105 duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
                <Badge variant="secondary" className="mb-3 w-fit">Featured articles</Badge>
                <h2 className="text-3xl font-bold text-white mb-3">{featuredPost.title || "No title"}</h2>
                
                {/* 标签展示 */}
                {featuredPost.tags && featuredPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredPost.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-none">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-white/70">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(featuredPost.updatedAt || featuredPost.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>View details</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ) : null}
        
        {/* 文章列表 */}
        <h2 className="text-2xl font-bold mb-8">Latest articles</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-4 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link href={`/blog/view?id=${post.id}`} key={post.id} className="group">
                  <Card className="h-full hover:shadow-md transition-all duration-300 border-t-4 border-t-primary/40 group-hover:border-t-primary">
                    <CardHeader>
                      <div className="h-48 relative mb-4 rounded-md overflow-hidden">
                        {post.iconImage ? (
                          <Image 
                            src={post.iconImage.url} 
                            alt={post.title || "Blog post"} 
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                            <span className="text-lg font-medium text-primary">Preview</span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2 h-14 group-hover:text-primary transition-colors duration-300">{post.title || "No title"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="bg-primary/5 hover:bg-primary/10">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between text-xs text-muted-foreground mt-auto">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.updatedAt || post.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>View details</span>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
            
            {/* 分页控件 */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {getPageNumbers().map(page => (
                  <Button
                    key={page}
                    variant={page === pagination.currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <div className="text-sm text-muted-foreground ml-2">
                  Total {pagination.total} articles, {pagination.totalPages} pages
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found</p>
            {searchTerm && (
              <Button 
                variant="link" 
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
