"use client";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { buttonVariants } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Share1Icon } from "@radix-ui/react-icons";
import { publishDoc, unpublishDoc } from "@/service/notionEditorService";
import { toastError } from "@/hooks/use-toast";
import { toast } from "sonner";

interface ShareProps {
  isShare?: boolean;
  isPublic?: boolean;
}

const Share: React.FC<ShareProps> = ({ isShare, isPublic }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get('id');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const toggle = () => setIsOpen(!isOpen);

  if (isShare) return null;

  const handlePublishToggle = async () => {
    if (!documentId) {
      toast.error("无法获取文档ID");
      return;
    }
    
    try {
      setIsProcessing(true);
      let success = false;
      
      if (isPublic) {
        // 取消发布文档
        success = await unpublishDoc(documentId);
        if (success) {
          toast.success("文档已取消发布");
        }
      } else {
        // 发布文档
        success = await publishDoc(documentId);
        if (success) {
          toast.success("文档已发布成功");
        }
      }
      
      // 只有操作成功才关闭下拉菜单
      if (success) {
        setIsOpen(false);
        
        // 确保页面刷新以反映新的状态
        router.refresh();
        
        // 为确保状态更新，可以考虑重载页面
        // 注意：在生产环境中，可能需要更优雅的方式来更新状态
        window.location.reload();
      }
    } catch (error) {
      toastError({ 
        error, 
        title: isPublic ? "取消发布文档失败" : "发布文档失败" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={toggle}>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "ghost" }), "h-[28px] px-2")}
      >
        <Share1Icon className="block md:hidden h-5 w-5 p-[1px]" />
        <span className="hidden md:block">分享</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={15}>
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={handlePublishToggle}
          disabled={isProcessing}
        >
          <div className="flex gap-2 items-center">
            <Share1Icon className="w-4 h-4" />
            <span>
              {isProcessing 
                ? (isPublic ? "取消发布中..." : "发布中...") 
                : (isPublic ? "取消发布文章" : "发布文章")
              }
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Share;
