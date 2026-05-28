import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, PanelLeftClose, Trash2, FolderPlus, Tag, X, Folder, FolderOpen, FileText, Undo2, Settings } from 'lucide-react'
import useStore from '../store/useStore'
import { createDocument, deleteDocument, saveDocument } from '../lib/fs'

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
  const uiScale = useStore((s) => s.uiScale)
  const isSidebarOpen = useStore((s) => s.isSidebarOpen)
  const setActiveDoc = useStore((s) => s.setActiveDoc)
  const setSidebarOpen = useStore((s) => s.setSidebarOpen)
  const addDocument = useStore((s) => s.addDocument)
  const removeDocument = useStore((s) => s.removeDocument)
  const updateDocument = useStore((s) => s.updateDocument)

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; docId: string } | null>(null)
  const [undoData, setUndoData] = useState<{ doc: ReturnType<typeof useStore.getState>['documents'][0]; json: Record<string, unknown> } | null>(null)
  const undoTimer = useRef<number>(0)

  // Clean up undo timer
  useEffect(() => { return () => { if (undoTimer.current) clearTimeout(undoTimer.current) } }, [])

  // Dismiss context menu on any click outside
  useEffect(() => {
    if (!ctxMenu) return
    const h = () => setCtxMenu(null)
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [ctxMenu])

  const groups = [...new Set(documents.map((d) => d.group).filter(Boolean))]
  const ungrouped = documents.filter((d) => !d.group)

  const toggleGroup = (g: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(g)) next.delete(g); else next.add(g)
      return next
    })
  }

  const handleNewDoc = async (group?: string) => {
    const doc = await createDocument()
    if (group) doc.group = group
    addDocument(doc)
    setActiveDoc(doc.path)
  }

  const handleDelete = async (id: string, path: string, saveUndo: boolean) => {
    const doc = documents.find((d) => d.id === id)
    if (!doc) return

    if (activeDocPath === path) {
      const other = documents.find((d) => d.id !== id)
      setActiveDoc(other?.path || '')
    }

    // Save undo data before deleting
    if (saveUndo) {
      try {
        const { readTextFile } = await import('@tauri-apps/plugin-fs')
        const { BaseDirectory } = await import('@tauri-apps/plugin-fs')
        const raw = await readTextFile(path, { baseDir: BaseDirectory.AppData })
        setUndoData({ doc: { ...doc }, json: JSON.parse(raw) })
        if (undoTimer.current) clearTimeout(undoTimer.current)
        undoTimer.current = window.setTimeout(() => setUndoData(null), 5000)
      } catch { /* ok */ }
    }

    try { await deleteDocument(path) } catch { /* may not exist */ }
    removeDocument(id)
  }

  const handleUndo = async () => {
    if (!undoData) return
    const { doc, json } = undoData
    await saveDocument(doc.path, json)
    addDocument({ ...doc, updatedAt: Date.now() })
    setUndoData(null)
    if (undoTimer.current) clearTimeout(undoTimer.current)
  }

  const handleAddTag = (id: string) => {
    if (!tagInput.trim()) { setEditingTag(null); return }
    const doc = documents.find((d) => d.id === id)
    if (doc && !doc.tags.includes(tagInput.trim())) {
      updateDocument(id, { tags: [...doc.tags, tagInput.trim()] })
    }
    setTagInput('')
    setEditingTag(null)
  }

  const handleRemoveTag = (id: string, tag: string) => {
    const doc = documents.find((d) => d.id === id)
    if (doc) updateDocument(id, { tags: doc.tags.filter((t) => t !== tag) })
  }

  const handleCreateGroup = () => {
    if (!groupName.trim()) { setCreatingGroup(false); return }
    handleNewDoc(groupName.trim())
    setGroupName('')
    setCreatingGroup(false)
  }

  const handleContextMenu = (e: React.MouseEvent, docId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setCtxMenu({ x: e.clientX, y: e.clientY, docId })
  }

  const handleMoveToGroup = (docId: string, group: string) => {
    updateDocument(docId, { group: group === '__remove' ? '' : group })
    setCtxMenu(null)
  }

  const handleCtxDelete = (docId: string) => {
    const doc = documents.find((d) => d.id === docId)
    if (doc) handleDelete(doc.id, doc.path, true)
    setCtxMenu(null)
  }

  const renderDocItem = (doc: (typeof documents)[0]) => {
    const isActive = doc.path === activeDocPath
    return (
      <div
        key={doc.id}
        onContextMenu={(e) => handleContextMenu(e, doc.id)}
        className={`group flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors cursor-pointer ${isActive ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
        onClick={() => setActiveDoc(doc.path)}
      >
        <FileText className="w-3.5 h-3.5 text-ink/25 dark:text-bone/25 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-sans text-xs font-medium text-ink dark:text-bone truncate">{doc.title || 'Untitled'}</div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="font-sans text-[10px] text-ink/30 dark:text-bone/30">{timeAgo(doc.updatedAt)}</span>
          </div>
          {doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {doc.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-0.5 text-[9px] px-1 py-px rounded bg-ink/5 dark:bg-bone/5 text-ink/40 dark:text-bone/40">
                  {tag}
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveTag(doc.id, tag) }} className="hover:text-ink dark:hover:text-bone"><X className="w-2 h-2" /></button>
                </span>
              ))}
            </div>
          )}
          {editingTag === doc.id && (
            <div className="flex gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
              <input autoFocus value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(doc.id); if (e.key === 'Escape') setEditingTag(null) }} placeholder="tag" className="w-20 px-1 py-0 text-[10px] font-sans border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-ink dark:text-bone outline-none" />
            </div>
          )}
        </div>
        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); setEditingTag(doc.id); setTagInput('') }} className="p-0.5 rounded text-ink/25 dark:text-bone/25 hover:text-ink dark:hover:text-bone" title="Add tag"><Tag className="w-3 h-3" /></button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(doc.id, doc.path, true) }} className="p-0.5 rounded text-ink/25 dark:text-bone/25 hover:text-red-500" title="Delete"><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/10"
            onClick={() => setSidebarOpen(false)}
          />

          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed left-0 top-0 bottom-0 w-[280px] z-50 bg-paper dark:bg-slate-dark border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col"
            style={{ zoom: uiScale }}
          >
            <div className="h-8 flex items-center justify-between px-2 border-b border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-0.5">
                <button onClick={() => handleNewDoc()} className="p-1 rounded text-slate-500 hover:text-ink dark:hover:text-bone hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="New doc"><Plus className="w-3.5 h-3.5" /></button>
                <button onClick={() => setCreatingGroup(true)} className="p-1 rounded text-slate-500 hover:text-ink dark:hover:text-bone hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="New folder"><FolderPlus className="w-3.5 h-3.5" /></button>
              </div>
              <span className="font-sans text-[10px] text-ink/30 dark:text-bone/30 font-medium tracking-wider select-none">DOCUMENTS</span>
              <button onClick={() => { setSidebarOpen(false); useStore.getState().setSettingsOpen(true) }} className="p-1 rounded text-slate-500 hover:text-ink dark:hover:text-bone hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Settings"><Settings className="w-3.5 h-3.5" /></button>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded text-slate-500 hover:text-ink dark:hover:text-bone hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Close"><PanelLeftClose className="w-3.5 h-3.5" /></button>
            </div>

            {creatingGroup && (
              <div className="flex gap-1 px-2 py-1.5 border-b border-slate-200/30 dark:border-slate-800/30">
                <input autoFocus value={groupName} onChange={(e) => setGroupName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleCreateGroup(); if (e.key === 'Escape') setCreatingGroup(false) }} placeholder="Folder name" className="flex-1 px-2 py-0.5 text-xs font-sans border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-ink dark:text-bone outline-none" />
                <button onClick={handleCreateGroup} className="text-xs text-ink/50 dark:text-bone/50 hover:text-ink dark:hover:text-bone">Create</button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-2 py-1">
              {groups.map((group) => {
                const groupDocs = documents.filter((d) => d.group === group)
                const isExpanded = expandedGroups.has(group)
                return (
                  <div key={group} className="mb-0.5">
                    <button onClick={() => toggleGroup(group)} className="flex items-center gap-1.5 w-full px-2 py-1 rounded-md text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      {isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-ink/40 dark:text-bone/40" /> : <Folder className="w-3.5 h-3.5 text-ink/40 dark:text-bone/40" />}
                      <span className="font-sans text-xs font-medium text-ink/60 dark:text-bone/60">{group}</span>
                      <span className="font-sans text-[10px] text-ink/25 dark:text-bone/25 ml-auto">{groupDocs.length}</span>
                    </button>
                    {isExpanded && (
                      <div className="ml-3 border-l border-slate-200/40 dark:border-slate-800/40 pl-2">
                        {groupDocs.map(renderDocItem)}
                      </div>
                    )}
                  </div>
                )
              })}
              {ungrouped.map(renderDocItem)}
              {documents.length === 0 && !undoData && (
                <div className="text-center py-8 font-sans text-xs text-ink/20 dark:text-bone/20">No documents yet</div>
              )}
            </div>

            {/* Right-click context menu */}
            {ctxMenu && (
              <div className="fixed inset-0 z-[60]" onClick={() => setCtxMenu(null)} onContextMenu={(e) => { e.preventDefault(); setCtxMenu(null) }}>
                <div className="absolute bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-1 min-w-[140px]" style={{ left: Math.min(ctxMenu.x, window.innerWidth - 160), top: Math.min(ctxMenu.y, window.innerHeight - 220) }}>
                  <div className="text-[10px] font-sans text-ink/30 dark:text-bone/30 px-2 py-1">Move to group</div>
                  {groups.map((g) => (
                    <button key={g} onClick={() => handleMoveToGroup(ctxMenu.docId, g)} className="block w-full text-left px-2 py-1 rounded text-[11px] font-sans text-ink dark:text-bone hover:bg-slate-100 dark:hover:bg-slate-800">{g}</button>
                  ))}
                  <button onClick={() => handleMoveToGroup(ctxMenu.docId, '__remove')} className="block w-full text-left px-2 py-1 rounded text-[11px] font-sans text-ink/40 dark:text-bone/40 hover:bg-slate-100 dark:hover:bg-slate-800">No group</button>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
                  <button onClick={() => handleCtxDelete(ctxMenu.docId)} className="block w-full text-left px-2 py-1 rounded text-[11px] font-sans text-red-500 hover:bg-red-50 dark:hover:bg-red-950">Delete</button>
                </div>
              </div>
            )}

            {/* Undo toast */}
            <AnimatePresence>
              {undoData && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg shadow-lg border border-slate-700"
                >
                  <span className="flex-1 text-xs font-sans truncate">
                    Deleted &quot;{undoData.doc.title}&quot;
                  </span>
                  <button onClick={handleUndo} className="flex items-center gap-1 px-2 py-1 text-xs font-sans rounded bg-white/10 hover:bg-white/20 transition-colors text-white shrink-0">
                    <Undo2 className="w-3 h-3" /> Undo
                  </button>
                  <button onClick={() => setUndoData(null)} className="text-white/40 hover:text-white/70 transition-colors shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default Sidebar
