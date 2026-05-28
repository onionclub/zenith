import { useState, useRef, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/core'
import { Bold, Italic, Underline, Strikethrough, Code, Highlighter, Palette, Type, Minus, Plus, Volume2, VolumeX } from 'lucide-react'
import useStore from '../store/useStore'
import { startReadingFrom, stopReading, isReading, getStopIndex } from '../lib/tts'

interface Props { editor: Editor }

const FONT_FAMILIES = [
  { label: 'Literata', value: 'Literata', tag: 'Classic book' },
  { label: 'Spectral', value: 'Spectral', tag: 'Modern editorial' },
  { label: 'Alegreya', value: 'Alegreya', tag: 'Warm literary' },
  { label: 'Cormorant', value: 'Cormorant', tag: 'Sharp & refined' },
  { label: 'Source Sans 3', value: 'Source Sans 3', tag: 'Natural humanist' },
  { label: 'Poppins', value: 'Poppins', tag: 'Geometric clean' },
  { label: 'Inter', value: 'Inter', tag: 'Neutral Swiss' },
  { label: 'Sora', value: 'Sora', tag: 'Wide & confident' },
  { label: 'Barlow Condensed', value: 'Barlow Condensed', tag: 'Narrow & dense' },
  { label: 'JetBrains Mono', value: 'JetBrains Mono', tag: 'Code precision' },
  { label: 'Cutive Mono', value: 'Cutive Mono', tag: 'Typewriter' },
  { label: 'Nunito', value: 'Nunito', tag: 'Soft & friendly' },
  { label: 'Zilla Slab', value: 'Zilla Slab', tag: 'Bold slab' },
]
const COLORS = ['#b8a898', '#d4cfc4', '#f9f8f4', '#121212', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#78716C']
const SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px']

function FormattingToolbar({ editor }: Props) {
  const uiScale = useStore((s) => s.uiScale)
  const preferredVoice = useStore((s) => s.preferredVoice)
  const [showColor, setShowColor] = useState(false)
  const [showFont, setShowFont] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const cr = useRef<HTMLDivElement>(null)
  const fr = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (cr.current && !cr.current.contains(e.target as Node)) setShowColor(false)
      if (fr.current && !fr.current.contains(e.target as Node)) setShowFont(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const ac = editor.getAttributes('textStyle').color || null
  const af = editor.getAttributes('textStyle').fontFamily || null

  const handleReadAloud = useCallback(() => {
    if (isPlaying || isReading()) {
      // Stop — keep the last-read sentence highlighted so user sees where they were
      stopReading()
      setIsPlaying(false)
      return
    }

    const { from, to, empty } = editor.state.selection

    // If user has new text selected, read that. Otherwise read full doc.
    const hasNewSelection = !empty

    const text = hasNewSelection
      ? editor.state.doc.textBetween(from, to, ' ')
      : editor.state.doc.textContent

    if (!text.trim()) return

    const sentences = text.match(/[^.!?\n]+[.!?\n]*/g)?.map(s => s.trim()).filter(s => s.length > 0) || [text]
    const resumeIdx = hasNewSelection ? 0 : getStopIndex()

    setIsPlaying(true)

    const highlightSentence = (idx: number) => {
      const sentenceText = sentences[idx]
      if (!sentenceText) return
      const fullText = editor.state.doc.textContent

      let pos = 0
      for (let i = 0; i < idx; i++) {
        const s = sentences[i]
        const found = fullText.indexOf(s, pos)
        if (found >= 0) pos = found + s.length
      }

      const start = fullText.indexOf(sentenceText, pos)
      if (start >= 0) {
        editor.commands.setTextSelection({ from: start + 1, to: start + 1 + sentenceText.length })
        const { view } = editor
        const coords = view.coordsAtPos(start + 1)
        if (coords) {
          const scrollContainer = view.dom.closest('.overflow-y-auto')
          if (scrollContainer) {
            scrollContainer.scrollTo({ top: scrollContainer.scrollTop + coords.top - scrollContainer.clientHeight / 3, behavior: 'smooth' })
          }
        }
      }
    }

    startReadingFrom(
      text,
      resumeIdx,
      (idx) => highlightSentence(idx),
      () => {
        setIsPlaying(false)
        const end = editor.state.doc.content.size
        editor.commands.setTextSelection({ from: end, to: end })
      },
      preferredVoice || undefined,
    )
  }, [editor, isPlaying, preferredVoice])

  const Btn = ({ on, click, icon, title }: { on?: boolean; click: () => void; icon: React.ReactNode; title: string }) => (
    <button type="button" onClick={click} className={`p-1 rounded transition-colors ${on ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white hover:bg-white/8'}`} title={title}>{icon}</button>
  )

  return (
    <div className="fixed top-6 left-0 right-0 z-45 flex justify-center pointer-events-none">
      {/* 40px invisible hover zone with CSS :hover to reveal toolbar */}
      <div className="group pointer-events-auto" style={{ zoom: uiScale }}>
        {/* Invisible hit area — inverse-scale so it stays physically consistent */}
        <div style={{ height: `${32 / uiScale}px` }} />
        {/* Actual toolbar — appears on hover via CSS group-hover */}
        <div className="flex items-center gap-0.5 px-3 py-1.5 rounded-lg bg-slate-900/95 backdrop-blur-md border border-slate-700/40 shadow-lg opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-auto">
          <div ref={fr} className="relative">
            <button onClick={() => setShowFont(!showFont)} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-sans text-white/60 hover:text-white hover:bg-white/10 transition-colors"><Type className="w-3 h-3" />{FONT_FAMILIES.find(f => f.value === af)?.label || 'Inter'}</button>
            {showFont && (
              <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2 z-50 w-[220px] max-h-[360px] overflow-y-auto">
                {FONT_FAMILIES.map(f => <button key={f.value} onClick={() => { editor.chain().focus().setFontFamily(f.value).run(); setShowFont(false) }} className={`w-full text-left px-2.5 py-1.5 rounded mb-0.5 ${f.value === af ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                  <div className="text-[15px] leading-tight" style={{fontFamily: f.value}}>{f.label}</div>
                  <div className="text-[10px] text-white/35 mt-0.5">{f.tag}</div>
                </button>)}
              </div>
            )}
          </div>
          <span className="w-px h-3 bg-white/15" />
          <Btn click={() => { const i = SIZES.indexOf(useStore.getState().editorFontSize); useStore.getState().setEditorFontSize(SIZES[i>0?i-1:0]) }} icon={<Minus className="w-3 h-3"/>} title="Smaller" />
          <span className="text-[11px] font-sans text-white/60 min-w-[28px] text-center select-none">{useStore((s) => s.editorFontSize)}</span>
          <Btn click={() => { const i = SIZES.indexOf(useStore.getState().editorFontSize); useStore.getState().setEditorFontSize(SIZES[i<SIZES.length-1?i+1:SIZES.length-1]) }} icon={<Plus className="w-3 h-3"/>} title="Larger" />
          <span className="w-px h-3 bg-white/15" />
          <Btn on={editor.isActive('bold')} click={() => editor.chain().focus().toggleBold().run()} icon={<Bold className="w-3 h-3"/>} title="Bold" />
          <Btn on={editor.isActive('italic')} click={() => editor.chain().focus().toggleItalic().run()} icon={<Italic className="w-3 h-3"/>} title="Italic" />
          <Btn on={editor.isActive('underline')} click={() => editor.chain().focus().toggleUnderline().run()} icon={<Underline className="w-3 h-3"/>} title="Underline" />
          <Btn on={editor.isActive('strike')} click={() => editor.chain().focus().toggleStrike().run()} icon={<Strikethrough className="w-3 h-3"/>} title="Strikethrough" />
          <Btn on={editor.isActive('code')} click={() => editor.chain().focus().toggleCode().run()} icon={<Code className="w-3 h-3"/>} title="Code" />
          <Btn on={editor.isActive('highlight')} click={() => editor.chain().focus().toggleHighlight().run()} icon={<Highlighter className="w-3 h-3"/>} title="Highlight" />
          <Btn on={isPlaying} click={handleReadAloud} icon={isPlaying ? <VolumeX className="w-3 h-3"/> : <Volume2 className="w-3 h-3"/>} title={isPlaying ? 'Stop reading' : 'Read aloud (selection or full doc)'} />
          <span className="w-px h-3 bg-white/15" />
          <div ref={cr} className="relative">
            <button onClick={() => setShowColor(!showColor)} className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10" title="Color"><Palette className="w-3 h-3"/></button>
            {ac && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-0.5 rounded-full" style={{backgroundColor:ac}}/>}
            {showColor && (
              <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-3 z-50">
                <div className="grid grid-cols-6 gap-1.5">{COLORS.map(c => <button key={c} onClick={() => { editor.chain().focus().setColor(c).run(); setShowColor(false) }} className="w-7 h-7 rounded border border-white/10 hover:scale-110 transition-transform" style={{backgroundColor:c}} title={c}/>)}</div>
                <button onClick={() => { editor.chain().focus().unsetColor().run(); setShowColor(false) }} className="w-full mt-2 text-[10px] text-white/40 hover:text-white/70">Reset</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormattingToolbar
