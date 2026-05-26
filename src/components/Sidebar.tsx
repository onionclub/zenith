import { motion, AnimatePresence } from 'framer-motion'
import { Plus, PanelLeftClose } from 'lucide-react'
import useStore from '../store/useStore'
import { createDocument } from '../lib/fs'

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function Sidebar() {
  const documents = useStore((s) => s.documents)
  const activeDocPath = useStore((s) => s.activeDocPath)
  const isSidebarOpen = useStore((s) => s.isSidebarOpen)
  const setActiveDoc = useStore((s) => s.setActiveDoc)
  const setSidebarOpen = useStore((s) => s.setSidebarOpen)
  const addDocument = useStore((s) => s.addDocument)

  const handleNewDoc = async () => {
    const doc = await createDocument()
    addDocument(doc)
    setActiveDoc(doc.path)
  }

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/10"
            onClick={() => setSidebarOpen(false)}
          />

          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed left-0 top-0 bottom-0 w-[280px] z-50 bg-paper dark:bg-slate-dark border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col"
          >
            <div className="h-8 flex items-center justify-between px-3 border-b border-slate-200/50 dark:border-slate-800/50">
              <button
                type="button"
                onClick={handleNewDoc}
                className="p-1 rounded-md text-slate-500 hover:text-ink dark:hover:text-bone hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="New document"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="font-sans text-xs text-ink/40 dark:text-bone/40 font-medium tracking-wider select-none">
                DOCUMENTS
              </span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-slate-500 hover:text-ink dark:hover:text-bone hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2">
              {documents.map((doc) => {
                const isActive = doc.path === activeDocPath
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setActiveDoc(doc.path)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-75 mb-0.5 ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-sans text-sm font-medium text-ink dark:text-bone truncate">
                      {doc.title}
                    </div>
                    <div className="font-sans text-xs text-ink/40 dark:text-bone/40 mt-0.5">
                      {timeAgo(doc.updatedAt)}
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default Sidebar
