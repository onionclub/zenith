import { motion, useMotionValue } from 'framer-motion'
import { useMemo, useEffect, useState } from 'react'
import useStore from '../store/useStore'
import SleepingCat from '../companions/SleepingCat'
import LoyalDog from '../companions/LoyalDog'
import Bonsai from '../companions/Bonsai'
import Hourglass from '../companions/Hourglass'
import Constellation from '../companions/Constellation'
import Monolith from '../companions/Monolith'

const companions = { cat: SleepingCat, dog: LoyalDog }
const POS_KEY = 'zenith_companion_pos'

// Validate saved position is actually on-screen
function loadPos(windowW: number, windowH: number, size: number): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(POS_KEY)
    if (raw) {
      const pos = JSON.parse(raw)
      // Only use saved position if it keeps the companion at least partially visible
      if (pos.x > -size && pos.x < windowW && pos.y > -size && pos.y < windowH) {
        return pos
      }
      // Saved position is off-screen — clear it
      localStorage.removeItem(POS_KEY)
    }
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
  const [winSize, setWinSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  // Track window size for drag constraints
  useEffect(() => {
    const onResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const saved = loadPos(winSize.w, winSize.h, companionSize)
  const defaultX = saved.x >= 0 ? saved.x : winSize.w - companionSize - 40
  const defaultY = saved.y >= 0 ? saved.y : 24

  const mx = useMotionValue(defaultX)
  const my = useMotionValue(defaultY)

  useEffect(() => {
    const unsubX = mx.on('change', (v) => savePos(v, my.get()))
    const unsubY = my.on('change', (v) => savePos(mx.get(), v))
    return () => { unsubX(); unsubY() }
  }, [mx, my])

  const Comp = useMemo(() => {
    switch (tier) {
      case 'void': return null
      case 'silence': return companions[companionChoice] || SleepingCat
      case 'obsidian': return Bonsai
      case 'onyx': return Hourglass
      case 'zenith': return Constellation
      case 'thevoid': return Monolith
      default: return null
    }
  }, [tier, companionChoice])

  if (!Comp) return null

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{ left: 0, right: winSize.w - companionSize, top: 0, bottom: winSize.h - companionSize }}
      style={{
        position: 'fixed',
        x: mx,
        y: my,
        width: companionSize,
        height: companionSize,
        cursor: 'grab',
        zIndex: 9999,
        color: '#8B7355',
        zoom: uiScale,
      }}
    >
      <Comp />
    </motion.div>
  )
}

export default Companion
