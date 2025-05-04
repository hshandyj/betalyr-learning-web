"use client"
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { findDoc } from "@/service/notionEditorService";
import { isValidObjectID } from "@/lib/utils";
import ReactResizablePanels from "@/components/MyResizablePanels/ResizablePanels";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ShowsidebarProvider } from "@/lib/context/show-sidebar-context";

// 创建QueryClient实例 - 在组件外部创建，避免重复创建
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5分钟内数据保持新鲜
    },
  },
});

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('id');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [defaultLayout, setDefaultLayout] = useState<any>(undefined);
  const [hasLoadedLayout, setHasLoadedLayout] = useState<boolean>(false);

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

  // 验证文档ID - 只在documentId变化时执行
  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    // 重置状态，确保不受先前验证的影响
    setIsValid(false);
    setLoading(true);

    const validateDocument = async () => {
      const validObjectID = isValidObjectID(documentId);
      if (!validObjectID) {
        console.error("文档ID格式无效:", documentId);
        setLoading(false);
        return;
      }

      try {
        const document = await findDoc(documentId);
        if (document) {
          setIsValid(true);
        } else {
          console.error("文档不存在:", documentId);
        }
      } catch (error) {
        console.error("验证文档失败:", error);
      } finally {
        setLoading(false);
      }
    };

    validateDocument();
  }, [documentId]);

  // 加载状态
  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center">加载中...</div>;
  }

  // 文档不存在或无效
  if (!isValid && !loading) {
    return <div className="h-screen w-full flex items-center justify-center">文档不存在或无法访问</div>;
  }

  // 正常渲染
  return (
    <QueryClientProvider client={queryClient}>
      <ShowsidebarProvider showSidebar={true}>
        <div className="h-screen w-full flex">
          <ReactResizablePanels defaultLayout={defaultLayout} right={children} />
        </div>
      </ShowsidebarProvider>
    </QueryClientProvider>
  );
};

export default Layout;