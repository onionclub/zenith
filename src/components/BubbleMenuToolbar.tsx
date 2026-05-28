import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Highlighter,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Table2,
} from 'lucide-react'
import type { Editor } from '@tiptap/core'

interface BubbleMenuToolbarProps {
  editor: Editor
}

const textButtons = [
  {
    key: 'bold' as const,
    icon: Bold,
    label: 'Bold',
    action: (editor: Editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    key: 'italic' as const,
    icon: Italic,
    label: 'Italic',
    action: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    key: 'strike' as const,
    icon: Strikethrough,
    label: 'Strikethrough',
    action: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
  },
  {
    key: 'code' as const,
    icon: Code,
    label: 'Inline code',
    action: (editor: Editor) => editor.chain().focus().toggleCode().run(),
  },
  {
    key: 'highlight' as const,
    icon: Highlighter,
    label: 'Highlight',
    action: (editor: Editor) => editor.chain().focus().toggleHighlight().run(),
  },
]

const tableButtons = [
  {
    key: 'add-row-before',
    icon: ArrowUp,
    label: 'Add row above',
    action: (editor: Editor) => editor.chain().focus().addRowBefore().run(),
  },
  {
    key: 'add-row-after',
    icon: ArrowDown,
    label: 'Add row below',
    action: (editor: Editor) => editor.chain().focus().addRowAfter().run(),
  },
  {
    key: 'add-col-before',
    icon: ArrowLeft,
    label: 'Add column left',
    action: (editor: Editor) => editor.chain().focus().addColumnBefore().run(),
  },
  {
    key: 'add-col-after',
    icon: ArrowRight,
    label: 'Add column right',
    action: (editor: Editor) => editor.chain().focus().addColumnAfter().run(),
  },
  {
    key: 'delete-row',
    icon: Trash2,
    label: 'Delete row',
    action: (editor: Editor) => editor.chain().focus().deleteRow().run(),
  },
  {
    key: 'delete-col',
    icon: Trash2,
    label: 'Delete column',
    action: (editor: Editor) => editor.chain().focus().deleteColumn().run(),
  },
  {
    key: 'delete-table',
    icon: Table2,
    label: 'Delete table',
    action: (editor: Editor) => editor.chain().focus().deleteTable().run(),
  },
]

function BubbleMenuToolbar({ editor }: BubbleMenuToolbarProps) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const toolbarRef = useRef<HTMLDivElement>(null)

  const isInTable = (() => {
    try { return editor.isActive('table') } catch { return false }
  })()

  const updatePosition = useCallback(() => {
    const { from, to, empty } = editor.state.selection
    if (empty || from === to) {
      setShow(false)
      return
    }

    const start = editor.view.coordsAtPos(from)
    const end = editor.view.coordsAtPos(to)

    const top = start.top - 48
    const left = (start.left + end.right) / 2

    setPosition({ top, left })
    setShow(true)
  }, [editor])

  useEffect(() => {
    editor.on('selectionUpdate', updatePosition)
    editor.on('blur', () => {
      setTimeout(() => setShow(false), 200)
    })
    editor.on('focus', updatePosition)

    return () => {
      editor.off('selectionUpdate', updatePosition)
      editor.off('blur', () => setShow(false))
      editor.off('focus', updatePosition)
    }
  }, [editor, updatePosition])

  const buttons = isInTable ? tableButtons : textButtons

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, scale: 0.9, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 4 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="fixed z-50 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg shadow-xl flex items-center p-1 gap-0.5 border border-slate-700"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {buttons.map(({ key, icon: Icon, label, action }) => {
            const isActive = isInTable ? false : editor.isActive(key)
            return (
              <button
                key={key}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  try { action(editor) } catch (err) { console.error('BubbleMenu action failed:', err) }
                }}
                className={`p-1.5 rounded-md transition-colors duration-75 ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BubbleMenuToolbar
