import { Icons } from "@/components/Edit/components/Icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { preventBubbling } from "@/lib/utils";
import { DocumentType } from "@/types/document";

interface MoreDialogProps {
  // eslint-disable-next-line no-unused-vars
  onDelete: (prop: DocumentType) => void;
  toggleOpen: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  isLoading: boolean;
  isOpen: boolean;
  doc: DocumentType;
}

const MoreDialog: React.FC<MoreDialogProps> = ({
  closeMenu,
  doc,
  isLoading,
  isOpen,
  onDelete,
  openMenu,
  toggleOpen,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={toggleOpen}>
      <DialogTrigger asChild>
        <div
          role="button"
          onClick={(e) => preventBubbling(e, { callback: openMenu })}
          tabIndex={0}
          className="h-5 w-5 p-[2px] hover:bg-accent-foreground/20 rounded-sm focus-visible:ring-[1px] focus-visible:ring-ring focus:outline-none"
        >
          <Icons.DotsHorizontalIcon
            className="h-4 w-4 p-[1px]"
          />
        </div>
      </DialogTrigger>
      <DialogContent onClick={preventBubbling}>
        <DialogHeader className="h-[48px] relative border-b border-border">
          <DialogTitle className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
            Actions
          </DialogTitle>
          <button
            onClick={closeMenu}
            type="button"
            disabled={isLoading}
            className="absolute right-5 top-[50%] translate-y-[-50%] !m-0 text-blue-400 font-semibold cursor-pointer"
          >
            Done
          </button>
        </DialogHeader>
        <button
          className="flex hover:bg-accent w-full items-center px-3 py-2 cursor-pointer"
          type="button"
          onClick={() => onDelete(doc)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="h-8 w-8 flex justify-center items-center">
                <Icons.loader className="h-6 w-6 p-1 shrink-0 animate-spin opacity-60" />
              </div>
              <span className="pl-3 text-base w-max opacity-60">Deleting</span>
            </>
          ) : (
            <>
              <Icons.Delete className="h-8 w-8 p-1 shrink-0" />
              <span className="pl-3 text-base w-max">Delete</span>
            </>
          )}
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default MoreDialog;
