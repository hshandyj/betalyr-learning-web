"use client"

import { useCallback, useRef, useState } from 'react';
import { Block, BlockType } from '@/types/block-editor';
import ParagraphBlock from './blocks/ParagraphBlock';
import HeadingBlock from './blocks/HeadingBlock';
import CodeBlock from './blocks/CodeBlock';
import BlockquoteBlock from './blocks/BlockquoteBlock';
import BulletListBlock from './blocks/BulletListBlock';
import OrderedListBlock from './blocks/OrderedListBlock';
import ImageBlock from './blocks/ImageBlock';
import DividerBlock from './blocks/DividerBlock';
import TodoBlock from './blocks/TodoBlock';
import { ChevronDown } from 'lucide-react';

interface BlockComponentProps {
  block: Block;
  isSelected: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  onChange: (id: string, content: any) => void;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onTypeChange: (newType: BlockType, attrs?: any) => void;
  onDelete: () => void;
  onSplit: (position: number) => string | undefined;
  onMerge: (targetId: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, position: 'before' | 'after') => void;
  onSlashCommand: (blockId: string, query: string, position: { x: number, y: number }) => void;
  prevBlockId: string | null;
  nextBlockId: string | null;
  readOnly: boolean;
}

const BlockComponent: React.FC<BlockComponentProps> = ({ 
  block, 
  isSelected, 
  isDragging, 
  isDropTarget,
  onChange,
  onSelect,
  onContextMenu,
  onTypeChange,
  onDelete,
  onSplit,
  onMerge,
  onDragStart,
  onDragEnd,
  onDrop,
  onSlashCommand,
  prevBlockId,
  nextBlockId,
  readOnly
}) => {
  const [showControls, setShowControls] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  // 处理拖拽进入事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (readOnly) return;
    
    const rect = blockRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // 根据鼠标位置决定是放在块的上方还是下方
    const mouseY = e.clientY;
    const blockMiddle = rect.top + rect.height / 2;
    const position = mouseY < blockMiddle ? 'before' : 'after';
    
    // 显示放置指示线
    if (blockRef.current) {
      blockRef.current.setAttribute('data-drop-position', position);
    }
  }, [readOnly]);

  // 处理拖拽离开事件
  const handleDragLeave = useCallback(() => {
    if (blockRef.current) {
      blockRef.current.removeAttribute('data-drop-position');
    }
  }, []);

  // 处理放置事件
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const position = blockRef.current?.getAttribute('data-drop-position') as 'before' | 'after' || 'after';
    
    onDrop(e, position);
    
    // 清除放置指示线
    if (blockRef.current) {
      blockRef.current.removeAttribute('data-drop-position');
    }
  }, [onDrop]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (readOnly) return;
    
    // 处理Enter键：分割块
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const offset = range.startOffset;
        onSplit(offset);
      }
    }
    
    // 处理Backspace键：如果在块开始处，合并块
    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.startOffset === 0 && prevBlockId) {
          e.preventDefault();
          onMerge(prevBlockId);
        }
      }
    }
    
    // 处理斜杠命令
    if (e.key === '/' && !showControls) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.startOffset === 0) {
          // 创建斜杠命令菜单
          const rect = range.getBoundingClientRect();
          onSlashCommand(block.id, '', { x: rect.left, y: rect.bottom });
        }
      }
    }
  }, [block.id, onMerge, onSplit, onSlashCommand, prevBlockId, readOnly, showControls]);

  // 渲染相应类型的块
  const renderBlock = () => {
    const commonProps = {
      content: {
        ...block.content,
        attrs: {
          ...(block.content.attrs || {}),
          id: block.id
        }
      },
      attrs: {
        ...block.attrs,
        id: block.id
      },
      isSelected,
      onChange: (content: any) => onChange(block.id, content),
      onKeyDown: handleKeyDown,
      readOnly
    };

    switch (block.type) {
      case 'paragraph':
        return <ParagraphBlock {...commonProps} />;
      case 'heading':
        return <HeadingBlock {...commonProps} level={block.attrs?.level || 1} />;
      case 'code':
        return <CodeBlock {...commonProps} language={block.attrs?.language || 'javascript'} />;
      case 'blockquote':
        return <BlockquoteBlock {...commonProps} />;
      case 'bulletList':
        return <BulletListBlock {...commonProps} />;
      case 'orderedList':
        return <OrderedListBlock {...commonProps} />;
      case 'image':
        return <ImageBlock {...commonProps} url={block.attrs?.url || ''} alt={block.attrs?.alt || ''} />;
      case 'divider':
        return <DividerBlock {...commonProps} />;
      case 'todo':
        return <TodoBlock {...commonProps} checked={block.attrs?.checked || false} />;
      default:
        return <ParagraphBlock {...commonProps} />;
    }
  };

  return (
    <div
      ref={blockRef}
      className={`block-wrapper ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={onSelect}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      draggable={!readOnly}
      data-block-id={block.id}
      data-block-type={block.type}
    >
      {!readOnly && showControls && (
        <div className="block-controls">
          <button className="block-drag-handle" onMouseDown={(e) => e.stopPropagation()}>
            <div className="drag-dots">⠿</div>
          </button>
          <button className="block-menu-button" onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onContextMenu(e);
          }}>
            <ChevronDown size={14} />
          </button>
        </div>
      )}
      <div className="block-content">
        {renderBlock()}
      </div>
    </div>
  );
};

export default BlockComponent; 