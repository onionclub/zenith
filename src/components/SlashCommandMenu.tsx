import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  CheckSquare,
  Code2,
  Quote,
  Table,
  ImageIcon,
} from 'lucide-react'

interface SlashCommandMenuProps {
  items: { title: string; description: string; icon: string; command: () => void }[]
  command: (item: { title: string; description: string; icon: string; command: () => void }) => void
  editor: any
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'heading-1': Heading1,
  'heading-2': Heading2,
  'heading-3': Heading3,
  'bullet-list': List,
  'task-list': CheckSquare,
  'code-block': Code2,
  blockquote: Quote,
  table: Table,
  image: ImageIcon,
}

function SlashCommandMenu({ items, command }: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev >= items.length - 1 ? 0 : prev + 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (items[selectedIndex]) {
          command(items[selectedIndex])
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [items, selectedIndex, command])

  if (items.length === 0) return null

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 4 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-1.5 w-64"
    >
      {items.map((item, index) => {
        const Icon = iconMap[item.icon]
        const isSelected = index === selectedIndex

        return (
          <button
            key={item.title}
            type="button"
            onClick={() => command(item)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors duration-75 ${
              isSelected
                ? 'bg-slate-100 dark:bg-slate-800'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            {Icon && (
              <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {item.title}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {item.description}
              </span>
            </div>
          </button>
        )
      })}
    </motion.div>
  )
}

export default SlashCommandMenu
