import { useEffect, useCallback, useRef, useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import Editor from './components/Editor'
import { ErrorBoundary } from './components/ErrorBoundary'
import FormattingToolbar from './components/FormattingToolbar'
import SettingsPanel from './components/SettingsPanel'
import Companion from './components/Companion'
import Sidebar from './components/Sidebar'
import CommandPalette from './components/CommandPalette'
import useStore from './store/useStore'
import { loadDocuments, createDocument, saveDocument, renameDocument, generateUniqueTitle } from './lib/fs'
import { exportToMarkdown, exportToPDF } from './lib/export'

function App() {
  const documents = useStore((s) => s.documents)
  const setDocuments = useStore((s) => s.setDocuments)
  const addDocument = useStore((s) => s.addDocument)
  const updateDocument = useStore((s) => s.updateDocument)
  const activeDocPath = useStore((s) => s.activeDocPath)
  const setActiveDoc = useStore((s) => s.setActiveDoc)
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const togglePalette = useStore((s) => s.togglePalette)
  const toggleFocusMode = useStore((s) => s.toggleFocusMode)
  const toggleTypewriterMode = useStore((s) => s.toggleTypewriterMode)
  const toggleSettings = useStore((s) => s.toggleSettings)
  const setSidebarOpen = useStore((s) => s.setSidebarOpen)
  const setPaletteOpen = useStore((s) => s.setPaletteOpen)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)
  const setSaveStatus = useStore((s) => s.setSaveStatus)
  const saveStatus = useStore((s) => s.saveStatus)
  const editorInstance = useStore((s) => s.editorInstance)
  const pageWidth = useStore((s) => s.pageWidth)
  const setPageWidth = useStore((s) => s.setPageWidth)
  const uiScale = useStore((s) => s.uiScale)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [dragEdge, setDragEdge] = useState<'left'|'right'|null>(null)
  const [editingTitlebar, setEditingTitlebar] = useState(false)
  const [titleInput, setTitleInput] = useState('')
  const titlebarInputRef = useRef<HTMLInputElement>(null)
  const editingPathRef = useRef<string | null>(null)

  // Focus titlebar input when entering edit mode
  useEffect(() => {
    if (editingTitlebar && titlebarInputRef.current) {
      titlebarInputRef.current.focus()
      titlebarInputRef.current.select()
    }
  }, [editingTitlebar])

  // Re-clamp page width when window resizes (prevents handles from going off-screen)
  useEffect(() => {
    const onResize = () => {
      const maxW = Math.min(window.innerWidth - 60, window.innerWidth * 0.92)
      if (pageWidth > maxW) setPageWidth(maxW)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [pageWidth, setPageWidth])

  // Runtime debugging
  useEffect(() => {
    console.log('Zenith: App mounted, store state:', useStore.getState())
    if (typeof window !== 'undefined') (window as any).__ZENITH_STORE__ = useStore
  }, [])

  // Initialize: load documents on mount
  useEffect(() => {
    const init = async () => {
      try {
        let docs = await loadDocuments()
        const hasInitialized = localStorage.getItem('zenith_initialized')
        if (docs.length === 0 && !hasInitialized) {
          const doc = await createDocument()
          docs = [doc]
          addDocument(doc)
          localStorage.setItem('zenith_initialized', '1')
        }
        setDocuments(docs)
        if (!activeDocPath) {
          setActiveDoc(docs[0].path)
        }
      } catch (e) {
        console.error('Zenith init failed:', e)
      }
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Perform immediate save (bypass debounce)
  const immediateSave = useCallback(async () => {
    const state = useStore.getState()
    const editor = state.editorInstance
    const path = state.activeDocPath
    if (!editor || !path) return

    setSaveStatus('saving')
    try {
      const json = editor.getJSON() as Record<string, unknown>
      const doc = state.documents.find(d => d.path === path)
      if (doc) {
        json.title = doc.title
        json.group = doc.group
        json.tags = doc.tags
      }
      await saveDocument(path, json)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('idle')
    }
  }, [setSaveStatus])

  const activeDoc = documents.find(d => d.path === activeDocPath)
  const docTitle = activeDoc?.title || 'Untitled'

  const handleTitlebarRename = async (value: string) => {
    const path = editingPathRef.current
    const trimmed = value.trim()
    if (!trimmed || trimmed.length > 200) {
      setEditingTitlebar(false)
      return
    }
    const doc = documents.find(d => d.path === path)
    if (!doc || trimmed === doc.title) {
      setEditingTitlebar(false)
      return
    }
    const otherTitles = documents.filter(d => d.path !== path).map(d => d.title)
    const resolved = generateUniqueTitle(trimmed, otherTitles)
    try { await renameDocument(doc.path, resolved) } catch { /* ok */ }
    updateDocument(doc.id, { title: resolved })
    setEditingTitlebar(false)
  }

  const handleExportMarkdown = useCallback(async () => {
    const editor = useStore.getState().editorInstance
    if (!editor) return
    await exportToMarkdown(editor.getHTML())
  }, [])

  // Disable right-click only on editor area (not sidebar)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('.tiptap')) e.preventDefault()
    }
    document.addEventListener('contextmenu', handler)
    return () => document.removeEventListener('contextmenu', handler)
  }, [])

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      } else if (mod && e.key === 'k') {
        e.preventDefault()
        togglePalette()
      } else if (mod && e.key === 's') {
        e.preventDefault()
        immediateSave()
      } else if (mod && e.key === 'p') {
        e.preventDefault()
        exportToPDF()
      } else if (mod && e.key === 'e') {
        e.preventDefault()
        handleExportMarkdown()
      } else if (mod && e.key === ',') {
        e.preventDefault()
        toggleSettings()
      } else if (mod && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        toggleFocusMode()
      } else if (mod && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        toggleTypewriterMode()
      } else if (mod && e.key === '0') {
        e.preventDefault()
        useStore.getState().setUiScale(1)
      } else if (e.key === 'Escape') {
        setSidebarOpen(false)
        setPaletteOpen(false)
        setSettingsOpen(false)
      }
    },
    [toggleSidebar, togglePalette, toggleFocusMode, toggleTypewriterMode, toggleSettings, setSidebarOpen, setPaletteOpen, setSettingsOpen, immediateSave, handleExportMarkdown],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Cleanup save timer
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  // Page width drag handles
  const dragState = useRef({ edge: null as 'left'|'right'|null, startX: 0, startW: pageWidth })
  const pageWidthRef = useRef(pageWidth)
  pageWidthRef.current = pageWidth

  const onPageEdgeDown = useCallback((edge: 'left'|'right', e: React.PointerEvent) => {
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragState.current = { edge, startX: e.clientX, startW: pageWidthRef.current }
    setDragEdge(edge)
  }, [])

  const onPageEdgeMove = useCallback((e: React.PointerEvent) => {
    const d = dragState.current
    if (!d.edge) return
    const dx = e.clientX - d.startX
    const delta = d.edge === 'right' ? dx : -dx
    const maxW = Math.min(window.innerWidth - 60, window.innerWidth * 0.92)
    const newW = Math.max(300, Math.min(maxW, d.startW + delta * 2))
    setPageWidth(newW)
  }, [setPageWidth])

  const onPageEdgeUp = useCallback(() => {
    dragState.current.edge = null
    setDragEdge(null)
  }, [])

  const statusText =
    saveStatus === 'saving'
      ? 'Saving...'
      : saveStatus === 'saved'
        ? 'Saved'
        : ''

  const pageStyle = { maxWidth: pageWidth }

  return (
    <main className="min-h-screen bg-paper dark:bg-slate-dark transition-colors duration-300 flex flex-col">
      {/* Titlebar — full-width drag region, three-section flex layout */}
      <div data-tauri-drag-region className="flex items-center px-4 fixed top-0 left-0 right-0 z-50" style={{ height: 32 }}>
        {/* Left: Zenith brand */}
        <span className="font-sans text-xs text-ink/30 dark:text-bone/30 font-medium tracking-wider select-none">
          ZENITH
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Center: Document title (click to rename) */}
        {editingTitlebar ? (
          <input
            ref={titlebarInputRef}
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { handleTitlebarRename(e.currentTarget.value) }
              if (e.key === 'Escape') { e.stopPropagation(); setEditingTitlebar(false) }
            }}
            onBlur={(e) => handleTitlebarRename(e.currentTarget.value)}
            className="text-xs font-sans font-medium text-ink/70 dark:text-bone/70 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0 outline-none max-w-[250px] text-center"
            maxLength={200}
          />
        ) : (
          <button
            className="font-sans text-xs text-ink/25 dark:text-bone/25 cursor-text hover:text-ink/50 dark:hover:text-bone/50 transition-colors max-w-[250px] truncate bg-transparent border-0 outline-none"
            onClick={() => {
              editingPathRef.current = activeDocPath
              setTitleInput(docTitle)
              setEditingTitlebar(true)
            }}
            title="Click to rename"
          >
            {docTitle}
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: Save status + exit */}
        <div className="flex items-center gap-3 justify-end">
          <span className="font-sans text-xs text-ink/30 dark:text-bone/30 select-none">
            {statusText}
          </span>
          <button
            onClick={() => getCurrentWindow().close()}
            className="p-0.5 rounded text-ink/20 dark:text-bone/20 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            title="Exit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <Sidebar />
      <CommandPalette />
      <SettingsPanel />
      <Companion />

      {editorInstance && (
        <div className="fixed top-8 left-0 right-0 z-40 flex justify-center">
          <div className="w-full" style={pageStyle}>
            <FormattingToolbar editor={editorInstance} />
          </div>
        </div>
      )}

      <div className="pb-12 px-6 flex-1 overflow-y-auto" style={{ paddingTop: `${76 + 32 * uiScale}px` }}>
        <div className="mx-auto pb-32 print-area relative" style={pageStyle}>
          {/* Left drag handle — wide clickable area, thin visual bar */}
          <div
            className="absolute top-0 bottom-0 z-30 w-3 -left-3"
            style={{ cursor: 'ew-resize' }}
            onPointerDown={(e) => onPageEdgeDown('left', e)}
            onPointerMove={onPageEdgeMove}
            onPointerUp={onPageEdgeUp}
          >
            <div className={`absolute top-0 bottom-0 right-0 transition-all duration-150 ${
              dragEdge === 'left' ? 'w-1 bg-ink/10 dark:bg-bone/10' : 'w-0.5 bg-ink/4 dark:bg-bone/4 group-hover:bg-ink/7 dark:group-hover:bg-bone/7'
            }`} />
          </div>
          {/* Right drag handle — wide clickable area, thin visual bar */}
          <div
            className="absolute top-0 bottom-0 z-30 w-3 -right-3"
            style={{ cursor: 'ew-resize' }}
            onPointerDown={(e) => onPageEdgeDown('right', e)}
            onPointerMove={onPageEdgeMove}
            onPointerUp={onPageEdgeUp}
          >
            <div className={`absolute top-0 bottom-0 left-0 transition-all duration-150 ${
              dragEdge === 'right' ? 'w-1 bg-ink/10 dark:bg-bone/10' : 'w-0.5 bg-ink/4 dark:bg-bone/4 group-hover:bg-ink/7 dark:group-hover:bg-bone/7'
            }`} />
          </div>
          <div className="px-12">
            <ErrorBoundary>
              <Editor />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
