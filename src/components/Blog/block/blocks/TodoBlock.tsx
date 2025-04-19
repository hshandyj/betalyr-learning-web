"use client"

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

interface TodoBlockProps {
  content: JSONContent;
  checked?: boolean;
  isSelected: boolean;
  onChange: (content: JSONContent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  readOnly: boolean;
}

const TodoBlock: React.FC<TodoBlockProps> = ({
  content,
  checked = false,
  isSelected,
  onChange,
  onKeyDown,
  readOnly
}) => {
  const contentRef = useRef<string>("");
  
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
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: '待办事项...',
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
        if (event.key === 'Enter' && !event.shiftKey) {
          onKeyDown(event as unknown as React.KeyboardEvent);
          return true;
        }
        
        if (event.key === 'Backspace') {
          const { state } = view;
          const { selection } = state;
          const { empty } = selection;
          
          // 判断是否在文档开头
          if (empty && selection.anchor === 1) { // taskItem有一个初始字符
            onKeyDown(event as unknown as React.KeyboardEvent);
            return true;
          }
        }
        
        return false;
      },
    },
  });

  // 初始化编辑器内容，只在编辑器初始化时执行
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContentStr = JSON.stringify(content);
      
      if (contentRef.current !== newContentStr && 
          (currentContent === '{"type":"doc","content":[]}' || !currentContent)) {
        contentRef.current = newContentStr;
        
        editor.commands.clearContent();
        
        // 创建一个任务列表
        editor.commands.insertContent({
          type: 'taskList',
          content: [{
            type: 'taskItem',
            attrs: { checked },
            content: content?.content?.length ? content.content : [{ type: 'paragraph' }]
          }]
        });
      }
    }
  }, [editor, content, checked]);

  // 设置焦点
  useEffect(() => {
    if (editor && isSelected && !readOnly) {
      editor.commands.focus('end');
    }
  }, [editor, isSelected, readOnly]);

  // 监听自定义粘贴事件
  useEffect(() => {
    if (!editor) return;
    
    const todoEl = document.querySelector(`[data-block-id="${content.attrs?.id || ''}"]`);
    if (!todoEl) return;
    
    const handleInternalPaste = (event: CustomEvent) => {
      if (event.detail && event.detail.text && editor) {
        editor.commands.insertContent(event.detail.text);
      }
    };
    
    todoEl.addEventListener('internal-paste', handleInternalPaste as EventListener);
    
    return () => {
      todoEl.removeEventListener('internal-paste', handleInternalPaste as EventListener);
    };
  }, [editor, content.attrs?.id]);

  // 处理复选框点击
  const handleCheckboxChange = () => {
    if (editor && !readOnly) {
      // 使用正确的方法切换任务项状态
      editor.chain().focus().toggleTaskList().run();
    }
  };

  return (
    <div 
      data-block-id={content.attrs?.id || ''}
      className={`todo-block ${isSelected ? 'todo-selected' : ''}`}
      onKeyDown={onKeyDown}
    >
      <div className="todo-content" onClick={handleCheckboxChange}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TodoBlock; 