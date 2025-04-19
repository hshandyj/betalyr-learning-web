"use client"

import { JSONContent } from '@tiptap/react';

interface DividerBlockProps {
  content: JSONContent;
  isSelected: boolean;
  onChange: (content: JSONContent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  readOnly: boolean;
}

const DividerBlock: React.FC<DividerBlockProps> = ({
  content,
  isSelected,
  onKeyDown
}) => {
  return (
    <div 
      className={`divider-block ${isSelected ? 'divider-selected' : ''}`}
      contentEditable={false}
      onKeyDown={onKeyDown}
      tabIndex={0}
      data-block-id={content.attrs?.id || ''}
    >
      <hr className="divider" />
    </div>
  );
};

export default DividerBlock; 