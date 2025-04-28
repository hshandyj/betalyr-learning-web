import { JSONContent } from "@tiptap/react";
// 保留类型定义以便使用
declare global {
  namespace PrismaJson {
    type ImageType = {
      url: string;
      timeStamp: string;
    };
    type EditorJson = JSONContent;
  }
}
