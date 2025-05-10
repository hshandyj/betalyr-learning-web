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

interface IconImageProps {
  isCoverImage?: boolean;
  iconImage: Document["iconImage"];
  id: string;
}

const IconImage: React.FC<IconImageProps> = ({
  isCoverImage,
  iconImage,
  id,
}) => {
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
          iconImage: {
            url: result.info.secure_url,
            timeStamp: Date.now(),
          },
        });

        startTransition(() => {
          queryClient.invalidateQueries({ queryKey: ["docs"] });
          router.refresh();
          toast({
            title: "成功更新图标",
            variant: "default",
          });
        });
      } catch (error) {
        toastError({ error, title: "更新图标失败" });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);

      await updateDoc(id, {
        iconImage: null,
      });

      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["docs"] });
        router.refresh();
        toast({
          title: "成功删除图标",
          variant: "default",
        });
      });
    } catch (error) {
      toastError({ error, title: "删除图标失败" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={cn(
      "relative group w-[125px] h-[125px]",
      isCoverImage && "absolute z-10 left-10 md:left-24 top-0 -translate-y-1/2"
    )}>
      <Image
        className="w-[125px] h-[125px] object-cover bg-accent"
        alt="icons image"
        src={`${iconImage?.url}?timeStamp=${iconImage?.timeStamp}`}
        height="125"
        width="125"
        quality={95}
        priority
      />

      {/* Status */}
      <div
        className={cn(
          "bg-black/50 absolute inset-0 w-full h-full hidden",
          isLoading && "block"
        )}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-max h-max text-white flex items-center gap-1">
          <Icons.loader className="h-3 w-3 animate-spin" />
          {isDeleting && (
            <span className="font-semibold text-sm">Deleting</span>
          )}
          {isUpdating && (
            <span className="font-semibold text-sm">Updating</span>
          )}
        </div>
      </div>

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
  );
};

export default IconImage;
