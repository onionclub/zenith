import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart } from 'lucide-react'
import useStore from '../store/useStore'

const TIERS = [
  {
    id: 'void' as const, name: 'Void', price: 'Free', emoji: '○',
    copy: 'The app is yours. Use it as long as you need.',
    thanks: 'Thank you for writing.',
  },
  {
    id: 'silence' as const, name: 'Silence', price: '$3', emoji: '~',
    copy: 'A cute cat, or dog. It\'s your choice.',
    thanks: 'Thank you for the silence.',
  },
  {
    id: 'obsidian' as const, name: 'Obsidian', price: '$5', emoji: '◇',
    copy: 'A bonsai tree. Leaves sway. It\'s peaceful.',
    thanks: 'Thank you for the stillness.',
  },
  {
    id: 'onyx' as const, name: 'Onyx', price: '$8', emoji: '◆',
    copy: 'An hourglass. Sand flows. It\'s mesmerizing.',
    thanks: 'Thank you for the patience.',
  },
  {
    id: 'zenith' as const, name: 'Zenith', price: '$12', emoji: '✧',
    copy: 'Your personal constellation. It grows with you.',
    thanks: 'Thank you for reaching higher.',
  },
  {
    id: 'thevoid' as const, name: 'THE VOID', price: '$25', emoji: '▣',
    copy: 'A nice journal. A cute plush. A monolith.',
    thanks: 'Thank you. Truly.',
  },
]

function TierModal() {
  const tier = useStore((s) => s.tier)
  const companionChoice = useStore((s) => s.companionChoice)
  const setTier = useStore((s) => s.setTier)
  const isPaletteOpen = useStore((s) => s.isPaletteOpen)
  const setPaletteOpen = useStore((s) => s.setPaletteOpen)

  // Show tier modal when user searches "tier" in palette
  const handleSelect = (id: 'void' | 'silence' | 'obsidian' | 'onyx' | 'zenith' | 'thevoid') => {
    if (id === 'silence') {
      setTier('silence', companionChoice, new Date().toISOString())
    } else {
      setTier(id, companionChoice, id === 'zenith' ? new Date().toISOString() : undefined)
    }
  }

  if (!isPaletteOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        onClick={() => setPaletteOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-[480px] max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-sans text-sm font-medium text-ink dark:text-bone">Companion Tiers</h2>
            <button onClick={() => setPaletteOpen(false)} className="p-1 rounded text-ink/40 dark:text-bone/40 hover:text-ink dark:hover:text-bone hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 py-4 max-h-[65vh] overflow-y-auto space-y-2">
            {TIERS.map((t) => {
              const active = tier === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    active
                      ? 'border-ink dark:border-bone bg-slate-50 dark:bg-slate-800'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-lg text-ink dark:text-bone">{t.emoji}</span>
                      <span className="font-sans text-sm font-medium text-ink dark:text-bone">{t.name}</span>
                    </div>
                    <span className="font-sans text-xs font-medium text-ink/50 dark:text-bone/50">{t.price}</span>
                  </div>
                  <p className="font-sans text-xs text-ink/50 dark:text-bone/50 mb-1">{t.copy}</p>
                  <p className="font-sans text-[10px] text-ink/25 dark:text-bone/25 italic">{t.thanks}</p>

                  {/* Cat/Dog toggle for Silence tier */}
                  {t.id === 'silence' && active && (
                    <div className="flex gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button onClick={(e) => { e.stopPropagation(); setTier('silence', 'cat') }} className={`px-3 py-1 rounded text-xs font-sans transition-colors ${companionChoice === 'cat' ? 'bg-ink dark:bg-bone text-paper dark:text-slate-dark' : 'bg-slate-100 dark:bg-slate-800 text-ink/50 dark:text-bone/50'}`}>Cat</button>
                      <button onClick={(e) => { e.stopPropagation(); setTier('silence', 'dog') }} className={`px-3 py-1 rounded text-xs font-sans transition-colors ${companionChoice === 'dog' ? 'bg-ink dark:bg-bone text-paper dark:text-slate-dark' : 'bg-slate-100 dark:bg-slate-800 text-ink/50 dark:text-bone/50'}`}>Dog</button>
                    </div>
                  )}

                  {active && <div className="mt-2 flex items-center gap-1 text-[10px] font-sans text-ink/30 dark:text-bone/30"><Heart className="w-3 h-3 fill-current" /> Active companion</div>}
                </button>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export { TIERS }
export default TierModal
