import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, Type, Monitor, Keyboard, Heart, ChevronDown, Volume2, Download } from 'lucide-react'
import { openUrl } from '@tauri-apps/plugin-opener'
import useStore from '../store/useStore'
import { getAvailableVoices } from '../lib/tts'

function SettingsPanel() {
  const [companionOpen, setCompanionOpen] = useState(false)
  const [voices, setVoices] = useState<ReturnType<typeof getAvailableVoices>>([])
  const isOpen = useStore((s) => s.isSettingsOpen)
  const uiScale = useStore((s) => s.uiScale)
  const setOpen = useStore((s) => s.setSettingsOpen)
  const setUiScale = useStore((s) => s.setUiScale)
  const editorFontSize = useStore((s) => s.editorFontSize)
  const setEditorFontSize = useStore((s) => s.setEditorFontSize)
  const tier = useStore((s) => s.tier)
  const companionChoice = useStore((s) => s.companionChoice)
  const companionSize = useStore((s) => s.companionSize)
  const setCompanionSize = useStore((s) => s.setCompanionSize)
  const setTier = useStore((s) => s.setTier)
  const preferredVoice = useStore((s) => s.preferredVoice)
  const setPreferredVoice = useStore((s) => s.setPreferredVoice)

  // Load available voices when settings opens
  useEffect(() => {
    if (isOpen) {
      const load = () => {
        // Force a fresh call — speechSynthesis.getVoices() may return more after user interaction
        const v = getAvailableVoices()
        if (v.length > 0) setVoices(v)
        // Fallback: try again after a short delay (voices may load async on Windows)
        setTimeout(() => {
          const v2 = getAvailableVoices()
          if (v2.length > voices.length) setVoices(v2)
        }, 500)
      }
      load()
      speechSynthesis.addEventListener('voiceschanged', load)
      return () => speechSynthesis.removeEventListener('voiceschanged', load)
    }
  }, [isOpen])

  const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '22px', '24px', '28px', '36px']

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            style={{ zoom: uiScale, maxWidth: `min(420px, ${80 / uiScale}vw)`, maxHeight: `${80 / uiScale}vh` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="font-sans text-sm font-medium text-ink dark:text-bone">Settings</h2>
              <button onClick={() => setOpen(false)} className="p-1 rounded text-ink/40 dark:text-bone/40 hover:text-ink dark:hover:text-bone hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-6 overflow-y-auto" style={{ maxHeight: `${75 / uiScale}vh` }}>
              {/* Appearance section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="w-4 h-4 text-ink/40 dark:text-bone/40" />
                  <span className="font-sans text-xs font-medium text-ink/60 dark:text-bone/60 uppercase tracking-wider">Appearance</span>
                </div>

                {/* UI Scale */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <label className="font-sans text-sm text-ink dark:text-bone">UI Scale</label>
                      <button
                        onClick={() => setUiScale(1)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-ink/40 dark:text-bone/40 hover:text-ink dark:hover:text-bone hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-sans"
                        title="Reset scale to 1x (Ctrl+0)"
                      >
                        Reset
                      </button>
                    </div>
                    <span className="font-sans text-xs text-ink/40 dark:text-bone/40 tabular-nums">{uiScale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1" max="5" step="0.05"
                    value={uiScale}
                    onChange={(e) => setUiScale(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-slate-200 dark:bg-slate-700 accent-ink dark:accent-bone cursor-pointer"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="font-sans text-[10px] text-ink/25 dark:text-bone/25">0.10x</span>
                    <span className="font-sans text-[10px] text-ink/25 dark:text-bone/25">5.00x</span>
                  </div>
                </div>

                {/* Editor Font Size */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-sans text-sm text-ink dark:text-bone">Default Font Size</label>
                    <span className="font-sans text-xs text-ink/40 dark:text-bone/40">{editorFontSize}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {FONT_SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setEditorFontSize(s)}
                        className={`px-2.5 py-1 rounded text-xs font-sans transition-colors ${
                          editorFontSize === s
                            ? 'bg-ink dark:bg-bone text-paper dark:text-slate-dark'
                            : 'bg-slate-100 dark:bg-slate-800 text-ink/60 dark:text-bone/60 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Voice section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Volume2 className="w-4 h-4 text-ink/40 dark:text-bone/40" />
                  <span className="font-sans text-xs font-medium text-ink/60 dark:text-bone/60 uppercase tracking-wider">Read Aloud Voice</span>
                  <button
                    onClick={() => {
                      const v = getAvailableVoices()
                      if (v.length > 0) setVoices(v)
                    }}
                    className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-ink/40 dark:text-bone/40 hover:text-ink dark:hover:text-bone hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-sans"
                    title="Refresh voice list"
                  >
                    Refresh ({voices.length} voices)
                  </button>
                </div>
                <select
                  value={preferredVoice}
                  onChange={(e) => setPreferredVoice(e.target.value)}
                  className="w-full mb-2 px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-sans text-xs text-ink dark:text-bone outline-none cursor-pointer"
                >
                  <option value="auto">Auto (best available)</option>
                  {voices.map(v => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang}) {v.local ? '[offline]' : '[online]'}
                    </option>
                  ))}
                </select>
                <p className="font-sans text-[10px] text-ink/30 dark:text-bone/30 leading-relaxed">
                  Natural voices marked [online] require internet. Install offline natural voices via Windows Settings for the best experience without connectivity.
                </p>
                <button
                  onClick={() => {
                    // Platform-appropriate voice settings
                    const isWindows = navigator.platform.includes('Win')
                    const url = isWindows
                      ? 'ms-settings:easeofaccess-narrator'
                      : 'x-apple.systempreferences:com.apple.preference.universalaccess?SpeakableItems'
                    openUrl(url).catch(() => {})
                  }}
                  className="mt-2 flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-ink/50 dark:text-bone/50 hover:text-ink dark:hover:text-bone hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-sans"
                >
                  <Download className="w-3 h-3" />
                  Install better voices (opens System Settings)
                </button>
              </div>

              {/* Keyboard section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Keyboard className="w-4 h-4 text-ink/40 dark:text-bone/40" />
                  <span className="font-sans text-xs font-medium text-ink/60 dark:text-bone/60 uppercase tracking-wider">Shortcuts</span>
                </div>
                <div className="space-y-1.5 font-sans text-xs text-ink/50 dark:text-bone/50">
                  {[
                    ['Cmd/Ctrl + B', 'Toggle Sidebar'],
                    ['Cmd/Ctrl + K', 'Command Palette'],
                    ['Cmd/Ctrl + ,', 'Settings'],
                    ['Cmd/Ctrl + S', 'Force Save'],
                    ['Cmd/Ctrl + P', 'Export PDF'],
                    ['Cmd/Ctrl + E', 'Export Markdown'],
                    ['/', 'Slash Commands'],
                  ].map(([key, action]) => (
                    <div key={key} className="flex items-center justify-between">
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-ink/60 dark:text-bone/60">{key}</kbd>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Companion section — collapsible */}
              <div>
                <button
                  onClick={() => setCompanionOpen(!companionOpen)}
                  className="flex items-center gap-2 w-full text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-1 py-1 -mx-1 transition-colors"
                >
                  <Heart className="w-4 h-4 text-ink/40 dark:text-bone/40" />
                  <span className="font-sans text-xs font-medium text-ink/60 dark:text-bone/60 uppercase tracking-wider">Companion</span>
                  <ChevronDown className={`w-3.5 h-3.5 ml-auto text-ink/30 dark:text-bone/30 transition-transform duration-200 ${companionOpen ? 'rotate-180' : ''}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: companionOpen ? 'auto' : 0, opacity: companionOpen ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5 pt-3">
                    {(['void','silence','obsidian','onyx','zenith','thevoid'] as const).map((t) => {
                      const labels: Record<string, string> = { void: 'Void — Free', silence: 'Silence — $3', obsidian: 'Obsidian — $5', onyx: 'Onyx — $8', zenith: 'Zenith — $12', thevoid: 'THE VOID — $25' }
                      return (
                        <button
                          key={t}
                          onClick={() => setTier(t, companionChoice, t === 'zenith' ? new Date().toISOString() : undefined)}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs font-sans transition-colors ${tier === t ? 'bg-ink dark:bg-bone text-paper dark:text-slate-dark' : 'text-ink/50 dark:text-bone/50 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                          {labels[t]}
                        </button>
                      )
                    })}
                    {tier === 'silence' && (
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => setTier('silence', 'cat')} className={`px-3 py-1 rounded text-xs ${companionChoice === 'cat' ? 'bg-ink dark:bg-bone text-paper dark:text-slate-dark' : 'bg-slate-100 dark:bg-slate-800 text-ink/50 dark:text-bone/50'}`}>Cat</button>
                        <button onClick={() => setTier('silence', 'dog')} className={`px-3 py-1 rounded text-xs ${companionChoice === 'dog' ? 'bg-ink dark:bg-bone text-paper dark:text-slate-dark' : 'bg-slate-100 dark:bg-slate-800 text-ink/50 dark:text-bone/50'}`}>Dog</button>
                      </div>
                    )}
                    {tier !== 'void' && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-sans text-[11px] text-ink/40 dark:text-bone/40">Size</span>
                          <span className="font-sans text-[10px] text-ink/30 dark:text-bone/30">{companionSize}px</span>
                        </div>
                        <input type="range" min="32" max="200" step="4" value={companionSize} onChange={(e) => setCompanionSize(parseInt(e.target.value))} className="w-full h-1 rounded-full appearance-none bg-slate-200 dark:bg-slate-700 accent-ink dark:accent-bone cursor-pointer" />
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* About */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center justify-between">
                <div>
                  <div className="font-serif text-sm text-ink dark:text-bone">Zenith</div>
                  <div className="font-sans text-[10px] text-ink/30 dark:text-bone/30">v1.1.2 · Offline-first</div>
                </div>
                <Type className="w-5 h-5 text-ink/20 dark:text-bone/20" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SettingsPanel
