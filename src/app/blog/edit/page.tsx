"use client"
import { getDoc } from "@/service/notionEditorService";
import Header from "@/components/Header";
import CoverImgUploadBtn from "@/components/Main/CoverImgUploadBtn";
import CoverImage from "@/components/Main/coverImage";
import IconImgUploadBtn from "@/components/Main/IconImgUploadBtn";
import { cn } from "@/lib/utils";
import IconImage from "@/components/Main/IconImage";
import Editor from "@/components/Blog/editor";
import Title from "@/components/Main/Title";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { Document } from "@/types/db";
import { LOCAL_LAST_DOCUMENT_KEY } from "@/config/textConfig";
import dynamic from "next/dynamic";

// 使用dynamic导入来懒加载使用客户端API的组件
// 通过设置ssr: false确保该组件只在客户端渲染
const DocumentEditor = dynamic(() => Promise.resolve(({ documentId }: { documentId: string }) => {
  const [doc, setDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const documentData = await getDoc(documentId);
        if (!documentData) {
          setError(true);
        } else {
          setDoc(documentData);
          localStorage.setItem(LOCAL_LAST_DOCUMENT_KEY, documentData.id);
        }
      } catch (err) {
        console.error("获取文档失败:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }
  
  if (error || !doc) {
    return <div className="flex items-center justify-center h-screen">文档不存在或无法访问</div>;
  }

  const { title, coverImage, iconImage, editorJson } = doc;

  return (
    <>
      <Header doc={doc} />
      <ScrollArea className="h-[calc(100vh_-_48px)]" type="always">
        <main className="flex flex-col h-[inherit]">
          {coverImage && <CoverImage coverImage={coverImage} id={documentId} />}

          <section className="flex flex-col flex-1 w-full">
            <div
              className={cn(
                "group flex flex-col shrink-0 px-10 md:px-24 w-full max-w-[900px] mx-auto relative",
                iconImage && coverImage && "pt-[70px]",
                !iconImage && coverImage && "pt-[25px]",
                iconImage && !coverImage && "pt-16",
                !iconImage && !coverImage && "pt-10"
              )}
            >
              {iconImage && (
                <IconImage
                  id={documentId}
                  isCoverImage={!!coverImage}
                  iconImage={iconImage}
                />
              )}

              {!(iconImage && coverImage) && (
                <div className="h-6 inline-flex gap-2 mt-5">
                  {!iconImage && <IconImgUploadBtn id={documentId} />}
                  {!coverImage && <CoverImgUploadBtn id={documentId} />}
                </div>
              )}

              <Title currentTitle={title} id={documentId} />
            </div>

            <Editor id={documentId} editorJson={editorJson || {}} />
          </section>
        </main>
      </ScrollArea>
    </>
  );
}), { ssr: false, loading: () => <div className="flex items-center justify-center h-screen">加载编辑器...</div> });

// 使用dynamic导入来懒加载获取URL参数的组件
const DocumentIdExtractor = dynamic(() => import("./components/document-id-extractor"), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">加载中...</div>
});

// 主页面组件 - 不包含任何客户端API调用
export default function BlogEditPage() {
  return <DocumentIdExtractor fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
    {(documentId) => {
      if (!documentId) {
        return <div className="flex items-center justify-center h-screen">未提供文档ID</div>;
      }
      return <DocumentEditor documentId={documentId} />;
    }}
  </DocumentIdExtractor>;
}