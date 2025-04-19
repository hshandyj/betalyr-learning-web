"use client"

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface ParagraphBlockProps {
  content: JSONContent;
  isSelected: boolean;
  onChange: (content: JSONContent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  readOnly: boolean;
}

const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
  content,
  isSelected,
  onChange,
  onKeyDown,
  readOnly
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: '输入文本...',
        showOnlyWhenEditable: true,
      }),
    ],
    content: content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none max-w-none',
        spellcheck: 'false',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          onKeyDown(event as unknown as React.KeyboardEvent);
          return true;
        }
        if (event.key === 'Backspace') {
          const { state } = view;
          const { selection } = state;
          const { empty } = selection;
          
          // 如果光标在文档开头，尝试与上一个块合并
          if (empty && selection.anchor === 0) {
            onKeyDown(event as unknown as React.KeyboardEvent);
            return true;
          }
        }
        if (event.key === '/') {
          const { state } = view;
          const { selection } = state;
          const { empty } = selection;
          
          // 如果是空白块并输入/，触发斜杠命令
          if (empty && selection.anchor === 0) {
            // 拦截/键，但会在onKeyDown中处理展示命令菜单
          }
        }
        return false;
      }
    },
  });

  // 如果需要，在此添加初始内容设置
  useEffect(() => {
    if (editor && !editor.isDestroyed && content) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(content);
      
      // 只有当内容真正不同时才设置内容，避免循环
      if (currentContent !== newContent) {
        editor.commands.setContent(content, false);
      }
    }
  }, [editor, content]);

  // 设置焦点
  useEffect(() => {
    if (editor && isSelected && !readOnly) {
      editor.commands.focus('end');
    }
  }, [editor, isSelected, readOnly]);

  // 监听自定义粘贴事件
  useEffect(() => {
    if (!editor) return;
    
    const paragraphEl = document.querySelector(`[data-block-id="${editorRef.current?.getAttribute('data-block-id')}"]`);
    if (!paragraphEl) return;
    
    const handleInternalPaste = (event: CustomEvent) => {
      if (event.detail && event.detail.text && editor) {
        editor.commands.insertContent(event.detail.text);
      }
    };
    
    paragraphEl.addEventListener('internal-paste', handleInternalPaste as EventListener);
    
    return () => {
      paragraphEl.removeEventListener('internal-paste', handleInternalPaste as EventListener);
    };
  }, [editor]);

  return (
    <div 
      ref={editorRef}
      data-block-id={content.attrs?.id || ''}
      className={`paragraph-block ${isSelected ? 'paragraph-selected' : ''}`}
      onKeyDown={onKeyDown}
    >
      <EditorContent editor={editor} />
    </div>
  );
};

export default ParagraphBlock; 