// 自定义Document类型，而不是从@prisma/client导入
import { JSONContent } from "@tiptap/react";

export interface Document {
  id: string;
  ownerId: string;
  title: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  iconImage?: {
    url: string;
    timeStamp: number;
  } | null;
  coverImage?: {
    url: string;
    timeStamp: number;
  } | null;
  editorJson?: JSONContent | null;
  isPublic?: boolean;
}

export interface DocumentList {
  id: string;
  title: string;
  iconImage?: {
    url: string;
    timeStamp: number;
  } | null;
}

export type DocumentType = Pick<Document, "title" | "id" | "iconImage">;

export type InitialDoc = Pick<Document, "id"> | null;
