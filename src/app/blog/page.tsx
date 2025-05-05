"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LOCAL_LAST_DOCUMENT_KEY } from "@/config/textConfig";
import { createEmptyDoc, findDoc } from "@/service/notionEditorService";

export default function BlogEntryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [lastDocumentId, setLastDocumentId] = useState<string | null>(null);

  // 在客户端加载时检查localStorage
  useEffect(() => {
    const storedId = localStorage.getItem(LOCAL_LAST_DOCUMENT_KEY);
    if (storedId) {
      setLastDocumentId(storedId);
    }
  }, []);

  // 创建新文档或进入上次编辑的文档
  const enterEditor = async () => {
    setIsLoading(true);
    
    try {
      if (lastDocumentId) {
        // 验证文档是否存在
        const docExists = await findDoc(lastDocumentId);
        //const documentData = await getDoc(lastDocumentId);
        //console.log("documentData",documentData);
        if (docExists) {
          router.push(`/blog/edit?id=${lastDocumentId}`);
          return;
        }
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
      // 这里可以添加错误处理，比如显示Toast提示
    } finally {
      setIsLoading(false);
    }
  };

  const getnewdoc = async () => {
    // 如果没有上次编辑的文档ID或文档不存在，创建新文档
    const newDoc = await createEmptyDoc();
      
    if (!newDoc || !newDoc.id) {
      throw new Error("创建文档失败");
    }
    
    // 保存新文档ID到localStorage
    localStorage.setItem(LOCAL_LAST_DOCUMENT_KEY, newDoc.id);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-8 p-8 max-w-md">
        <h1 className="text-4xl font-bold">博客编辑器</h1>
        <p className="text-lg text-muted-foreground">
          {lastDocumentId 
            ? "点击下方按钮继续编辑上次的文档" 
            : "欢迎使用博客编辑器，点击下方按钮创建新文档"}
        </p>
        <Button 
          size="lg" 
          onClick={getnewdoc} 
          disabled={isLoading}
          className="w-full"
        >
          创建新文档
        </Button>
        <Button 
          size="lg" 
          onClick={enterEditor} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              加载中...
            </>
          ) : lastDocumentId ? (
            "继续编辑"
          ) : (
            "创建新文档"
          )}
        </Button>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic"