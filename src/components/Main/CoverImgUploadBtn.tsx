"use client";

import {
  CLOUDINARY_COVER_IMAGE_FOLDER,
  CLOUDINARY_UPLOAD_PRESET,
} from "@/config/textConfig";

import { CldUploadButton } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Icons } from "../Icons";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast, toastError } from "@/hooks/use-toast";
import { updateDoc } from "@/service/notionEditorService";
import { getApiUrl } from "@/config/getEnvConfig";

interface CoverImageBtnProps {
  id: string;
}

const CoverImgUploadBtn: React.FC<CoverImageBtnProps> = ({ id }) => {
  // eslint-disable-next-line no-unused-vars
  const [_, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const onUpload = async (result: any) => {
    if (result.event == "success") {
      try {
        setIsLoading(true);

        // 使用updateDoc直接更新文档内容
        await updateDoc(id, {
          coverImage: {
            url: result.info.secure_url,
            timeStamp: Date.now(),
          },
        });

        startTransition(() => {
          router.refresh();
          toast({
            title: "成功添加封面图片",
            variant: "default",
          });
        });
      } catch (error) {
        toastError({ error, title: "上传封面图片失败" });
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
          folder: CLOUDINARY_COVER_IMAGE_FOLDER,
          publicId: id,
          cropping: true,
          croppingAspectRatio: 3,
          showSkipCropButton: false,
          croppingShowDimensions: true,
          croppingCoordinatesMode: "custom",
        }}
        onSuccess={onUpload}
        onError={(error) => {
          console.error("Cloudinary upload error:", error);
          toast({
            title: "上传组件加载失败",
            description: "请刷新页面或稍后再试",
            variant: "destructive",
          });
        }}
        signatureEndpoint={`${getApiUrl()}/documents/sign-cloudinary`}
        className="flex items-center gap-2"
      >
        <Icons.Image className="h-4 w-4" />
        <span>Add Cover</span>
      </CldUploadButton>
    </Button>
  );
};

export default CoverImgUploadBtn;
