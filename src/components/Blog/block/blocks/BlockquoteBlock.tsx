"use client"

import { useEffect } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface BlockquoteBlockProps {
  content: JSONContent;
  isSelected: boolean;
  onChange: (content: JSONContent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  readOnly: boolean;
}

const BlockquoteBlock: React.FC<BlockquoteBlockProps> = ({
  content,
  isSelected,
  onChange,
  onKeyDown,
  readOnly
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        codeBlock: false,
        blockquote: {},
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: '输入引用内容...',
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
          if (empty && selection.anchor === 1) { // blockquote有一个初始字符
            onKeyDown(event as unknown as React.KeyboardEvent);
            return true;
          }
        }
        
        return false;
      }
    },
  });

  // 设置初始内容
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const currentContent = JSON.stringify(editor.getJSON());
      const isEmpty = currentContent === '{"type":"doc","content":[]}';
      
      // 仅在编辑器为空时设置初始内容
      if (isEmpty) {
        editor.commands.clearContent();
        editor.commands.setBlockquote();
      }
    }
  }, [editor]);
  
  // 更新内容 - 仅在内容确实变化时
  useEffect(() => {
    if (editor && !editor.isDestroyed && content) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(content);
      
      // 只有当内容真正不同时才设置内容
      if (currentContent !== newContent) {
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor]);

  // 设置焦点
  useEffect(() => {
    if (editor && isSelected && !readOnly) {
      editor.commands.focus('end');
    }
  }, [editor, isSelected, readOnly]);

  // 监听自定义粘贴事件
  useEffect(() => {
    if (!editor) return;
    
    const blockquoteEl = document.querySelector(`[data-block-id="${content.attrs?.id || ''}"]`);
    if (!blockquoteEl) return;
    
    const handleInternalPaste = (event: CustomEvent) => {
      if (event.detail && event.detail.text && editor) {
        editor.commands.insertContent(event.detail.text);
      }
    };
    
    blockquoteEl.addEventListener('internal-paste', handleInternalPaste as EventListener);
    
    return () => {
      blockquoteEl.removeEventListener('internal-paste', handleInternalPaste as EventListener);
    };
  }, [editor, content.attrs?.id]);

  return (
    <div 
      data-block-id={content.attrs?.id || ''}
      className={`blockquote-block ${isSelected ? 'blockquote-selected' : ''}`}
      onKeyDown={onKeyDown}
    >
      <EditorContent editor={editor} />
    </div>
  );
};

export default BlockquoteBlock; 