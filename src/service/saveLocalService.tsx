"use client";

import { useEffect } from "react";
import { LOCAL_LAST_DOCUMENT_KEY } from "@/config/getLocalConfig";
interface SaveDocumentScriptProps {
  documentId: string;
}

/**
 * 一个客户端组件，用于将当前文档ID保存到本地存储
 * 这个组件不渲染任何UI，只执行副作用
 */
export default function SaveDocumentScript({ documentId }: SaveDocumentScriptProps) {
  useEffect(() => {
    // 保存当前文档ID到localStorage
    if (documentId) {
      localStorage.setItem(LOCAL_LAST_DOCUMENT_KEY, documentId);
    }
  }, [documentId]);

  // 不渲染任何内容
  return null;
} 