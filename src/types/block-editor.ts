import { JSONContent } from "@tiptap/react";

// 块类型定义
export type BlockType = 
  | 'paragraph' 
  | 'heading' 
  | 'bulletList' 
  | 'orderedList' 
  | 'listItem'
  | 'code' 
  | 'blockquote' 
  | 'image' 
  | 'divider'
  | 'embed'
  | 'table'
  | 'tableRow'
  | 'tableCell'
  | 'todo';

// 块级别定义
export interface Block {
  id: string;
  type: BlockType;
  content: JSONContent;
  // 针对特定类型的额外属性
  attrs?: {
    level?: 1 | 2 | 3;          // 标题级别，用于heading类型
    language?: string;        // 代码块的语言，用于code类型
    url?: string;            // 图片或嵌入内容的URL
    alt?: string;            // 图片替代文本
    checked?: boolean;       // 待办事项是否已勾选
    alignment?: 'left' | 'center' | 'right';  // 内容对齐方式
  };
  children?: Block[];        // 嵌套块的子块
}

// 编辑器文档
export interface Document {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

// 博客文章
export interface BlogPost extends Document {
  author: string;
  summary: string;
  tags: string[];
  coverImage?: string;
  published: boolean;
}

// 块选择状态
export interface BlockSelection {
  id: string | null;        // 当前选中的块ID
  focusOffset: number;      // 光标在块内容中的位置
  anchorOffset: number;     // 选择锚点的位置（用于多选）
  isCollapsed: boolean;     // 选择是否已折叠（单光标位置）
}

// 上下文菜单状态
export interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  targetBlockId: string | null;
}

// 块拖拽状态
export interface DragState {
  isDragging: boolean;
  draggedBlockId: string | null;
  dropTargetId: string | null;
  dropPosition: 'before' | 'after' | 'inside' | null;
}

// 编辑器命令
export type BlockCommand = 
  | 'convertTo'        // 转换块类型
  | 'delete'           // 删除块
  | 'duplicate'        // 复制块
  | 'moveUp'           // 向上移动块
  | 'moveDown'         // 向下移动块
  | 'indent'           // 缩进块
  | 'outdent'          // 减少缩进
  | 'addComment'       // 添加评论
  | 'turnIntoPage';    // 转为页面 