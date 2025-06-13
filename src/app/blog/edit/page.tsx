"use client"
import Header from "@/components/Edit/Header";
import CoverImgUploadBtn from "@/components/Edit/Main/CoverImgUploadBtn";
import CoverImage from "@/components/Edit/Main/coverImage";
import IconImgUploadBtn from "@/components/Edit/Main/IconImgUploadBtn";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import IconImage from "@/components/Edit/Main/IconImage";
import Editor from "@/components/Edit/editor";
import Title from "@/components/Edit/Main/Title";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LOCAL_LAST_DOCUMENT_KEY } from "@/config/textConfig";
import { useDocument } from "@/contexts/document-context";
import { Suspense } from "react";

// 创建一个单独的组件来使用useSearchParams和DocumentContext
function BlogEditContent() {
  const searchParams = useSearchParams();
  const documentIdParam = searchParams.get('id');
  const { document, isLoading, error } = useDocument();

  // 保存上次访问的文档ID到本地存储
  if (document && document.id) {
    localStorage.setItem(LOCAL_LAST_DOCUMENT_KEY, document.id);
  }

  // 使用上下文中已加载的文档数据
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">文档加载中...</div>;
  }
  
  if (error || !document || !documentIdParam) {
    return <div className="flex items-center justify-center h-screen">无法加载文档</div>;
  }

  const { title, coverImage, iconImage, editorJson } = document;
  // 确保documentId存在
  const documentId = documentIdParam;

  return (
    <>
      <Header doc={document} />
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
}

// 主页面组件
export default function BlogEditPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <BlogEditContent />
    </Suspense>
  );
}