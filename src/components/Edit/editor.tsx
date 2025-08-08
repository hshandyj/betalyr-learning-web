"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useQueryClient } from "@tanstack/react-query";
import { TipTapEditorExtensions } from "@/components/Edit/lib/extensions-editor";
import { TipTapEditorProps } from "@/components/Edit/lib/props";
import { AxiosError } from "axios";
import { toastError } from "@/hooks/use-toast";
import { useSaving } from "@/store/use-saving";
import Skeleton from "./components/Skeleton";
import TextMenu from "./BubbleMenu/TextMenu";
import { updateDoc } from "@/service/notionEditorService";

export default function Editor({
  editorJson,
  id,
}: {
  editorJson: JSONContent;
  id: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // eslint-disable-next-line no-unused-vars
  const [_, startTransition] = useTransition();
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [content, setContent] = useState<JSONContent | null>(null);
  const [currentDocId, setCurrentDocId] = useState<string>(id);

  const { setIsSaving } = useSaving();

  const updateEditorJson = useCallback(
    async (editorJson: JSONContent) => {
      try {
        setIsSaving(true);
        
        await updateDoc(id, { editorJson });

        startTransition(() => {
          // 失效当前文档的详情缓存，确保下次切换回来时获取最新数据
          queryClient.invalidateQueries({ queryKey: ["document", id] });
          router.refresh();
        });
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 422) {
            toastError({
              title: "无效的请求数据",
              axiosPayloadDesc: "请提供正确的ID和编辑器内容",
              error,
            });
            return;
          }
        }

        toastError({ error, title: "更新文档失败" });
      } finally {
        startTransition(() => {
          setIsSaving(false);
        });
      }
    },
    [id, router, setIsSaving, queryClient]
  );

  const debouncedUpdates = useDebouncedCallback(async ({ editor }) => {
    const json = editor.getJSON() as JSONContent;
    setContent(json);
    await updateEditorJson(json);
  }, 1000);

  const editor = useEditor({
    extensions: TipTapEditorExtensions,
    editorProps: TipTapEditorProps,
    onUpdate: (e) => debouncedUpdates(e),
    content,
  });

  useEffect(() => {
    const handleCtrlS = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "s" && editor) {
        event.preventDefault(); // Prevent the default Ctrl+S behavior (save)
        // Your function logic here
        setIsSaving(true);

        const json = editor.getJSON() as JSONContent;
        updateEditorJson(json);
      }
    };

    window.addEventListener("keydown", handleCtrlS);
    return () => {
      try {
        window.removeEventListener("keydown", handleCtrlS);
      } catch (error) {
        // 忽略移除事件监听器时的错误
        console.warn("Failed to remove keydown listener:", error);
      }
    };
  }, [setIsSaving, updateEditorJson, editor]);

  // 当文档ID改变时，重置hydration状态并清理编辑器
  useEffect(() => {
    if (id !== currentDocId) {
      // 文档切换，取消pending的保存操作并重置状态
      debouncedUpdates.cancel();
      
      // 如果有编辑器实例，先清理内容避免DOM冲突
      if (editor && !editor.isDestroyed) {
        try {
          editor.commands.clearContent();
        } catch (error) {
          console.warn("Failed to clear editor content:", error);
        }
      }
      
      setHydrated(false);
      setCurrentDocId(id);
      setContent(null);
      setIsSaving(false);
    }
  }, [id, currentDocId, debouncedUpdates, setIsSaving, editor]);

  // Hydrate the editor with the content from the database.
  useEffect(() => {
    if (editor && !hydrated && editorJson) {
      // 使用setTimeout确保DOM完全就绪
      const timer = setTimeout(() => {
        try {
          editor.commands.setContent(editorJson);
          setContent(editorJson);
          setHydrated(true);
        } catch (error) {
          console.warn("Editor content setting failed, retrying:", error);
          // 如果失败，延迟重试
          setTimeout(() => {
            try {
              editor.commands.setContent(editorJson);
              setContent(editorJson);
              setHydrated(true);
            } catch (retryError) {
              console.error("Editor content setting failed after retry:", retryError);
            }
          }, 100);
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [editor, hydrated, editorJson]);

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      try {
        debouncedUpdates.cancel();
        if (editor && !editor.isDestroyed) {
          editor.destroy();
        }
      } catch (error) {
        // 忽略清理时的错误
        console.warn("Failed to cleanup editor:", error);
      }
    };
  }, [editor, debouncedUpdates]);

  return (
    <div
      id="editor-container"
      className="relative w-full cursor-text flex-1 px-10 md:px-24 pb-16 selection:text-[unset] selection:bg-sky-200 dark:selection:bg-sky-600/50"
    >
      {hydrated ? (
        <div 
          key={`editor-${id}`} 
          id="menu-two" 
          className="w-full max-w-[708px] mx-auto h-full"
        >
          <TextMenu editor={editor} />
          <EditorContent editor={editor} />
        </div>
      ) : (
        // loading state
        <div className="w-full max-w-[708px] mx-auto h-full">
          <Skeleton />
        </div>
      )}
    </div>
  );
}
