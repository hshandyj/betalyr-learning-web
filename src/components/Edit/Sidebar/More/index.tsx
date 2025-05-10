import { DocumentType } from "../../../../types/document";
import { useState } from "react";
import { useWindowSize } from "@/hooks/use-window-size";
import { type UseMutateFunction } from "@tanstack/react-query";
import { type MutationProps } from "../Links";
import { deleteDoc, createEmptyDoc, getUserDocs } from "@/service/notionEditorService";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LOCAL_LAST_DOCUMENT_KEY } from "@/config/textConfig";
import { toast, toastError } from "@/hooks/use-toast";

import MoreDropDown from "./MoreDropDown";
import MoreDialog from "./MoreDialog";

// 硬编码sm断点为640px (标准tailwind sm断点)
const SM_BREAKPOINT = 640;

interface MoreProps {
  doc: DocumentType;
  mutate: UseMutateFunction<string | null, Error, MutationProps, unknown>;
}

const More: React.FC<MoreProps> = ({ doc, mutate }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const toggleOpen = () => setIsOpen(!isOpen);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);

  const onDelete = async ({ id }: DocumentType) => {
    try {
      setIsLoading(true);
      const result = await deleteDoc(id);
      
      if (result) {
        closeMenu();
        
        // 获取当前用户的文档列表
        const userDocs = await getUserDocs();
        
        if (userDocs && userDocs.length > 0) {
          // 如果还有其他文章，跳转到最新的文章
          const latestDoc = userDocs[0]; // 假设列表是按时间排序的
          localStorage.setItem(LOCAL_LAST_DOCUMENT_KEY, latestDoc.id);
          
          // 先使缓存失效
          await queryClient.invalidateQueries({ queryKey: ["docs"] });
          
          // 然后再导航
          router.push(`/blog/edit?id=${latestDoc.id}`);
        } else {
          // 如果没有文章了，创建一个新文章
          const newDoc = await createEmptyDoc();
          if (newDoc && newDoc.id) {
            localStorage.setItem(LOCAL_LAST_DOCUMENT_KEY, newDoc.id);
            
            // 直接更新查询缓存，将新文档添加到列表中
            queryClient.setQueryData(["docs"], [newDoc]);
            
            // 确保缓存更新后再导航
            await queryClient.invalidateQueries({ queryKey: ["docs"] });
            
            // 在导航之前强制等待一小段时间，确保缓存更新
            setTimeout(() => {
              router.push(`/blog/edit?id=${newDoc.id}`);
              toast({
                title: "已创建新文档",
                variant: "default",
              });
            }, 100);
          }
        }
      }
    } catch (error) {
      console.error("删除文档时出错:", error);
      toastError({ error, title: "删除文档失败" });
    } finally {
      setIsLoading(false);
    }
  };

  // make sure when use useWindowSize always on component that get show by useEffect
  const { width } = useWindowSize();

  return (
    <>
      {/* show when screen size bigger than sm (tablet and dekstop)*/}
      {width && width >= SM_BREAKPOINT && (
        <MoreDropDown
          {...{
            isOpen,
            toggleOpen,
            openMenu,
            closeMenu,
            onDelete,
            doc,
            isLoading,
          }}
        />
      )}

      {/* show when screen size same or less than sm / 640px / phone*/}
      {width && width < SM_BREAKPOINT && (
        <MoreDialog
          {...{
            isOpen,
            toggleOpen,
            openMenu,
            closeMenu,
            onDelete,
            doc,
            isLoading,
          }}
        />
      )}
    </>
  );
};

export default More;
