"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type DocumentType } from "../../../types/document";
import { Icons } from "../components/Icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, toastError } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";

import More from "./More";
import { DeleteDocumentPayload } from "@/lib/validators/Documents";
import Image from "next/image";
import { useTitle } from "@/store/use-title";

interface Redirect {
  data: string | null;
}

export type MutationProps = {
  id: string;
  callback?: () => void;
};

interface LinksProps {
  docs: DocumentType[] | undefined;
  size?: "medium" | "default";
  showMore?: boolean;
  toggle?: () => void;
}

export default function Links({
  docs = [],
  size,
  showMore,
  toggle,
}: LinksProps) {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { title } = useTitle();

  const currentDocId = Array.isArray(params.id) ? params.id[0] : params.id || '';

  const { mutate } = useMutation({
    mutationFn: async ({ id, callback }: MutationProps) => {
      if (callback) callback();

      const payload: DeleteDocumentPayload = {
        currentDoc: currentDocId,
        id,
      };

      const { data: redirect }: Redirect = await axios.delete(
        `/api/documents/${id}`,
        { data: payload }
      );

      return redirect;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 422) {
          toastError({
            title: "Invalid payload axios.",
            axiosPayloadDesc: "Please provide currentDoc and id",
            error,
          });
          return;
        }
      }
      toastError({ error, title: "Failed delete" });
    },
    onSuccess: (redirect) => {
      queryClient.invalidateQueries({ queryKey: ["docs"] });

      if (redirect) {
        router.push(redirect);
      }

      return toast({
        title: "Successfully deleted the doc",
        variant: "default",
      });
    },
  });

  return (
    <>
      {docs.map((doc) => {
        const linkTitle =
          (currentDocId === doc.id ? title : doc.title) || "Untitled";

        return (
          <li key={doc.id}>
            <Link
              tabIndex={0}
              href={`/blog/edit?id=${doc.id}`}
              className={cn(
                "flex hover:bg-accent w-full items-center px-2 py-[2px] cursor-pointer rounded-sm transition-colors duration-200 overflow-x-hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                currentDocId === doc.id && size !== "medium" && "bg-accent",
                size === "medium" && "px-4 py-3 rounded-none"
              )}
            >
              {doc.iconImage ? (
                <Image
                  alt="icon doc"
                  src={`${doc.iconImage.url}?timeStamp=${doc.iconImage.timeStamp}`}
                  width={6}
                  height={6}
                  className="h-6 w-6 p-1 shrink-0 object-cover"
                />
              ) : (
                <Icons.FileText
                  className="h-6 w-6 p-1 shrink-0"
                />
              )}
              <span
                className="pl-3 h-6 leading-6 text-sm truncate flex-1 select-none"
              >
                {linkTitle}
              </span>

              {showMore && (
                <More doc={doc} mutate={mutate} />
              )}
            </Link>
          </li>
        );
      })}
    </>
  );
}
