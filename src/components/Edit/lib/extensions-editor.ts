import { TiptapExtensions } from "./extensions";
import HorizontalRule from "@tiptap/extension-horizontal-rule";

import Dropcursor from "@tiptap/extension-dropcursor";
import History from "@tiptap/extension-history";
import Placeholder from "@tiptap/extension-placeholder";

import SlashCommand from "@/components/Edit/custom-extensions/SlashCommand";

export const TipTapEditorExtensions = [
  ...TiptapExtensions,
  History.configure({
    depth: 20,
  }),
  Dropcursor.configure({
    color: "#7dd3fc",
    width: 2,
  }),
  HorizontalRule,
  Placeholder.configure({
    placeholder: ({ node, editor }: any) => {
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`;
      }

      // 检查节点是否为列表项或任务列表项
      if (node.type.name === "listItem" || node.type.name === "taskItem") {
        return ""; // 对于列表项不显示占位符
      }

      // 检查节点是否有内容或格式
      if (node.content.size > 0 || editor.isActive("bulletList") || editor.isActive("orderedList") || editor.isActive("taskList")) {
        return ""; // 如果有内容或已应用格式则不显示占位符
      }

      return "Press '/' for commands, or enter some text...";
    },
    showOnlyWhenEditable: true,
    includeChildren: false,
  }),
  SlashCommand,
];
