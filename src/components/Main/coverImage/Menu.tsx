import {
  CLOUDINARY_COVER_IMAGE_FOLDER,
  CLOUDINARY_UPLOAD_PRESET,
} from "@/config/textConfig";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CldUploadButton } from "next-cloudinary";
import { getApiUrl } from "@/config/getEnvConfig";

interface MenuProps {
  // eslint-disable-next-line no-unused-vars
  onSuccess: (result: any) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
  id: string;
}

const Menu: React.FC<MenuProps> = ({
  isDeleting,
  isUpdating,
  onDelete,
  onSuccess,
  id,
}) => {
  return (
    <div className="absolute bottom-2 right-24 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        type="button"
        className="cursor-pointer text-primary/70 text-xs transition duration-200 px-2 gap-2 bg-background rounded-r-none h-[26px] disabled:opacity-100"
        variant={"ghost"}
        size={"sm"}
        disabled={isUpdating || isDeleting}
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
          onSuccess={onSuccess}
          signatureEndpoint={`${getApiUrl()}/documents/sign-cloudinary`}
          className="flex items-center"
        >
          <span className="select-none">Change</span>
        </CldUploadButton>
      </Button>
      <div>
        <Separator orientation="vertical" />
      </div>
      <Button
        onClick={onDelete}
        type="button"
        className="cursor-pointer text-primary/70 text-xs transition duration-200 px-2 gap-2 bg-background rounded-l-none h-[26px] disabled:opacity-100"
        variant={"ghost"}
        size={"sm"}
        disabled={isUpdating || isDeleting}
      >
        <span className="select-none">Remove</span>
      </Button>
    </div>
  );
};

export default Menu;
