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

// 扩展Window接口以支持我们的自定义属性
declare global {
  interface Window {
    lastTitleUpdateTime?: number;
  }
}

interface TitleProps {
  currentTitle: string;
  id: string;
}

const Title: React.FC<TitleProps> = ({ currentTitle, id }) => {
  const { setIsSaving } = useSaving();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [currentDocId, setCurrentDocId] = useState<string>(id);

  const updateTitle = async (value: string) => {
    try {
      setIsSaving(true);
      
      // 使用notionEditorService中的updateDoc函数更新标题
      await updateDoc(id, { title: value });

      startTransition(() => {
        // 同时失效文档列表和当前文档详情缓存
        queryClient.invalidateQueries({ queryKey: ["docs"] });
        queryClient.invalidateQueries({ queryKey: ["document", id] });
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

  const [hydrated, setHydrated] = useState<boolean>(false);

  const { setTitle, title } = useTitle();

  // 当文档ID改变时，重置title状态并取消pending的保存操作
  useEffect(() => {
    if (id !== currentDocId) {
      // 取消pending的debounced更新
      debouncedUpdates.cancel();
      // 重置为新文档的标题
      setTitle(currentTitle);
      setCurrentDocId(id);
    }
  }, [id, currentDocId, currentTitle, setTitle, debouncedUpdates]);

  // 监听currentTitle变化，确保缓存更新后能同步到UI
  useEffect(() => {
    // 只有在相同文档且title与currentTitle不同时才更新（避免用户正在编辑时被覆盖）
    if (id === currentDocId && title !== currentTitle) {
      // 检查用户是否正在编辑（如果最近没有用户输入，则同步服务器数据）
      const timeSinceLastUpdate = Date.now() - (window.lastTitleUpdateTime || 0);
      if (timeSinceLastUpdate > 2000) { // 2秒内没有用户操作，同步服务器数据
        setTitle(currentTitle);
      }
    }
  }, [currentTitle, setTitle, id, currentDocId, title]);

  // 修改handleChange，记录用户操作时间
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    window.lastTitleUpdateTime = Date.now();
    setTitle(e.target.value);
    debouncedUpdates(e.target.value);
  };

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
    return () => {
      try {
        window.removeEventListener('keydown', handleKeyDown);
      } catch (error) {
        // 忽略移除事件监听器时的错误
        console.warn("Failed to remove keydown listener:", error);
      }
    };
  }, [title, currentTitle, updateTitle]);

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
