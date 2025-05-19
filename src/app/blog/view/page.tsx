"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getDoc } from "@/service/notionEditorService";
import { Document } from "@/types/document";
import { Loader2, Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

import './article.css'; // 文章样式文件

// 创建代码高亮实例
const lowlight = createLowlight(common);

export default function BlogViewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
      <BlogViewContent />
    </Suspense>
  );
}

function BlogViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [post, setPost] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError("Invalid article ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const doc = await getDoc(id);
        if (!doc) {
          setError("Article not found");
          return;
        }
        setPost(doc);
      } catch (err) {
        console.error("Failed to get article details:", err);
        setError("Failed to get article details, please try again later");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // 格式化日期
  const formatDate = (dateString: string | Date) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch (error) {
      return typeof dateString === 'string' ? dateString : dateString.toISOString();
    }
  };

  // 初始化TipTap编辑器（只读模式）
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Placeholder.configure({
        placeholder: 'Content is empty',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    editable: false,
    content: post?.editorJson || null,
  }, [post?.editorJson]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Article not found or deleted</h2>
          <p className="text-muted-foreground mb-8">{error || "Cannot find the requested article"}</p>
          <Button asChild>
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to blog list
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* 导航栏 */}
      <div className="bg-primary/5 py-4">
        <div className="container mx-auto">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4" />
              Return to blog list
            </Link>
          </Button>
        </div>
      </div>

      {/* 封面图 */}
      {post.coverImage && (
        <div className="relative w-full h-[400px]">
          <Image
            src={post.coverImage.url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      {/* 文章内容 */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* 文章头部信息 */}
        <header className={cn(
          "mb-12",
          post.coverImage ? "-mt-32 relative z-10 bg-background p-8 rounded-xl shadow-md" : ""
        )}>
          {post.iconImage && (
            <div className="w-16 h-16 rounded-lg mb-6 overflow-hidden shadow-sm">
              <Image
                src={post.iconImage.url}
                alt=""
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl font-bold mb-6">{post.title || "No title"}</h1>
          
          <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {formatDate(post.updatedAt || post.createdAt)}</span>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string, i: number) => (
                <Badge key={i} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </header>

        {/* TipTap 文章内容 */}
        <div className="prose prose-stone dark:prose-invert max-w-none">
          {editor && (
            <EditorContent editor={editor} className="article-content" />
          )}
        </div>
      </article>
    </div>
  );
} 