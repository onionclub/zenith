import { motion, useMotionValue } from 'framer-motion'
import { useMemo, useEffect } from 'react'
import useStore from '../store/useStore'
import SleepingCat from '../companions/SleepingCat'
import LoyalDog from '../companions/LoyalDog'
import Bonsai from '../companions/Bonsai'
import Hourglass from '../companions/Hourglass'
import Constellation from '../companions/Constellation'
import Monolith from '../companions/Monolith'

const companions = {
  cat: SleepingCat,
  dog: LoyalDog,
}

const POS_KEY = 'zenith_companion_pos'

function loadPos(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(POS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { x: -1, y: -1 }
}

function savePos(x: number, y: number) {
  try { localStorage.setItem(POS_KEY, JSON.stringify({ x, y })) } catch { /* ignore */ }
}

function Companion() {
  const tier = useStore((s) => s.tier)
  const companionChoice = useStore((s) => s.companionChoice)
  const companionSize = useStore((s) => s.companionSize)
  const uiScale = useStore((s) => s.uiScale)

  const saved = loadPos()
  const defaultX = saved.x > 0 ? saved.x : window.innerWidth - companionSize - 40
  const defaultY = saved.y > 0 ? saved.y : 24

  const mx = useMotionValue(defaultX)
  const my = useMotionValue(defaultY)

  useEffect(() => {
    const unsubX = mx.on('change', (v) => savePos(v, my.get()))
    const unsubY = my.on('change', (v) => savePos(mx.get(), v))
    return () => { unsubX(); unsubY() }
  }, [mx, my])

  const Component = useMemo(() => {
    switch (tier) {
      case 'void': return null
      case 'silence': return companions[companionChoice]
      case 'obsidian': return Bonsai
      case 'onyx': return Hourglass
      case 'zenith': return Constellation
      case 'thevoid': return Monolith
      default: return null
    }
  }, [tier, companionChoice])

  if (!Component) return null

  return (
    <motion.div
      drag
      dragMomentum={false}
      style={{
        position: 'fixed',
        x: mx,
        y: my,
        width: companionSize,
        height: companionSize,
        cursor: 'grab',
        zIndex: 9999,
        color: '#6B5D4F',
        zoom: uiScale,
      }}
    >
      <Component />
    </motion.div>
  )
}

export default Companion
