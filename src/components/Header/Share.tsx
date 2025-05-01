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
import { publishDoc } from "@/service/notionEditorService";
import { toastError } from "@/hooks/use-toast";
import { toast } from "sonner";

interface ShareProps {
  isShare?: boolean;
}

const Share: React.FC<ShareProps> = ({ isShare }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get('id');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  const toggle = () => setIsOpen(!isOpen);

  if (isShare) return null;

  const handlePublish = async () => {
    if (!documentId) {
      toast.error("无法获取文档ID");
      return;
    }
    
    try {
      setIsPublishing(true);
      // 发布文档
      await publishDoc(documentId);
      
      // 关闭下拉菜单
      setIsOpen(false);
      
      // 刷新页面以反映新的状态
      router.refresh();
      
      toast.success("文档已发布成功");
    } catch (error) {
      toastError({ error, title: "发布文档失败" });
    } finally {
      setIsPublishing(false);
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
          onClick={handlePublish}
          disabled={isPublishing}
        >
          <div className="flex gap-2 items-center">
            <Share1Icon className="w-4 h-4" />
            <span>{isPublishing ? "发布中..." : "发布文章"}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Share;
