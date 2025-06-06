"use client";

import {
  CLOUDINARY_ICON_IMAGE_FOLDER,
  CLOUDINARY_UPLOAD_PRESET,
} from "@/config/textConfig";
import { CldUploadButton } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/Edit/components/Icons";
import { useState, useTransition } from "react";
import { toast, toastError } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateDoc } from "@/service/notionEditorService";
import { getApiUrl } from "@/config/getEnvConfig";

interface IconImageBtnProps {
  id: string;
}

const IconImgUploadBtn: React.FC<IconImageBtnProps> = ({ id }) => {
  // eslint-disable-next-line no-unused-vars
  const [_, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const onUpload = async (result: any) => {
    if (result.event == "success") {
      try {
        setIsLoading(true);

        // 使用updateDoc直接更新文档内容
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
            title: "成功添加图标",
            variant: "default",
          });
        });
      } catch (error) {
        toastError({ error, title: "上传图标失败" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Button
      type="button"
      className="cursor-pointer text-sm md:!opacity-0 group-hover:!opacity-80 transition-opacity duration-200 px-2 gap-2"
      variant={"ghost"}
      size={"sm"}
      disabled={isLoading}
      asChild
    >
      <CldUploadButton
        uploadPreset={CLOUDINARY_UPLOAD_PRESET}
        options={{
          maxFiles: 1,
          resourceType: "image",
          folder: CLOUDINARY_ICON_IMAGE_FOLDER,
          publicId: id,
          cropping: true,
          croppingAspectRatio: 1,
          showSkipCropButton: false,
          croppingShowDimensions: true,
          croppingCoordinatesMode: "custom",
        }}
        onSuccess={onUpload}
        signatureEndpoint={`${getApiUrl()}/public/sign-cloudinary`}
        className="flex items-center gap-2"
      >
        <Icons.Camera className="h-4 w-4" />
        <span>Add Icon</span>
      </CldUploadButton>
    </Button>
  );
};

export default IconImgUploadBtn;
