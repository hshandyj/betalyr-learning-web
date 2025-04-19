"use client"

import { useRef, useEffect } from 'react';
import { BlockType } from '@/types/block-editor';
import { 
  Copy, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Heading1, 
  Heading2, 
  Heading3, 
  AlignLeft, 
  Code, 
  List, 
  ListOrdered, 
  Quote, 
  Image, 
  FileText, 
  CheckSquare, 
  Minus 
} from 'lucide-react';

interface BlockContextMenuProps {
  position: { x: number; y: number };
  blockId: string;
  blockType: BlockType;
  onCommand: (command: string, blockId: string, data?: any) => void;
  onClose: () => void;
}

const BlockContextMenu: React.FC<BlockContextMenuProps> = ({ 
  position, 
  blockId, 
  blockType, 
  onCommand, 
  onClose 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
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
  
  // 块类型选项
  const blockTypeOptions = [
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
  
  return (
    <div 
      ref={menuRef}
      className="block-context-menu"
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        minWidth: '200px',
        padding: '8px 0'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="menu-section">
        <div className="menu-section-title">转换为</div>
        <div className="menu-options">
          {blockTypeOptions.map((option) => (
            <button
              key={`${option.type}-${option.label}`}
              className={`menu-option ${blockType === option.type && blockType !== 'heading' ? 'active' : ''}
                ${blockType === 'heading' && option.type === 'heading' && option.attrs?.level === blockTypeOptions.find(o => o.type === 'heading')?.attrs?.level ? 'active' : ''}`}
              onClick={() => onCommand('convertTo', blockId, { type: option.type, attrs: option.attrs })}
            >
              <span className="option-icon">{option.icon}</span>
              <span className="option-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="menu-divider"></div>
      
      <div className="menu-section">
        <div className="menu-options">
          <button
            className="menu-option"
            onClick={() => onCommand('moveUp', blockId)}
          >
            <span className="option-icon"><ArrowUp size={16} /></span>
            <span className="option-label">上移</span>
          </button>
          <button
            className="menu-option"
            onClick={() => onCommand('moveDown', blockId)}
          >
            <span className="option-icon"><ArrowDown size={16} /></span>
            <span className="option-label">下移</span>
          </button>
          <button
            className="menu-option"
            onClick={() => onCommand('duplicate', blockId)}
          >
            <span className="option-icon"><Copy size={16} /></span>
            <span className="option-label">复制</span>
          </button>
          <button
            className="menu-option"
            onClick={() => onCommand('delete', blockId)}
          >
            <span className="option-icon"><Trash2 size={16} /></span>
            <span className="option-label">删除</span>
          </button>
          <button
            className="menu-option"
            onClick={() => onCommand('turnIntoPage', blockId)}
          >
            <span className="option-icon"><FileText size={16} /></span>
            <span className="option-label">转为页面</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockContextMenu; 