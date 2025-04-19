"use client"

import { useState } from 'react';
import { BlockType } from '@/types/block-editor';
import { Plus } from 'lucide-react';

interface BlockPlaceholderProps {
  onCreate: (type: BlockType) => void;
}

const BlockPlaceholder: React.FC<BlockPlaceholderProps> = ({ onCreate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="block-placeholder">
      {!isExpanded ? (
        <button 
          className="add-block-button"
          onClick={() => setIsExpanded(true)}
        >
          <Plus size={16} />
          <span>添加内容块</span>
        </button>
      ) : (
        <div className="block-type-selector">
          <button onClick={() => onCreate('paragraph')}>
            文本
          </button>
          <button onClick={() => onCreate('heading')}>
            标题
          </button>
          <button onClick={() => onCreate('bulletList')}>
            无序列表
          </button>
          <button onClick={() => onCreate('orderedList')}>
            有序列表
          </button>
          <button onClick={() => onCreate('code')}>
            代码块
          </button>
          <button onClick={() => onCreate('blockquote')}>
            引用
          </button>
          <button onClick={() => onCreate('divider')}>
            分割线
          </button>
          <button onClick={() => onCreate('image')}>
            图片
          </button>
          <button className="cancel" onClick={() => setIsExpanded(false)}>
            取消
          </button>
        </div>
      )}
    </div>
  );
};

export default BlockPlaceholder; 