"use client"

import { useRef, useEffect, useState } from 'react';
import { BlockType } from '@/types/block-editor';
import { 
  AlignLeft, 
  Heading1, 
  Heading2, 
  Heading3, 
  Code, 
  List, 
  ListOrdered, 
  Quote, 
  Image, 
  CheckSquare, 
  Minus 
} from 'lucide-react';

interface SlashCommandMenuProps {
  position: { x: number; y: number };
  blockId: string;
  query: string;
  onSelect: (type: BlockType, attrs?: any) => void;
  onClose: () => void;
}

interface CommandOption {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
  attrs?: any;
}

const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({ 
  position, 
  blockId, 
  query, 
  onSelect, 
  onClose 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // 所有可用命令选项
  const commandOptions: CommandOption[] = [
    { type: 'paragraph', label: '文本', icon: <AlignLeft size={16} /> },
    { type: 'heading', label: '标题 1', icon: <Heading1 size={16} />, attrs: { level: 1 } },
    { type: 'heading', label: '标题 2', icon: <Heading2 size={16} />, attrs: { level: 2 } },
    { type: 'heading', label: '标题 3', icon: <Heading3 size={16} />, attrs: { level: 3 } },
    { type: 'bulletList', label: '无序列表', icon: <List size={16} /> },
    { type: 'orderedList', label: '有序列表', icon: <ListOrdered size={16} /> },
    { type: 'todo', label: '待办事项', icon: <CheckSquare size={16} /> },
    { type: 'code', label: '代码块', icon: <Code size={16} /> },
    { type: 'blockquote', label: '引用', icon: <Quote size={16} /> },
    { type: 'divider', label: '分割线', icon: <Minus size={16} /> },
    { type: 'image', label: '图片', icon: <Image size={16} /> },
  ];
  
  // 过滤命令选项
  const filteredOptions = query
    ? commandOptions.filter(option => 
        option.label.toLowerCase().includes(query.toLowerCase())
      )
    : commandOptions;
  
  // 点击外部时关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  // 调整菜单位置，确保它不会超出视口边界
  useEffect(() => {
    if (!menuRef.current) return;
    
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    
    if (rect.right > window.innerWidth) {
      menu.style.left = `${window.innerWidth - rect.width - 10}px`;
    }
    
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${window.innerHeight - rect.height - 10}px`;
    }
  }, [position]);
  
  // 处理键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredOptions.length === 0) return;
      
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredOptions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
          break;
        case 'Enter':
          e.preventDefault();
          const selected = filteredOptions[selectedIndex];
          onSelect(selected.type, selected.attrs);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredOptions, onClose, onSelect, selectedIndex]);
  
  // 重置选中索引当过滤选项变化时
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredOptions.length]);
  
  return (
    <div 
      ref={menuRef}
      className="slash-command-menu"
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        minWidth: '180px',
        maxHeight: '300px',
        overflowY: 'auto',
        padding: '4px 0'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {filteredOptions.length === 0 ? (
        <div className="no-results">没有匹配的命令</div>
      ) : (
        <div className="command-options">
          {filteredOptions.map((option, index) => (
            <button
              key={`${option.type}-${option.label}`}
              className={`command-option ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => onSelect(option.type, option.attrs)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="option-icon">{option.icon}</span>
              <span className="option-label">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SlashCommandMenu; 