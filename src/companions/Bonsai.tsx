import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'

const leafPositions = [
  { x: 10, y: 8 }, { x: 16, y: 4 }, { x: 24, y: 3 }, { x: 32, y: 4 }, { x: 38, y: 8 },
  { x: 8, y: 16 }, { x: 14, y: 12 }, { x: 22, y: 10 }, { x: 30, y: 10 }, { x: 38, y: 12 }, { x: 40, y: 15 },
  { x: 12, y: 20 },
]

function Bonsai() {
  const [fallingLeaf, setFallingLeaf] = useState<number | null>(null)

  const triggerLeaf = useCallback(() => {
    const idx = Math.floor(Math.random() * leafPositions.length)
    setFallingLeaf(idx)
    setTimeout(() => setFallingLeaf(null), 2000)
  }, [])

  useEffect(() => {
    const interval = setInterval(triggerLeaf, 90000)
    return () => clearInterval(interval)
  }, [triggerLeaf])

  return (
    <motion.svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      {/* Trunk - slow sway */}
      <motion.path d="M24 44 L23 30 L22 26"
        animate={{ rotate: [-0.5, 0.5, -0.5] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '24px 44px' }}
      />
      {/* Branches */}
      <path d="M23 28 L16 22 L10 23" />
      <path d="M23 26 L18 18 L14 14" />
      <path d="M24 24 L24 16 L20 10" />
      <path d="M24 24 L30 18 L34 14" />
      <path d="M23 28 L30 22 L38 23" />
      {/* Pot */}
      <rect x="18" y="41" width="12" height="7" rx="1" />
      <path d="M16 41 L20 41 M32 41 L28 41" strokeWidth="0.8" />

      {/* Leaves - each with staggered wave rotation */}
      {leafPositions.map((l, i) => (
        <motion.ellipse
          key={i}
          cx={l.x} cy={l.y} rx="3" ry="1.5"
          animate={{
            rotate: [-4, 4, -4],
            opacity: fallingLeaf === i ? [1, 0] : 1,
            cy: fallingLeaf === i ? [l.y, l.y + 20] : l.y,
          }}
          transition={{
            rotate: { duration: 3, delay: i * 0.4, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 2 },
            cy: { duration: 2 },
          }}
          style={{ transformOrigin: `${l.x}px ${l.y}px` }}
          strokeWidth="0.8"
        />
      ))}
    </motion.svg>
  )
}
export default Bonsai
