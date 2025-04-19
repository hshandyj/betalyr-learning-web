import { create } from 'zustand';
import { Block, BlockSelection } from '@/types/block-editor';

interface EditorStore {
  blocks: Block[];
  selection: BlockSelection;
  readOnly: boolean;
}

export const useEditorStore = create<EditorStore>((set) => ({
  blocks: [],
  selection: {
    id: null,
    focusOffset: 0,
    anchorOffset: 0,
    isCollapsed: true,
  },
  readOnly: false,
})); 