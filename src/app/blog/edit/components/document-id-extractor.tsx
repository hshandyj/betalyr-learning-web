"use client"
import { useSearchParams } from "next/navigation";
import React from "react";

interface DocumentIdExtractorProps {
  children: (documentId: string | null) => React.ReactNode;
  fallback?: React.ReactNode;
}

// 这个组件专门负责从URL参数中提取documentId
// 通过将这个功能隔离到一个专门的组件中，可以更精确地控制客户端渲染边界
export default function DocumentIdExtractor({ children, fallback }: DocumentIdExtractorProps) {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('id');
  
  // 如果参数尚未可用并提供了fallback，则显示fallback
  if (!documentId && fallback) {
    return <>{fallback}</>;
  }
  
  // 调用children渲染函数，传入documentId
  return <>{children(documentId)}</>;
} 