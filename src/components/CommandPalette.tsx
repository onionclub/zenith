import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Command } from 'cmdk'
import { FileText, Plus, Eye, ArrowDownToLine, FileDown, Printer } from 'lucide-react'
import useStore from '../store/useStore'
import { createDocument } from '../lib/fs'
import { exportToMarkdown, exportToPDF } from '../lib/export'

function CommandPalette() {
  const documents = useStore((s) => s.documents)
  const isPaletteOpen = useStore((s) => s.isPaletteOpen)
  const isFocusMode = useStore((s) => s.isFocusMode)
  const isTypewriterMode = useStore((s) => s.isTypewriterMode)
  const setActiveDoc = useStore((s) => s.setActiveDoc)
  const setPaletteOpen = useStore((s) => s.setPaletteOpen)
  const toggleFocusMode = useStore((s) => s.toggleFocusMode)
  const toggleTypewriterMode = useStore((s) => s.toggleTypewriterMode)
  const addDocument = useStore((s) => s.addDocument)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPaletteOpen(false)
    }
    if (isPaletteOpen) {
      document.addEventListener('keydown', handler)
      return () => document.removeEventListener('keydown', handler)
    }
  }, [isPaletteOpen, setPaletteOpen])

  const handleSelect = async (value: string) => {
    if (value === 'new') {
      const doc = await createDocument()
      addDocument(doc)
      setActiveDoc(doc.path)
    } else if (value === 'toggle-focus') {
      toggleFocusMode()
    } else if (value === 'toggle-typewriter') {
      toggleTypewriterMode()
    } else if (value === 'export-markdown') {
      const editor = useStore.getState().editorInstance
      if (editor) await exportToMarkdown(editor.getHTML())
    } else if (value === 'export-pdf') {
      exportToPDF()
    } else {
      setActiveDoc(value)
    }
    setPaletteOpen(false)
  }

  return (
    <AnimatePresence>
      {isPaletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          onClick={() => setPaletteOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-[500px] max-w-[90vw]"
          >
            <Command className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl">
              <Command.Input
                placeholder="Search documents or create new..."
                className="w-full px-4 py-3 bg-transparent border-b border-slate-200 dark:border-slate-700 font-sans text-sm text-ink dark:text-bone placeholder:text-ink/30 dark:placeholder:text-bone/30 outline-none"
              />
              <Command.List className="max-h-64 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center font-sans text-sm text-ink/40 dark:text-bone/40">
                  No results found.
                </Command.Empty>
                {documents.map((doc) => (
                  <Command.Item
                    key={doc.id}
                    value={doc.path}
                    onSelect={() => handleSelect(doc.path)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm text-ink dark:text-bone cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800"
                  >
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="flex-1 truncate">{doc.title}</span>
                  </Command.Item>
                ))}
                <Command.Item
                  key="new"
                  value="new"
                  onSelect={() => handleSelect('new')}
                  className="flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm text-ink dark:text-bone cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-1 pt-2"
                >
                  <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Create New Document</span>
                </Command.Item>
                <Command.Item
                  key="toggle-focus"
                  value="toggle-focus"
                  onSelect={() => handleSelect('toggle-focus')}
                  className="flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm text-ink dark:text-bone cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800"
                >
                  <Eye className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{isFocusMode ? 'Disable' : 'Enable'} Focus Mode</span>
                </Command.Item>
                <Command.Item
                  key="toggle-typewriter"
                  value="toggle-typewriter"
                  onSelect={() => handleSelect('toggle-typewriter')}
                  className="flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm text-ink dark:text-bone cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800"
                >
                  <ArrowDownToLine className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{isTypewriterMode ? 'Disable' : 'Enable'} Typewriter Mode</span>
                </Command.Item>
                <Command.Item
                  key="export-markdown"
                  value="export-markdown"
                  onSelect={() => handleSelect('export-markdown')}
                  className="flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm text-ink dark:text-bone cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-1 pt-2"
                >
                  <FileDown className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Export to Markdown</span>
                </Command.Item>
                <Command.Item
                  key="export-pdf"
                  value="export-pdf"
                  onSelect={() => handleSelect('export-pdf')}
                  className="flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm text-ink dark:text-bone cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800"
                >
                  <Printer className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Export to PDF / Print</span>
                </Command.Item>
              </Command.List>
            </Command>
          </motion.div>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CommandPalette
