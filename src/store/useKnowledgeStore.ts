import { create } from 'zustand';
import { KnowledgeItem, Collection, Tag } from '../types/schemas';

interface KnowledgeState {
  items: KnowledgeItem[];
  collections: Collection[];
  tags: Tag[];
  itemTags: { itemId: string; tagId: string }[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setItems: (items: KnowledgeItem[]) => void;
  setCollections: (collections: Collection[]) => void;
  setTags: (tags: Tag[]) => void;
  setItemTags: (itemTags: { itemId: string; tagId: string }[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Helpers
  addItem: (item: KnowledgeItem) => void;
  updateItem: (id: string, updates: Partial<KnowledgeItem>) => void;
  removeItem: (id: string) => void;
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  items: [],
  collections: [],
  tags: [],
  itemTags: [],
  isLoading: false,
  error: null,
  
  setItems: (items) => set({ items }),
  setCollections: (collections) => set({ collections }),
  setTags: (tags) => set({ tags }),
  setItemTags: (itemTags) => set({ itemTags }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map(item => item.id === id ? { ...item, ...updates } : item)
  })),
  removeItem: (id) => set((state) => ({ 
    items: state.items.filter(item => item.id !== id) 
  })),
}));
