"use client";

import { cn, preventBubbling } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { buttonVariants } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  CheckIcon,
  ExternalLinkIcon,
  Link2Icon,
  Share1Icon,
} from "@radix-ui/react-icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { publishDoc } from "@/service/notionEditorService";
import { toastError } from "@/hooks/use-toast";
import { toast } from "sonner";

interface ShareProps {
  isShare?: boolean;
}
const Share: React.FC<ShareProps> = ({ isShare }) => {
  const pathName = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  const toggle = () => setIsOpen(!isOpen);

  if (isShare) return null;

  const closeDelayed = () => {
    setTimeout(() => setIsOpen(false), 500);
  };
  
  const documentId = pathName.split("/").pop();
  
  const handleShareClick = async () => {
    if (!documentId) return;
    
    try {
      setIsPublishing(true);
      // 确保文档在分享前已发布
      await publishDoc(documentId);
      // 刷新页面以反映新的状态
      router.refresh();
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
          asChild
          onClick={handleShareClick}
          disabled={isPublishing}
        >
          <Link
            href={`share${pathName}`}
            target="_blank"
            className="flex gap-2"
          >
            <ExternalLinkIcon className="w-4 h-4" />
            <span>{isPublishing ? "发布中..." : "在新页面打开"}</span>
          </Link>
        </DropdownMenuItem>
        <CopyButton callback={closeDelayed} documentId={documentId} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function CopyButton({ callback, documentId }: { callback: () => void, documentId?: string }) {
  const pathName = usePathname();
  const [copied, setCopied] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  const copylink = async () => {
    if (documentId) {
      try {
        setIsPublishing(true);
        // 确保文档在复制链接前已发布
        await publishDoc(documentId);
        toast.success("文档已发布并复制链接");
      } catch (error) {
        console.error("发布文档失败:", error);
      } finally {
        setIsPublishing(false);
      }
    }
    
    callback();
    setCopied(true);
  };

  return (
    <CopyToClipboard text={`${window.location.origin}/share${pathName}`}>
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={(e) => preventBubbling(e, { callback: copylink })}
        disabled={isPublishing}
      >
        <div className="flex gap-2 items-center ">
          <div className="w-4 h-4 relative">
            <CheckIcon
              className={cn(
                "w-4 h-4 text-green-500 inset-0 absolute opacity-0 transition-opacity duration-200",
                copied && "opacity-100"
              )}
            />
            <Link2Icon
              className={cn(
                "w-4 h-4 inset-0 absolute opacity-0 transition-opacity duration-200",
                !copied && "opacity-100"
              )}
            />
          </div>
          {isPublishing ? <span>发布中...</span> : 
           copied ? <span>已复制</span> : <span>复制链接</span>}
        </div>
      </DropdownMenuItem>
    </CopyToClipboard>
  );
}

export default Share;
