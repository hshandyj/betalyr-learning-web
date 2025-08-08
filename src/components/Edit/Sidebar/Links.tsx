"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { type DocumentType } from "../../../types/document";
import { Icons } from "../components/Icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, toastError } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { useState, useEffect } from "react";

import More from "./More";
import { DeleteDocumentPayload } from "@/lib/validators/Documents";
import Image from "next/image";
import { useTitle } from "@/store/use-title";

interface Redirect {
  data: string | null;
}

export type MutationProps = {
  id: string;
  callback?: () => void;
};

interface LinksProps {
  docs: DocumentType[] | undefined;
  size?: "medium" | "default";
  showMore?: boolean;
  toggle?: () => void;
}

export default function Links({
  docs = [],
  size,
  showMore,
  toggle,
}: LinksProps) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [switchingToDocId, setSwitchingToDocId] = useState<string | null>(null);

  const { title } = useTitle();

  const currentDocId = searchParams.get('id') || '';

  // 处理文章切换的函数，优化缓存策略
  const handleDocumentClick = (docId: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    // 如果点击的是当前文档，不需要切换
    if (docId === currentDocId) return;
    
    // 如果正在切换到另一个文档，不允许重复操作
    if (switchingToDocId) return;
    
    // 设置切换状态
    setSwitchingToDocId(docId);
    
    // 优化缓存策略：先预取新文档数据，再导航
    const prefetchNewDocument = async () => {
      try {
        // 检查是否已有缓存，如果有且fresh则不预取，避免覆盖可能需要更新的数据
        const existingData = queryClient.getQueryData(["document", docId]);
        const queryState = queryClient.getQueryState(["document", docId]);
        
        // 只有在没有缓存或缓存已过期时才预取
        // 检查缓存是否过期：没有数据、没有查询状态、或数据更新时间超过staleTime
        const isDataStale = !existingData || 
          !queryState || 
          !queryState.dataUpdatedAt || 
          (Date.now() - queryState.dataUpdatedAt > 1 * 60 * 1000);
        
        if (isDataStale) {
          await queryClient.prefetchQuery({
            queryKey: ["document", docId],
            queryFn: async () => {
              const { getDoc } = await import("@/service/notionEditorService");
              return getDoc(docId);
            },
            staleTime: 1 * 60 * 1000, // 与全局配置保持一致
          });
        }
        
        // 导航到新文档
        router.push(`/blog/edit?id=${docId}`);
        
        // 导航后再更新文档列表缓存
        queryClient.invalidateQueries({ queryKey: ["docs"] });
      } catch (error) {
        console.error("预取文档失败:", error);
        // 如果预取失败，降级到原有逻辑
        queryClient.invalidateQueries({ queryKey: ["docs"] });
        queryClient.invalidateQueries({ queryKey: ["document", docId] });
        router.push(`/blog/edit?id=${docId}`);
      } finally {
        // 清除切换状态
        setSwitchingToDocId(null);
      }
    };
    
    prefetchNewDocument();
  };

  // 当URL中的文档ID改变时，清除切换状态
  useEffect(() => {
    setSwitchingToDocId(null);
  }, [currentDocId]);

  const { mutate } = useMutation({
    mutationFn: async ({ id, callback }: MutationProps) => {
      if (callback) callback();

      const payload: DeleteDocumentPayload = {
        currentDoc: currentDocId,
        id,
      };

      const { data: redirect }: Redirect = await axios.delete(
        `/api/documents/${id}`,
        { data: payload }
      );

      return redirect;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 422) {
          toastError({
            title: "Invalid payload axios.",
            axiosPayloadDesc: "Please provide currentDoc and id",
            error,
          });
          return;
        }
      }
      toastError({ error, title: "Failed delete" });
    },
    onSuccess: (redirect) => {
      queryClient.invalidateQueries({ queryKey: ["docs"] });

      if (redirect) {
        router.push(redirect);
      }

      return toast({
        title: "Successfully deleted the doc",
        variant: "default",
      });
    },
  });

  return (
    <>
      {docs.map((doc) => {
        const linkTitle =
          (currentDocId === doc.id ? title : doc.title) || "Untitled";

        return (
          <li key={doc.id}>
            <div
              tabIndex={0}
              onClick={(e) => handleDocumentClick(doc.id, e)}
              className={cn(
                "flex hover:bg-accent w-full items-center px-2 py-[2px] cursor-pointer rounded-sm transition-colors duration-200 overflow-x-hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                currentDocId === doc.id && size !== "medium" && "bg-accent",
                size === "medium" && "px-4 py-3 rounded-none",
                switchingToDocId === doc.id && "opacity-50 cursor-wait"
              )}
            >
              {doc.iconImage ? (
                <Image
                  alt="icon doc"
                  src={`${doc.iconImage.url}?timeStamp=${doc.iconImage.timeStamp}`}
                  width={6}
                  height={6}
                  className="h-6 w-6 p-1 shrink-0 object-cover"
                />
              ) : (
                <Icons.FileText
                  className="h-6 w-6 p-1 shrink-0"
                />
              )}
              <span
                className="pl-3 h-6 leading-6 text-sm truncate flex-1 select-none"
              >
                {linkTitle}
              </span>

              {switchingToDocId === doc.id && (
                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full mr-2"></div>
              )}

              {showMore && switchingToDocId !== doc.id && (
                <More doc={doc} mutate={mutate} />
              )}
            </div>
          </li>
        );
      })}
    </>
  );
}
