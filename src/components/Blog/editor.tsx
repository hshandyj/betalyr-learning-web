"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { TipTapEditorExtensions } from "@/components/Blog/lib/extensions-editor";
import { TipTapEditorProps } from "@/components/Blog/lib/props";
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
  // eslint-disable-next-line no-unused-vars
  const [_, startTransition] = useTransition();
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [content, setContent] = useState<JSONContent | null>(null);

  const { setIsSaving } = useSaving();

  const updateEditorJson = useCallback(
    async (editorJson: JSONContent) => {
      try {
        setIsSaving(true);
        
        await updateDoc(id, { editorJson });

        startTransition(() => {
          // Force a cache invalidation.
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
    [id, router, setIsSaving]
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
      window.removeEventListener("keydown", handleCtrlS);
    };
  }, [setIsSaving, updateEditorJson, editor]);

  // Hydrate the editor with the content from the database.
  useEffect(() => {
    if (editor && !hydrated) {
      editor.commands.setContent(editorJson);
      setHydrated(true);
    }
  }, [editor, hydrated, editorJson]);

  return (
    <div
      id="editor-container"
      className="relative w-full cursor-text flex-1 px-10 md:px-24 pb-16 selection:text-[unset] selection:bg-sky-200 dark:selection:bg-sky-600/50"
    >
      {hydrated ? (
        <div id="menu-two" className="w-full max-w-[708px] mx-auto h-full">
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
