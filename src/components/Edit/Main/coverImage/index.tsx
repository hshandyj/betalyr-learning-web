"use client";

import { toastError, toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import Image from "next/image";
import { Document } from "@/types/document";
import { Icons } from "@/components/Icons";
import { cn } from "@/lib/utils";
import Menu from "./Menu";
import { updateDoc } from "@/service/notionEditorService";

interface CoverImageProps {
  id: string;
  coverImage: Document["coverImage"];
}

const CoverImage: React.FC<CoverImageProps> = ({ id, coverImage }) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const isLoading = isDeleting || isUpdating;

  const onSuccess = async (result: any) => {
    if (result.event == "success") {
      try {
        setIsUpdating(true);

        await updateDoc(id, {
          coverImage: {
            url: result.info.secure_url,
            timeStamp: Date.now(),
          },
        });

        startTransition(() => {
          queryClient.invalidateQueries({ queryKey: ["docs"] });
          router.refresh();
          toast({
            title: "成功更新封面图片",
            variant: "default",
          });
        });
      } catch (error) {
        toastError({ error, title: "更新封面图片失败" });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);

      await updateDoc(id, {
        coverImage: null,
      });

      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["docs"] });
        router.refresh();
        toast({
          title: "成功删除封面图片",
          variant: "default",
        });
      });
    } catch (error) {
      toastError({ error, title: "删除封面图片失败" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-[200px] md:h-[280px] w-full relative group shrink-0">
      <Image
        src={`${coverImage?.url}?timeStamp=${coverImage?.timeStamp}`}
        className="object-cover md:object-left z-0 bg-accent"
        alt="cover image"
        quality={95}
        priority
        fill
      />

      {/* Status */}
      <div
        className={cn(
          "bg-black/50 absolute inset-0 w-full h-full hidden",
          isLoading && "block"
        )}
      >
        <div className="absolute bottom-5 right-5 w-max h-max text-white flex items-center gap-1">
          <Icons.loader className="h-3 w-3 animate-spin" />
          {isDeleting && (
            <span className="font-semibold text-sm">Deleting</span>
          )}
          {isUpdating && (
            <span className="font-semibold text-sm">Updating</span>
          )}
        </div>
      </div>

      <div className="absolute inset-0 w-full h-full max-w-[900px] mx-auto px-10 md:px-24">
        {!isLoading ? (
          <Menu
            isDeleting={isDeleting}
            isUpdating={isUpdating}
            onDelete={onDelete}
            onSuccess={onSuccess}
            id={id}
          />
        ) : null}
      </div>
    </div>
  );
};

export default CoverImage;
