import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

function Monolith() {
  const [state, setState] = useState<'normal' | 'rotate' | 'open' | 'light'>('normal')
  const [text, setText] = useState('')

  useEffect(() => {
    const check = () => {
      const now = new Date()
      const h = now.getHours()
      const m = now.getMinutes()
      const d = now.getDate()
      const mo = now.getMonth()

      if (mo === 0 && d === 1) { setState('light'); setText(''); return }
      if (d === 1) { setState('open'); setText('new\nmoon'); return }
      if (h === 23 && m >= 59 || h === 0 && m <= 1) { setState('rotate'); return }
      setState('normal')
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  // Anniversary tone
  useEffect(() => {
    if (state !== 'light') return
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 40
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 3)
    } catch { /* audio not available */ }
  }, [state])

  if (state === 'light') {
    return (
      <motion.div className="relative w-8 h-16"
        animate={{ opacity: [1, 0] }} transition={{ duration: 10 }}
      >
        <motion.div className="absolute inset-0"
          initial={{ scale: 0 }} animate={{ scale: 50 }}
          transition={{ duration: 3, ease: 'easeOut' }}
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
        />
      </motion.div>
    )
  }

  if (state === 'open') {
    return (
      <motion.div className="relative w-8 h-16"
        animate={{ opacity: [1, 1, 0] }} transition={{ duration: 30, times: [0, 0.9, 1] }}
      >
        <motion.div className="absolute left-0 top-0 bottom-0 w-[14px] bg-current rounded-sm"
          animate={{ x: [0, -3] }} transition={{ duration: 1 }}
          style={{ clipPath: 'inset(0 0 0 0)' }}
        />
        <motion.div className="absolute right-0 top-0 bottom-0 w-[14px] bg-current rounded-sm"
          animate={{ x: [0, 3] }} transition={{ duration: 1 }}
          style={{ clipPath: 'inset(0 0 0 0)' }}
        />
        <motion.div className="absolute inset-0 flex items-center justify-center font-mono text-[6px] text-current"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        >
          {text}
        </motion.div>
      </motion.div>
    )
  }

  if (state === 'rotate') {
    return (
      <motion.div className="w-8 h-16 bg-current rounded-sm"
        animate={{ rotateY: [0, 90, 0] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'easeInOut' }}
        style={{ perspective: 200 }}
      />
    )
  }

  return <div className="w-8 h-16 bg-current rounded-sm opacity-80" />
}
export default Monolith
