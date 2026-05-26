import { useEffect, useCallback, useRef } from 'react'
import Editor from './components/Editor'
import Sidebar from './components/Sidebar'
import CommandPalette from './components/CommandPalette'
import useStore from './store/useStore'
import { loadDocuments, createDocument, saveDocument } from './lib/fs'
import { exportToMarkdown, exportToPDF } from './lib/export'

function App() {
  const setDocuments = useStore((s) => s.setDocuments)
  const addDocument = useStore((s) => s.addDocument)
  const activeDocPath = useStore((s) => s.activeDocPath)
  const setActiveDoc = useStore((s) => s.setActiveDoc)
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const togglePalette = useStore((s) => s.togglePalette)
  const toggleFocusMode = useStore((s) => s.toggleFocusMode)
  const toggleTypewriterMode = useStore((s) => s.toggleTypewriterMode)
  const setSidebarOpen = useStore((s) => s.setSidebarOpen)
  const setPaletteOpen = useStore((s) => s.setPaletteOpen)
  const setSaveStatus = useStore((s) => s.setSaveStatus)
  const saveStatus = useStore((s) => s.saveStatus)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialize: load documents on mount
  useEffect(() => {
    const init = async () => {
      let docs = await loadDocuments()
      if (docs.length === 0) {
        const doc = await createDocument()
        docs = [doc]
        addDocument(doc)
      }
      setDocuments(docs)
      if (!activeDocPath) {
        setActiveDoc(docs[0].path)
      }
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Perform immediate save (bypass debounce)
  const immediateSave = useCallback(async () => {
    const editor = useStore.getState().editorInstance
    const path = useStore.getState().activeDocPath
    if (!editor || !path) return

    setSaveStatus('saving')
    try {
      const json = editor.getJSON()
      await saveDocument(path, json)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('idle')
    }
  }, [setSaveStatus])

  const handleExportMarkdown = useCallback(async () => {
    const editor = useStore.getState().editorInstance
    if (!editor) return
    await exportToMarkdown(editor.getHTML())
  }, [])

  // Disable default right-click context menu
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault()
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
      } else if (mod && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        toggleFocusMode()
      } else if (mod && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        toggleTypewriterMode()
      } else if (e.key === 'Escape') {
        setSidebarOpen(false)
        setPaletteOpen(false)
      }
    },
    [toggleSidebar, togglePalette, toggleFocusMode, toggleTypewriterMode, setSidebarOpen, setPaletteOpen, immediateSave, handleExportMarkdown],
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

  const statusText =
    saveStatus === 'saving'
      ? 'Saving...'
      : saveStatus === 'saved'
        ? 'Saved'
        : ''

  return (
    <main className="min-h-screen bg-paper dark:bg-slate-dark transition-colors duration-300 flex flex-col">
      <div
        data-tauri-drag-region
        className="h-8 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50"
      >
        <span className="font-sans text-xs text-ink/40 dark:text-bone/40 font-medium tracking-wider select-none">
          ZENITH
        </span>
        <span className="font-sans text-xs text-ink/30 dark:text-bone/30 select-none">
          {statusText}
        </span>
      </div>

      <Sidebar />
      <CommandPalette />

      <div className="pt-20 pb-12 px-6 flex-1 overflow-y-auto">
        <div className="max-w-[680px] mx-auto pb-32 print-area">
          <Editor />
        </div>
      </div>
    </main>
  )
}

export default App
