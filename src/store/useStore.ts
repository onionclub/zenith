import { create } from 'zustand'
import type { Editor } from '@tiptap/core'

export interface Document {
  id: string
  title: string
  path: string
  updatedAt: number
  group: string
  tags: string[]
}

interface StoreState {
  documents: Document[]
  activeDocPath: string | null
  isSidebarOpen: boolean
  isPaletteOpen: boolean
  isSettingsOpen: boolean
  isFocusMode: boolean
  isTypewriterMode: boolean
  uiScale: number
  editorFontSize: string
  tier: 'void' | 'silence' | 'obsidian' | 'onyx' | 'zenith' | 'thevoid'
  companionChoice: 'cat' | 'dog'
  patronageStartDate: string | null
  companionSize: number
  pageWidth: number
  preferredVoice: string
  saveStatus: 'idle' | 'saving' | 'saved'
  editorInstance: Editor | null
  setDocuments: (docs: Document[]) => void
  addDocument: (doc: Document) => void
  removeDocument: (id: string) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  reorderDocuments: (docs: Document[]) => void
  setActiveDoc: (path: string) => void
  toggleSidebar: () => void
  togglePalette: () => void
  toggleFocusMode: () => void
  toggleTypewriterMode: () => void
  toggleSettings: () => void
  setSettingsOpen: (open: boolean) => void
  setUiScale: (scale: number) => void
  setEditorFontSize: (size: string) => void
  setTier: (tier: StoreState['tier'], choice?: 'cat' | 'dog', startDate?: string) => void
  setCompanionSize: (size: number) => void
  setPageWidth: (width: number) => void
  setPreferredVoice: (voice: string) => void
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
  isSettingsOpen: false,
  uiScale: 1,
  editorFontSize: '18px',
  tier: 'silence',
  companionChoice: 'cat',
  patronageStartDate: null,
  companionSize: 80,
  pageWidth: 680,
  preferredVoice: 'auto',
  saveStatus: 'idle',
  editorInstance: null,
  setDocuments: (documents) => set({ documents }),
  addDocument: (doc) =>
    set((state) => ({ documents: [...state.documents, doc] })),
  removeDocument: (id) =>
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),
  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
  reorderDocuments: (documents) => set({ documents }),
  setActiveDoc: (path) => set({ activeDocPath: path }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  togglePalette: () =>
    set((state) => ({ isPaletteOpen: !state.isPaletteOpen })),
  toggleFocusMode: () =>
    set((state) => ({ isFocusMode: !state.isFocusMode })),
  toggleTypewriterMode: () =>
    set((state) => ({ isTypewriterMode: !state.isTypewriterMode })),
  toggleSettings: () =>
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setUiScale: (uiScale) => set({ uiScale }),
  setEditorFontSize: (editorFontSize) => set({ editorFontSize }),
  setTier: (tier, companionChoice, patronageStartDate) => set({ tier, companionChoice, patronageStartDate }),
  setCompanionSize: (companionSize) => set({ companionSize }),
  setPageWidth: (pageWidth) => set({ pageWidth }),
  setPreferredVoice: (preferredVoice) => set({ preferredVoice }),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setPaletteOpen: (open) => set({ isPaletteOpen: open }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setEditorInstance: (editorInstance) => set({ editorInstance }),
}))

export default useStore
