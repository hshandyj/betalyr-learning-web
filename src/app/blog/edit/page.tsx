"use client"
import { getDoc } from "@/service/notionEditorService";
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
import { useEffect, useState, Suspense } from "react";
import { Document } from "@/types/document";
import { LOCAL_LAST_DOCUMENT_KEY } from "@/config/textConfig";

// 创建一个单独的组件来使用useSearchParams
function BlogEditContent() {
  const searchParams = useSearchParams();
  const documentIdParam = searchParams.get('id');
  const [doc, setDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentIdParam) {
        setError(true);
        setIsLoading(false);
        return;
      }

      try {
        const documentData = await getDoc(documentIdParam);
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
  }, [documentIdParam]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }
  
  if (error || !doc || !documentIdParam) {
    return <div className="flex items-center justify-center h-screen">文档不存在或无法访问</div>;
  }

  const { title, coverImage, iconImage, editorJson } = doc;
  // 确保documentId存在
  const documentId = documentIdParam;

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
}

// 主页面组件使用Suspense包装内容组件
export default function BlogEditPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
      <BlogEditContent />
    </Suspense>
  );
}