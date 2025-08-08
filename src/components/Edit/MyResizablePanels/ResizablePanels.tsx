"use client";

import Sidebar from "@/components/Edit/Sidebar";
import { cn } from "@/lib/utils";
import { toast, toastError } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserDocs, createEmptyDoc } from "@/service/notionEditorService";
import { useShowSidebarContext } from "@/contexts/show-sidebar-context";
import PanelGroup from "./PanelGroup";
import PanelSidebar from "./PanelSidebar";
import PanelResizeHandler from "./PanelResizeHandler";

const useDocs = () => {
  return useQuery({
    staleTime: 1 * (60 * 1000), // 1分钟内不重新请求，与全局配置保持一致
    queryKey: ["docs"],
    // 实现getUserDocs方法获取文档列表
    queryFn: async () => {
      try {
        // 使用虚拟用户ID获取文档列表
        return await getUserDocs();
      } catch (error) {
        console.error("获取文档列表失败:", error);
        return [];
      }
    },
  });
};

export default function ReactResizablePanels({
  defaultLayout,
  right,
}: {
  defaultLayout: number;
  right: React.ReactNode;
}) {
  const router = useRouter();
  const query = useDocs();
  const queryClient = useQueryClient();

  // 使用createEmptyDoc方法创建新文档
  const { mutate: addDoc } = useMutation({
    mutationFn: async () => {
      try {
        const newDoc = await createEmptyDoc();
        if (!newDoc) {
          throw new Error("创建文档失败");
        }
        return newDoc.id; // 返回新文档的ID
      } catch (error) {
        console.error("创建文档时出错:", error);
        throw error;
      }
    },
    onError: (error: any) => {
      return toastError({ error, title: "创建新文档失败" });
    },
    onSuccess: (newDocId) => {
      // 使用缓存失效方法
      queryClient.invalidateQueries({ queryKey: ["docs"] });
      
      // 使用router进行导航
      router.push(`/blog/edit?id=${newDocId}`);
      
      return toast({
        title: "文档创建成功",
        variant: "default",
      });
    },
  });

  const showSidebar = useShowSidebarContext((s) => s.showSidebar);
  const toggleSidebar = useShowSidebarContext((s) => s.toggleSidebar);

  // 处理布局变化
  const onLayout = (sizes: number) => {
    if (typeof window !== 'undefined') {
      // 使用localStorage存储布局，避免cookie引起的渲染问题
      localStorage.setItem("react-resizable-panels:layout", JSON.stringify(sizes));
    }
  };

  return (
    <PanelGroup
      defaultLayout={defaultLayout}
      maxWidth={480}
      minWidth={220}
      onLayout={onLayout}
    >
      <PanelSidebar
        className="bg-secondary/50"
        collapse={!showSidebar}
      >
        <Sidebar toggleSidebar={toggleSidebar} addDoc={addDoc} query={query} />
      </PanelSidebar>
      <PanelResizeHandler
        id={"my-PanelResizeHandler"}
        disabled={!showSidebar}
        className={cn("w-[4px] bg-accent hover:bg-border")}
      />
      <div className="bg-background flex-1">
        {right}
      </div>
    </PanelGroup>
  );
}
