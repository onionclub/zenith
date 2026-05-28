import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

function Hourglass() {
  const [flipped, setFlipped] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 1) { setFlipped(true); setTimeout(() => { setFlipped(false); setProgress(0) }, 1500); return 1 }
        return p + 1 / 600 // 60s at ~10fps
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
      animate={{ rotate: flipped ? 180 : 0 }} transition={{ duration: 1.5, ease: 'easeInOut' }}
      style={{ transformOrigin: '24px 24px' }}
    >
      {/* Frame */}
      <rect x="14" y="4" width="20" height="4" rx="1" />
      <rect x="14" y="40" width="20" height="4" rx="1" />
      <path d="M14 8 L24 24 L34 8" />
      <path d="M14 40 L24 24 L34 40" />
      {/* Top sand */}
      <motion.rect x="15" y="8" width="18" height="16"
        animate={{ scaleY: 1 - progress }} transition={{ duration: 0.1 }}
        style={{ transformOrigin: '24px 8px' }}
        fill="currentColor" stroke="none" opacity="0.3"
      />
      {/* Bottom sand */}
      <motion.rect x="15" y="24" width="18" height="16"
        animate={{ scaleY: progress }} transition={{ duration: 0.1 }}
        style={{ transformOrigin: '24px 40px' }}
        fill="currentColor" stroke="none" opacity="0.3"
      />
      {/* Sand grains falling */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.circle key={i} cx={24} cy={24} r="0.8" fill="currentColor" stroke="none"
          animate={{ cy: [24, 24 + 16 * progress] }}
          transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </motion.svg>
  )
}
export default Hourglass
