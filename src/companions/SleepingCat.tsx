import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'

function SleepingCat() {
  const controls = useAnimationControls()

  useEffect(() => {
    const interval = setInterval(() => { controls.start({ scaleX: [1, 1.15, 1] }, { duration: 2 }) }, 60000)
    return () => clearInterval(interval)
  }, [controls])

  return (
    <motion.svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <motion.ellipse cx="24" cy="30" rx="16" ry="12"
        animate={{ scaleY: [1, 1.03, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '24px 30px' }}
      />
      <circle cx="24" cy="20" r="10" />
      <motion.path d="M17 14 L15 6 L21 12"
        animate={{ rotate: [0, -5, 0] }} transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 11.7, ease: 'easeOut' }}
        style={{ transformOrigin: '17px 14px' }}
      />
      <motion.path d="M31 14 L33 6 L27 12"
        animate={{ rotate: [0, 5, 0] }} transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 11.7, ease: 'easeOut' }}
        style={{ transformOrigin: '31px 14px' }}
      />
      <path d="M19 21 Q21 22 23 21" />
      <path d="M25 21 Q27 22 29 21" />
      <path d="M23 24 L24 25 L25 24" />
      <path d="M16 23 L10 22 M16 25 L10 25 M32 23 L38 22 M32 25 L38 25" strokeWidth="0.6" />
      <motion.path d="M8 32 Q2 28 4 22"
        animate={{ rotate: [-8, 8, -8] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '8px 32px' }}
      />
      <motion.ellipse cx="24" cy="30" rx="16" ry="12"
        animate={controls} style={{ transformOrigin: '24px 30px' }}
        fill="none" stroke="currentColor" strokeWidth="1.2"
      />
    </motion.svg>
  )
}

export default SleepingCat
