"use client"

import { useEffect } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface OrderedListBlockProps {
  content: JSONContent;
  isSelected: boolean;
  onChange: (content: JSONContent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  readOnly: boolean;
}

const OrderedListBlock: React.FC<OrderedListBlockProps> = ({
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
        orderedList: {},
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: '有序列表...',
        showOnlyWhenEditable: true,
      }),
    ],
    content,
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
        // 允许正常的Enter行为来添加列表项
        if (event.key === 'Enter' && event.shiftKey) {
          onKeyDown(event as unknown as React.KeyboardEvent);
          return true;
        }
        
        if (event.key === 'Backspace') {
          const { state } = view;
          const { selection } = state;
          const { empty } = selection;
          
          if (empty && selection.anchor === 1) {
            onKeyDown(event as unknown as React.KeyboardEvent);
            return true;
          }
        }
        
        return false;
      },
    },
  });

  // 设置初始内容
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const currentContent = editor.getJSON();
      
      // 比较当前内容与传入的内容是否相同
      const contentChanged = JSON.stringify(currentContent) !== JSON.stringify(content);
      
      if (contentChanged) {
        if (!content || !content.content?.length) {
          // 如果没有内容，清空并创建有序列表
          editor.commands.clearContent();
          editor.commands.toggleOrderedList();
        } else {
          // 如果有内容，且与当前不同，则更新内容
          editor.commands.setContent(content);
        }
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
    
    const listEl = document.querySelector(`[data-block-id="${content.attrs?.id || ''}"]`);
    if (!listEl) return;
    
    const handleInternalPaste = (event: CustomEvent) => {
      if (event.detail && event.detail.text && editor) {
        editor.commands.insertContent(event.detail.text);
      }
    };
    
    listEl.addEventListener('internal-paste', handleInternalPaste as EventListener);
    
    return () => {
      listEl.removeEventListener('internal-paste', handleInternalPaste as EventListener);
    };
  }, [editor, content.attrs?.id]);

  return (
    <div 
      data-block-id={content.attrs?.id || ''}
      className={`ordered-list-block ${isSelected ? 'list-selected' : ''}`}
      onKeyDown={onKeyDown}
    >
      <EditorContent editor={editor} />
    </div>
  );
};

export default OrderedListBlock; 