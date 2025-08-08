"use client"
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createEmptyDoc, getDoc } from "@/service/notionEditorService";
import { isValidObjectID } from "@/lib/utils";
import ReactResizablePanels from "@/components/Edit/MyResizablePanels/ResizablePanels";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ShowsidebarProvider } from "@/contexts/show-sidebar-context";
import { useAuth } from "@/hooks/useAuth";
import { DocumentContext } from "@/contexts/document-context";

// 创建QueryClient实例 - 在组件外部创建，避免重复创建
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1 * 60 * 1000, // 1分钟内数据保持新鲜，减少缓存时间
    },
  },
});

interface LayoutProps {
  children: React.ReactNode;
}

// 创建一个内部组件来处理URL参数和文档验证
function LayoutContent({ children }: LayoutProps) {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('id');
  const [defaultLayout, setDefaultLayout] = useState<any>(undefined);
  const [hasLoadedLayout, setHasLoadedLayout] = useState<boolean>(false);
  const { isAuthenticated, isLoading: isAuthLoading, ready, isVirtualUser } = useAuth();

  // 获取默认布局 - 单独的useEffect，只执行一次
  useEffect(() => {
    // 确保在客户端执行且只执行一次
    if (typeof window === 'undefined' || hasLoadedLayout) return;
    
    try {
      const storedLayout = localStorage.getItem("react-resizable-panels:layout");
      if (storedLayout) {
        setDefaultLayout(JSON.parse(storedLayout));
      }
      setHasLoadedLayout(true);
    } catch (error) {
      console.error("无法解析布局配置:", error);
      setHasLoadedLayout(true);
    }
  }, [hasLoadedLayout]);

  // 使用React Query获取文档
  const { data: document, isLoading: isDocLoading, error } = useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      if (!documentId || !isValidObjectID(documentId)) {
        throw new Error("文档ID无效");
      }
      return getDoc(documentId);
    },
    enabled: !!documentId && ready && (isAuthenticated || isVirtualUser), // 认证已完成并且是认证用户或虚拟用户
    retry: 1,
    staleTime: 1 * 60 * 1000, // 1分钟内数据保持新鲜，与全局配置保持一致
  });

  // 显示登录加载界面
  if (isAuthLoading || !ready) {
    return <div className="h-screen w-full flex items-center justify-center">正在检查登录状态...</div>;
  }

  // 如果未登录且不是虚拟用户，显示提示
  if (!isAuthLoading && !isAuthenticated && !isVirtualUser) {
    return <div className="h-screen w-full flex items-center justify-center">请先登录以访问文档</div>;
  }

  // 加载状态
  if (isDocLoading) {
    return <div className="h-screen w-full flex items-center justify-center">加载文档中...</div>;
  }

  // 文档不存在或无效
  if (error || !document) {
    createEmptyDoc();
    return <div className="h-screen w-full flex items-center justify-center">文档不存在或无法访问</div>;
  }

  // 正常渲染，并通过上下文提供文档数据
  return (
    <DocumentContext.Provider value={{ document, isLoading: isDocLoading, error }}>
      <ShowsidebarProvider showSidebar={true}>
        <div className="h-screen w-full flex">
          <ReactResizablePanels defaultLayout={defaultLayout} right={children} />
        </div>
      </ShowsidebarProvider>
    </DocumentContext.Provider>
  );
}

// 主布局组件，使用QueryClientProvider包裹内部组件
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <QueryClientProvider client={queryClient}>
        <LayoutContent children={children} />
      </QueryClientProvider>
    </Suspense>
  );
};

export default Layout;