"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { Block, BlockType, BlockSelection, ContextMenuState, DragState } from '@/types/block-editor';
import { v4 as uuidv4 } from 'uuid';
import BlockComponent from './BlockComponent';
import BlockContextMenu from './BlockContextMenu';
import BlockPlaceholder from './BlockPlaceholder';
import SlashCommandMenu from './SlashCommandMenu';
import { useEditorStore } from './store';

interface BlockEditorProps {
  initialBlocks: Block[];
  onChange?: (blocks: Block[]) => void;
  readOnly?: boolean;
}

const BlockEditor = ({ initialBlocks, onChange, readOnly = false }: BlockEditorProps) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selection, setSelection] = useState<BlockSelection>({
    id: null,
    focusOffset: 0,
    anchorOffset: 0,
    isCollapsed: true,
  });
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    targetBlockId: null,
  });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedBlockId: null,
    dropTargetId: null,
    dropPosition: null,
  });
  const [slashMenuState, setSlashMenuState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    query: '',
    blockId: '',
  });
  
  const editorRef = useRef<HTMLDivElement>(null);
  
  // 将状态同步到store
  useEffect(() => {
    useEditorStore.setState({ 
      blocks, 
      selection,
      readOnly 
    });
  }, [blocks, selection, readOnly]);

  // 当blocks变化时，调用onChange回调
  useEffect(() => {
    onChange?.(blocks);
  }, [blocks, onChange]);

  // 处理块内容更新
  const handleBlockChange = useCallback((id: string, content: any) => {
    if (readOnly) return;
    
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === id ? { ...block, content } : block
      )
    );
  }, [readOnly]);

  // 处理块类型转换
  const handleBlockTypeChange = useCallback((id: string, newType: BlockType, attrs: any = {}) => {
    if (readOnly) return;
    
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === id ? { ...block, type: newType, attrs: { ...block.attrs, ...attrs } } : block
      )
    );
  }, [readOnly]);

  // 创建新块
  const createNewBlock = useCallback((type: BlockType = 'paragraph', insertAfter: string) => {
    if (readOnly) return;
    
    const newBlock: Block = {
      id: uuidv4(),
      type,
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
    };
    
    setBlocks(prevBlocks => {
      const insertIndex = prevBlocks.findIndex(b => b.id === insertAfter) + 1;
      if (insertIndex > 0) {
        return [
          ...prevBlocks.slice(0, insertIndex),
          newBlock,
          ...prevBlocks.slice(insertIndex)
        ];
      }
      return [...prevBlocks, newBlock];
    });
    
    return newBlock.id;
  }, [readOnly]);

  // 删除块
  const deleteBlock = useCallback((id: string) => {
    if (readOnly) return;
    
    setBlocks(prevBlocks => {
      // 如果只有一个块，保留它但清空内容
      if (prevBlocks.length <= 1) {
        return prevBlocks.map(block => 
          block.id === id ? {
            ...block,
            type: 'paragraph',
            content: { type: 'doc', content: [{ type: 'paragraph' }] }
          } : block
        );
      }
      
      return prevBlocks.filter(block => block.id !== id);
    });
  }, [readOnly]);

  // 合并块（当Backspace键在块开始处按下时）
  const mergeBlocks = useCallback((currentId: string, targetId: string) => {
    if (readOnly) return;
    
    setBlocks(prevBlocks => {
      const currentIndex = prevBlocks.findIndex(b => b.id === currentId);
      const targetIndex = prevBlocks.findIndex(b => b.id === targetId);
      
      if (currentIndex === -1 || targetIndex === -1) return prevBlocks;
      
      const currentBlock = prevBlocks[currentIndex];
      const targetBlock = prevBlocks[targetIndex];
      
      // 合并后的内容逻辑依赖于具体实现
      // 这里简单处理，实际应该合并富文本内容
      const mergedBlock = {
        ...targetBlock,
        content: targetBlock.content // 需要合并内容的逻辑
      };
      
      const result = [...prevBlocks];
      result[targetIndex] = mergedBlock;
      
      // 如果不是第一个块，删除当前块
      if (currentIndex > 0) {
        result.splice(currentIndex, 1);
      }
      
      return result;
    });
  }, [readOnly]);

  // 拆分块（当Enter键按下时）
  const splitBlock = useCallback((id: string, position: number) => {
    if (readOnly) return;
    
    // 创建一个新块
    const newBlockId = createNewBlock('paragraph', id);
    
    // 此处应分割富文本内容
    // 实际实现需要将当前块在position位置分割，并将后半部分内容移到新块
    
    return newBlockId;
  }, [createNewBlock, readOnly]);

  // 处理块选择
  const handleBlockSelect = useCallback((id: string) => {
    setSelection(prev => ({
      ...prev,
      id,
      isCollapsed: true
    }));
  }, []);

  // 处理上下文菜单
  const handleContextMenu = useCallback((e: React.MouseEvent, blockId: string) => {
    e.preventDefault();
    if (readOnly) return;
    
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      targetBlockId: blockId
    });
  }, [readOnly]);

  // 关闭上下文菜单
  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

  // 处理块拖动开始
  const handleDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    if (readOnly) return;
    
    e.dataTransfer.setData('text/plain', blockId);
    setDragState({
      isDragging: true,
      draggedBlockId: blockId,
      dropTargetId: null,
      dropPosition: null
    });
  }, [readOnly]);

  // 处理块拖动结束
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedBlockId: null,
      dropTargetId: null,
      dropPosition: null
    });
  }, []);

  // 处理块放置
  const handleDrop = useCallback((e: React.DragEvent, targetId: string, position: 'before' | 'after') => {
    e.preventDefault();
    if (readOnly) return;
    
    const sourceId = e.dataTransfer.getData('text/plain');
    
    setBlocks(prevBlocks => {
      const sourceIndex = prevBlocks.findIndex(b => b.id === sourceId);
      const targetIndex = prevBlocks.findIndex(b => b.id === targetId);
      
      if (sourceIndex === -1 || targetIndex === -1) return prevBlocks;
      
      const result = [...prevBlocks];
      const [movedBlock] = result.splice(sourceIndex, 1);
      
      // 计算正确的插入位置（考虑到删除后索引的变化）
      let insertAtIndex = targetIndex;
      if (position === 'after') insertAtIndex++;
      if (sourceIndex < targetIndex) insertAtIndex--;
      
      result.splice(insertAtIndex, 0, movedBlock);
      return result;
    });
    
    handleDragEnd();
  }, [handleDragEnd, readOnly]);

  // 处理/ 命令菜单
  const handleSlashCommand = useCallback((blockId: string, query: string, position: { x: number, y: number }) => {
    if (readOnly) return;
    
    setSlashMenuState({
      isOpen: true,
      blockId,
      query,
      position
    });
  }, [readOnly]);

  // 关闭/ 命令菜单
  const closeSlashMenu = useCallback(() => {
    setSlashMenuState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // 处理块命令执行
  const executeBlockCommand = useCallback((command: string, blockId: string, data?: any) => {
    if (readOnly) return;
    
    if (command === 'convertTo' && data?.type) {
      handleBlockTypeChange(blockId, data.type as BlockType, data.attrs);
    } else if (command === 'delete') {
      deleteBlock(blockId);
    } else if (command === 'duplicate') {
      // 实现复制块的逻辑
      const blockToDuplicate = blocks.find(b => b.id === blockId);
      if (blockToDuplicate) {
        const duplicatedBlock = {
          ...blockToDuplicate,
          id: uuidv4()
        };
        
        setBlocks(prevBlocks => {
          const insertIndex = prevBlocks.findIndex(b => b.id === blockId) + 1;
          return [
            ...prevBlocks.slice(0, insertIndex),
            duplicatedBlock,
            ...prevBlocks.slice(insertIndex)
          ];
        });
      }
    }
    // 实现其他命令...
    
    closeContextMenu();
  }, [blocks, closeContextMenu, deleteBlock, handleBlockTypeChange, readOnly]);

  // 全局点击事件，用于关闭菜单
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.isOpen) closeContextMenu();
      if (slashMenuState.isOpen) closeSlashMenu();
    };
    
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [closeContextMenu, closeSlashMenu, contextMenu.isOpen, slashMenuState.isOpen]);

  // 处理顶层编辑器的粘贴事件
  const handleEditorPaste = useCallback((e: React.ClipboardEvent) => {
    if (readOnly || !selection.id) return;
    
    // 阻止默认粘贴行为
    e.preventDefault();
    
    const clipboardData = e.clipboardData;
    const text = clipboardData.getData('text/plain');
    
    // 如果没有文本，则不处理
    if (!text.trim()) return;
    
    // 判断是否是多行文本
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    
    // 如果只有一行，在当前块处理
    if (lines.length <= 1) {
      // 找到当前选中的块
      const selectedBlock = blocks.find(b => b.id === selection.id);
      if (!selectedBlock) return;
      
      // 派发一个自定义事件给当前选中的块处理
      const event = new CustomEvent('internal-paste', {
        detail: { text: lines[0] },
        bubbles: false // 防止事件冒泡导致重复处理
      });
      
      const blockElement = document.querySelector(`[data-block-id="${selection.id}"]`);
      blockElement?.dispatchEvent(event);
      return;
    }
    
    // 处理多行文本：为每行创建一个新块
    // 首先，将第一行插入到当前块
    const currentBlockId = selection.id;
    
    // 派发事件给当前块
    const event = new CustomEvent('internal-paste', {
      detail: { text: lines[0] },
      bubbles: false // 防止事件冒泡导致重复处理
    });
    
    const blockElement = document.querySelector(`[data-block-id="${currentBlockId}"]`);
    blockElement?.dispatchEvent(event);
    
    // 为剩余行创建新块
    const insertAfterBlockId = currentBlockId;
    let lastInsertedBlockId = insertAfterBlockId;
    
    // 创建一个更新队列，等当前块处理完后再执行
    setTimeout(() => {
      // 为剩余每一行创建新的段落块
      for (let i = 1; i < lines.length; i++) {
        const newBlockId = createNewBlock('paragraph', lastInsertedBlockId);
        lastInsertedBlockId = newBlockId || '';
        
        // 设置新块的内容和ID属性
        setBlocks(prevBlocks => 
          prevBlocks.map(block => 
            block.id === newBlockId ? {
              ...block,
              content: {
                type: 'doc',
                content: [{
                  type: 'paragraph',
                  content: lines[i] ? [{ type: 'text', text: String(lines[i]) }] : []
                }]
              },
              attrs: {
                ...block.attrs,
                id: newBlockId // 确保块的ID属性被设置
              }
            } : block
          )
        );
      }
      
      // 选择最后创建的块
      setTimeout(() => {
        handleBlockSelect(lastInsertedBlockId);
      }, 50);
    }, 50);
  }, [blocks, createNewBlock, handleBlockSelect, readOnly, selection.id]);

  // 在useEffect中添加事件监听
  useEffect(() => {
    if (!editorRef.current || readOnly) return;
    
    const handlePaste = (e: ClipboardEvent) => {
      // 如果粘贴发生在编辑器内的块中，让块自己处理
      const target = e.target as HTMLElement;
      if (target.closest('.ProseMirror')) {
        return;
      }
      
      // 只有当粘贴发生在编辑器层级时才处理
      if (editorRef.current?.contains(target)) {
        handleEditorPaste(e as unknown as React.ClipboardEvent);
      }
    };
    
    // 添加粘贴事件监听
    editorRef.current.addEventListener('paste', handlePaste as EventListener);
    
    return () => {
      editorRef.current?.removeEventListener('paste', handlePaste as EventListener);
    };
  }, [handleEditorPaste, readOnly]);

  return (
    <div 
      className="block-editor" 
      ref={editorRef}
      onClick={() => {
        if (contextMenu.isOpen) closeContextMenu();
        if (slashMenuState.isOpen) closeSlashMenu();
      }}
      onPaste={handleEditorPaste}
    >
      {blocks.length === 0 && !readOnly && (
        <BlockPlaceholder onCreate={(type: BlockType) => createNewBlock(type, '')} />
      )}
      
      {blocks.map((block, index) => (
        <BlockComponent
          key={block.id}
          block={block}
          isSelected={selection.id === block.id}
          isDragging={dragState.isDragging && dragState.draggedBlockId === block.id}
          isDropTarget={dragState.dropTargetId === block.id}
          onChange={handleBlockChange}
          onSelect={() => handleBlockSelect(block.id)}
          onContextMenu={(e) => handleContextMenu(e, block.id)}
          onTypeChange={(newType, attrs) => handleBlockTypeChange(block.id, newType, attrs)}
          onDelete={() => deleteBlock(block.id)}
          onSplit={(position) => splitBlock(block.id, position)}
          onMerge={(targetId) => mergeBlocks(block.id, targetId)}
          onDragStart={(e) => handleDragStart(e, block.id)}
          onDragEnd={handleDragEnd}
          onDrop={(e, position) => handleDrop(e, block.id, position)}
          onSlashCommand={handleSlashCommand}
          prevBlockId={index > 0 ? blocks[index - 1].id : null}
          nextBlockId={index < blocks.length - 1 ? blocks[index + 1].id : null}
          readOnly={readOnly}
        />
      ))}
      
      {contextMenu.isOpen && (
        <BlockContextMenu
          position={contextMenu.position}
          blockId={contextMenu.targetBlockId!}
          blockType={blocks.find(b => b.id === contextMenu.targetBlockId)?.type || 'paragraph'}
          onCommand={executeBlockCommand}
          onClose={closeContextMenu}
        />
      )}
      
      {slashMenuState.isOpen && (
        <SlashCommandMenu
          position={slashMenuState.position}
          query={slashMenuState.query}
          blockId={slashMenuState.blockId}
          onSelect={(type: BlockType, attrs?: any) => {
            handleBlockTypeChange(slashMenuState.blockId, type, attrs);
            closeSlashMenu();
          }}
          onClose={closeSlashMenu}
        />
      )}
    </div>
  );
};

export default BlockEditor; 