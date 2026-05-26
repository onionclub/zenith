import { create } from 'zustand'
import type { Editor } from '@tiptap/core'

export interface Document {
  id: string
  title: string
  path: string
  updatedAt: number
}

interface StoreState {
  documents: Document[]
  activeDocPath: string | null
  isSidebarOpen: boolean
  isPaletteOpen: boolean
  isFocusMode: boolean
  isTypewriterMode: boolean
  saveStatus: 'idle' | 'saving' | 'saved'
  editorInstance: Editor | null
  setDocuments: (docs: Document[]) => void
  addDocument: (doc: Document) => void
  setActiveDoc: (path: string) => void
  toggleSidebar: () => void
  togglePalette: () => void
  toggleFocusMode: () => void
  toggleTypewriterMode: () => void
  setSidebarOpen: (open: boolean) => void
  setPaletteOpen: (open: boolean) => void
  setSaveStatus: (status: 'idle' | 'saving' | 'saved') => void
  setEditorInstance: (editor: Editor | null) => void
}

const useStore = create<StoreState>((set) => ({
  documents: [],
  activeDocPath: null,
  isSidebarOpen: false,
  isPaletteOpen: false,
  isFocusMode: false,
  isTypewriterMode: false,
  saveStatus: 'idle',
  editorInstance: null,
  setDocuments: (documents) => set({ documents }),
  addDocument: (doc) =>
    set((state) => ({ documents: [...state.documents, doc] })),
  setActiveDoc: (path) => set({ activeDocPath: path }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  togglePalette: () =>
    set((state) => ({ isPaletteOpen: !state.isPaletteOpen })),
  toggleFocusMode: () =>
    set((state) => ({ isFocusMode: !state.isFocusMode })),
  toggleTypewriterMode: () =>
    set((state) => ({ isTypewriterMode: !state.isTypewriterMode })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setPaletteOpen: (open) => set({ isPaletteOpen: open }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setEditorInstance: (editorInstance) => set({ editorInstance }),
}))

export default useStore
