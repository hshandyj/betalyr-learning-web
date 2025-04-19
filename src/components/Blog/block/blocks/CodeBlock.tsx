"use client"

import { useEffect, useState } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import { ChevronDown } from 'lucide-react';

// 创建lowlight实例
const lowlight = createLowlight(common);

// 常用的编程语言列表
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
];

interface CodeBlockProps {
  content: JSONContent;
  language?: string;
  isSelected: boolean;
  onChange: (content: JSONContent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  readOnly: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  content,
  language = 'javascript',
  isSelected,
  onChange,
  onKeyDown,
  readOnly
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  
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
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: currentLanguage,
      }),
      Placeholder.configure({
        placeholder: '输入代码...',
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
        class: 'focus:outline-none',
        spellcheck: 'false',
      },
      handleKeyDown: (view, event) => {
        // 对于代码块，我们希望Enter键保持原有行为，插入换行而不是创建新块
        if (event.key === 'Enter' && event.shiftKey && event.ctrlKey) {
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
      },
    },
  });

  // 当语言变化时，更新代码块语言
  useEffect(() => {
    if (editor && !editor.isDestroyed && currentLanguage) {
      editor.commands.updateAttributes('codeBlock', {
        language: currentLanguage,
      });
    }
  }, [currentLanguage, editor]);

  // 设置初始内容
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(content);
      
      // 只有当内容真正变化时才更新
      if (currentContent !== newContent) {
        // 首次加载或内容真正变化时
        if (editor.isEmpty) {
          // 如果编辑器为空，设置代码块和内容
          editor.commands.clearContent();
          editor.commands.setCodeBlock({ language: currentLanguage });
          
          // 如果有内容，则设置内容
          if (content) {
            editor.commands.setContent(content);
          }
        } else {
          // 如果编辑器已有内容，更新代码块语言属性
          editor.commands.updateAttributes('codeBlock', {
            language: currentLanguage,
          });
        }
      }
    }
  }, [content, currentLanguage, editor]);

  // 设置焦点
  useEffect(() => {
    if (editor && isSelected && !readOnly) {
      editor.commands.focus('end');
    }
  }, [editor, isSelected, readOnly]);

  // 监听自定义粘贴事件
  useEffect(() => {
    if (!editor) return;
    
    const codeEl = document.querySelector(`[data-block-id="${content.attrs?.id || ''}"]`);
    if (!codeEl) return;
    
    const handleInternalPaste = (event: CustomEvent) => {
      if (event.detail && event.detail.text && editor) {
        editor.commands.insertContent(event.detail.text);
      }
    };
    
    codeEl.addEventListener('internal-paste', handleInternalPaste as EventListener);
    
    return () => {
      codeEl.removeEventListener('internal-paste', handleInternalPaste as EventListener);
    };
  }, [editor, content.attrs?.id]);

  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang);
    setIsLanguageMenuOpen(false);
  };

  return (
    <div className={`code-block ${isSelected ? 'code-selected' : ''}`} data-block-id={content.attrs?.id || ''}>
      {!readOnly && (
        <div className="code-block-header">
          <div className="language-selector">
            <button 
              className="language-selector-button"
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
            >
              {LANGUAGES.find(lang => lang.value === currentLanguage)?.label || currentLanguage}
              <ChevronDown size={14} />
            </button>
            
            {isLanguageMenuOpen && (
              <div className="language-dropdown">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.value}
                    className={`language-option ${lang.value === currentLanguage ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(lang.value)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="code-block-content" onKeyDown={onKeyDown}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default CodeBlock; 