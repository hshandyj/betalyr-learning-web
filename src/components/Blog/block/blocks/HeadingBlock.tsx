"use client"

import { useEffect } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface HeadingBlockProps {
  content: JSONContent;
  level: 1 | 2 | 3;
  isSelected: boolean;
  onChange: (content: JSONContent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  readOnly: boolean;
}

const HeadingBlock: React.FC<HeadingBlockProps> = ({
  content,
  level,
  isSelected,
  onChange,
  onKeyDown,
  readOnly
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: false,
        orderedList: false,
        listItem: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: `标题 ${level}...`,
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
          
          // 判断是否在文档开头
          if (empty && selection.anchor === 0) {
            onKeyDown(event as unknown as React.KeyboardEvent);
            return true;
          }
        }
        
        return false;
      }
    },
  });

  // 设置初始标题级别
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const currentContent = editor.getJSON();
      const isEmpty = !currentContent.content || currentContent.content.length === 0;
      
      if (isEmpty) {
        editor.commands.clearContent();
        editor.commands.setHeading({ level });
      } else if (level) {
        // 只更新节点类型，不清除内容
        editor.commands.updateAttributes('heading', { level });
      }
    }
  }, [editor, level]);

  // 设置内容 - 仅在editor初始化或content明确变化时更新
  useEffect(() => {
    if (editor && !editor.isDestroyed && content) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(content);
      
      // 只有当内容真正不同时才设置内容，避免循环
      if (currentContent !== newContent) {
        editor.commands.setContent(content, false); // 第二个参数false表示不触发更新事件
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
    
    const headingEl = document.querySelector(`[data-block-id="${content.attrs?.id || ''}"]`);
    if (!headingEl) return;
    
    const handleInternalPaste = (event: CustomEvent) => {
      if (event.detail && event.detail.text && editor) {
        editor.commands.insertContent(event.detail.text);
      }
    };
    
    headingEl.addEventListener('internal-paste', handleInternalPaste as EventListener);
    
    return () => {
      headingEl.removeEventListener('internal-paste', handleInternalPaste as EventListener);
    };
  }, [editor, content.attrs?.id]);

  return (
    <div 
      data-block-id={content.attrs?.id || ''}
      className={`heading-block heading-${level} ${isSelected ? 'heading-selected' : ''}`}
      onKeyDown={onKeyDown}
    >
      <EditorContent editor={editor} />
    </div>
  );
};

export default HeadingBlock;