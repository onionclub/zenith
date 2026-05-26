import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Editor } from '@tiptap/core'

interface StatusBarProps {
  editor: Editor | null
}

function StatusBar({ editor }: StatusBarProps) {
  const [isIdle, setIsIdle] = useState(true)
  const [wordCount, setWordCount] = useState(0)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => setIsIdle(true), 2000)
  }, [])

  useEffect(() => {
    if (!editor) return

    const updateCounts = () => {
      const words = editor.storage.characterCount?.words?.() ?? 0
      setWordCount(words)
    }

    editor.on('update', () => {
      updateCounts()
      resetIdleTimer()
    })
    editor.on('selectionUpdate', () => {
      updateCounts()
      resetIdleTimer()
    })

    updateCounts()

    return () => {
      editor.off('update', () => {})
      editor.off('selectionUpdate', () => {})
    }
  }, [editor, resetIdleTimer])

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  const readingTime = Math.ceil(wordCount / 200)

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 pb-6 z-40 pointer-events-none">
      <AnimatePresence>
        {isIdle && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-xs font-sans text-ink/60 dark:text-bone/60 shadow-sm"
          >
            {wordCount.toLocaleString()} words &middot; {readingTime} min read
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StatusBar
