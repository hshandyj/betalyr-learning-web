"use client";

import { toastError } from "@/hooks/use-toast";
import { useSaving } from "@/store/use-saving";
import { useTitle } from "@/store/use-title";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { ChangeEvent, startTransition, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { updateDoc } from "@/service/notionEditorService";

interface TitleProps {
  currentTitle: string;
  id: string;
}

const Title: React.FC<TitleProps> = ({ currentTitle, id }) => {
  const { setIsSaving } = useSaving();
  const queryClient = useQueryClient();
  const router = useRouter();

  const updateTitle = async (value: string) => {
    try {
      setIsSaving(true);
      
      // 使用notionEditorService中的updateDoc函数更新标题
      await updateDoc(id, { title: value });

      startTransition(() => {
        // Force a cache invalidation.
        queryClient.invalidateQueries({ queryKey: ["docs"] });
        router.refresh();
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 422) {
          toastError({
            title: "无效的请求数据",
            axiosPayloadDesc: "请提供正确的ID和标题",
            error,
          });
          return;
        }
      }

      toastError({ error, title: "更新标题失败" });
    } finally {
      startTransition(() => {
        setIsSaving(false);
      });
    }
  };

  const debouncedUpdates = useDebouncedCallback(async (value: string) => {
    await updateTitle(value);
  }, 1000);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    debouncedUpdates(e.target.value);
  };

  const [hydrated, setHydrated] = useState<boolean>(false);

  const { setTitle, title } = useTitle();

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle, setTitle]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // 添加键盘事件处理函数，响应Ctrl+S保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (title !== currentTitle) {
          updateTitle(title);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, currentTitle]);

  return (
    <div className="text-4xl font-bold relative h-20 flex flex-col justify-center w-full">
      <h1 className="outline-none py-5 opacity-0 sr-only">
        {title || currentTitle}
      </h1>
      <input
        className={
          "appearance-none outline-none py-5 absolute inset-0 bg-transparent"
        }
        type="text"
        value={hydrated ? title : currentTitle}
        onChange={handleChange}
        placeholder="Untitled"
      />
    </div>
  );
};

export default Title;
