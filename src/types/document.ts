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
  tags?: string[];
}

export interface DocumentList {
  id: string;
  title: string;
  iconImage?: {
    url: string;
    timeStamp: number;
  } | null;
}

export interface PublicDocumentList {
  id: string;
  title: string;
  iconImage?: {
    url: string;
    timeStamp: number;
  } | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  tags?: string[];
}

export type DocumentType = Pick<Document, "title" | "id" | "iconImage">;
