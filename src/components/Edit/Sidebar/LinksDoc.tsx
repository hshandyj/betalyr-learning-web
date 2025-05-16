"use client";

import { Icons } from "@/components/Edit/components/Icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import Links from "@/components/Edit/Sidebar/Links";
import { DocumentType } from "../../../types/document";

interface LinksDocProps {
  addDoc: () => void;
  refetch: () => void;
  status: "success" | "error" | "pending";
  docs: DocumentType[] | undefined;
  toggle?: () => void;
}

const LinksDoc: React.FC<LinksDocProps> = ({
  addDoc,
  docs = [],
  status,
  refetch,
  toggle,
}) => {
  return (
    <ScrollArea
      className="flex-1 w-full px-2"
      type="auto"
    >
      <ul className="p-1 h-full space-y-1 pb-20">
        {status == "success" ? (
          <>
            <Links docs={docs} toggle={toggle} showMore />
            <li>
              <button
                className="flex hover:bg-accent w-full items-center px-2 py-[2px] cursor-pointer rounded-sm"
                type="button"
                onClick={addDoc}
                tabIndex={0}
              >
                <Icons.Plus
                  className="h-6 w-6 p-1 shrink-0"
                />
                <span
                  className="pl-3 text-sm w-max"
                >
                  Add a page
                </span>
              </button>
            </li>
          </>
        ) : status == "error" ? (
          <div className="px-4 py-2 rounded-sm text-sm bg-destructive/20 space-y-2 text-center">
            <p className="text-xs text-foreground/50 font-semibold">
              *Something went wrong
            </p>
            <Button variant="destructive" size={"sm"} onClick={() => refetch()}>
              <ReloadIcon className="w-4 h-4 p-[2px] shrink-0" /> Please Refetch
            </Button>
          </div>
        ) : (
          // prettier-ignore
          <div className="animate-pulse space-y-1 [&>div]:h-7 [&>div]:rounded-sm [&>div]:bg-accent">
            <div  /><div  /><div  /><div  /><div  /><div  /><div  /><div  /><div  /><div  /><div  />
            <div  /><div  /><div  /><div  /><div  /><div  /><div  /><div  /><div  /><div  /><div  />
            <div  /><div  /><div  /><div  /><div  /><div  /><div  /><div  /><div  /><div  /><div  />
          </div>
        )}
      </ul>
    </ScrollArea>
  );
};

export default LinksDoc;
